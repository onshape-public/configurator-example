/*
 * The MIT License
 *
 * Copyright 2019 Onshape Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package com.onshape.configurator.services;

import com.onshape.api.Onshape;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.responses.AppElementsResolveReferencesResponse;
import com.onshape.api.responses.AppElementsResolveReferencesResponseResolvedReferences;
import com.onshape.api.responses.AppElementsUpdateReferenceResponse;
import com.onshape.api.responses.DocumentsDownloadExternalDataResponse;
import com.onshape.api.responses.DocumentsGetElementListResponseElements;
import com.onshape.api.responses.DrawingsCreateTranslationResponse;
import com.onshape.api.types.Blob;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.model.ConfigurableDrawing;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class DrawingsService {

    private final Onshape onshape;
    private final DocumentLockService documentLockService;
    private final ExecutorService executor = Executors.newWorkStealingPool();

    public DrawingsService(Onshape onshape) {
        this.onshape = onshape;
        this.documentLockService = DocumentLockService.getInstance(onshape);
    }

    public ConfigurableDrawing getDrawing(OnshapeDocument assembly, OnshapeDocument drawing) throws OnshapeException {
        ConfigurableDrawing cd = new ConfigurableDrawing();
        DocumentsGetElementListResponseElements element = onshape.documents().getElementList()
                .elementId(drawing.getElementId()).call(drawing).getElements()[0];
        cd.setName(element.getName());
        cd.setFromDocument(drawing);
        return cd;
    }

    public Blob getConfiguredDrawing(OnshapeDocument assembly, OnshapeDocument drawingElement, String configuration) throws OnshapeException {
        // Replace versioned references with editable Workspace
        final OnshapeDocument drawing = documentLockService.getWritable(drawingElement);
        try {
            // Resolve the references to identify those that relate to the assembly
            AppElementsResolveReferencesResponse resolvedReferences = onshape.appElements().resolveReferences()
                    //                    .referenceIds(Joiner.on(',').join(references))
                    .call(drawing);

            // Infer the current configuration from any references to the assembly element
            Set<String> currentConfigurations = Stream.of(resolvedReferences.getResolvedReferences())
                    .filter((resolvedReference) -> resolvedReference.getIsConfigurable()
                    && resolvedReference.getTargetDocumentId().equals(assembly.getDocumentId())
                    && resolvedReference.getTargetElementId().equals(assembly.getElementId())
                    && !resolvedReference.getTargetConfiguration().equals(configuration))
                    .map((resolvedReference) -> resolvedReference.getTargetConfiguration())
                    .collect(Collectors.toSet());
            if (currentConfigurations.size() > 1) {
                throw new OnshapeException("References found with multiple target configurations to same element in drawing " + drawing);
            }

            if (currentConfigurations.size() >= 1) {
                // In parallel, find references with the current configuration and apply the configuration to them
                List<Future<AppElementsUpdateReferenceResponse>> updateResponses = new ArrayList<>();
                for (final AppElementsResolveReferencesResponseResolvedReferences resolvedReference : resolvedReferences.getResolvedReferences()) {
                    // We are only interested if it matches the current configuration
                    if (resolvedReference.getIsConfigurable()
                            && currentConfigurations.contains(resolvedReference.getTargetConfiguration())) {
                        updateResponses.add(executor.submit(new Callable<AppElementsUpdateReferenceResponse>() {
                            @Override
                            public AppElementsUpdateReferenceResponse call() throws Exception {
                                // Update the configuration of the reference
                                return onshape.appElements().updateReference()
                                        .targetElementId(resolvedReference.getTargetElementId())
                                        .targetConfiguration(configuration)
                                        .targetMicroversionId(resolvedReference.getResolvedDocumentMicroversionId())
                                        .call(drawing, resolvedReference.getReferenceId());
                            }
                        }));
                    }
                }
                for (Future<AppElementsUpdateReferenceResponse> response : updateResponses) {
                    response.get();
                }

                // Sync the drawing to ensure configurations have been updated
                String syncResult = onshape.call("POST", "/documents/d/:did/w/:wid/syncApplicationElements",
                        new HashMap<>(),
                        onshape.buildMap("did", drawing.getDocumentId(),
                                "wid", drawing.getWorkspaceId()),
                        onshape.buildMap("applicationElementIds", drawing.getElementId()),
                        String.class);
            }

            // Start the translation process
            CompletableFuture<DrawingsCreateTranslationResponse> translation = onshape.drawings().createTranslation()
                    .formatName("PDF")
                    .colorMethod("color")
                    .destinationName("export")
                    .notifyUser(Boolean.FALSE)
                    .storeInDocument(Boolean.FALSE)
                    .selectablePdfText(Boolean.TRUE)
                    .linkDocumentWorkspaceId(drawing.getWorkspaceId())
                    .call(drawing).asFuture(onshape);

            // Wait for completion of the translation process
            DrawingsCreateTranslationResponse completedTranslation = translation.get();
            if (!"DONE".equals(completedTranslation.getRequestState())) {
                throw new OnshapeException("Drawing translation failed: " + completedTranslation.getFailureReason());
            }

            // Download the translation result
            DocumentsDownloadExternalDataResponse download = onshape.documents().downloadExternalData()
                    .call(completedTranslation.getResultExternalDataIds()[0], completedTranslation.getResultDocumentId());
            return download.getData();
        } catch (ExecutionException | InterruptedException ex) {
            throw new OnshapeException("Error while waiting for translation completion", ex);
        } finally {
            documentLockService.release(drawing);
        }
    }
}
