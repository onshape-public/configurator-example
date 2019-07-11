/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.onshape.configurator;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.Joiner;
import com.google.common.collect.Iterables;
import com.onshape.api.Onshape;
import com.onshape.api.desktop.OnshapeDesktop;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.responses.AppElementsResolveReferencesResponse;
import com.onshape.api.responses.AppElementsResolveReferencesResponseResolvedReferences;
import com.onshape.api.responses.DocumentsUpdateExternalReferencesToLatestDocumentsResponse;
import com.onshape.api.types.OnshapeDocument;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.Test;

/**
 *
 * @author peter
 */
public class DrawingsTest {
//
//    @Test
//    public void test() throws OnshapeException {
//        Onshape onshape = new Onshape();
//        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
//                System.getenv("ONSHAPE_API_SECRETKEY"));
//        OnshapeDocument assembly = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/w/8a8c9fb7f12ace4bfb9f4dad/e/a8d9da8f108b44b9fa903800");
//        OnshapeDocument drawing = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/w/8a8c9fb7f12ace4bfb9f4dad/e/3bf4a4a09776df4e40ef85ed");
//        DocumentsCopyWorkspaceResponse copy = onshape.documents().copyWorkspace()
//                .newName("Temporary Copy")
//                .call(assembly);
//        DocumentsGetDocumentResponse document = onshape.documents().getDocument().call(copy.getNewDocumentId());
//        System.out.println(document);
//
//        onshape.documents().deleteDocument().call(copy.getNewDocumentId());
//    }

//    @Test
//    public void formats() throws OnshapeException, IOException, InterruptedException, ExecutionException {
//        Onshape onshape = new Onshape();
//        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
//                System.getenv("ONSHAPE_API_SECRETKEY"));
//        OnshapeDocument drawing = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/w/8a8c9fb7f12ace4bfb9f4dad/e/3bf4a4a09776df4e40ef85ed");
//        for(DrawingsGetTranslationFormatsResponseItems format : onshape.drawings().getTranslationFormats().call(drawing).getItems()) {
//            System.out.println(format.getName());
//        }
//        // Start the translation process
//        CompletableFuture<DrawingsCreateTranslationResponse> translation = onshape.drawings().createTranslation()
//                .formatName("PDF")
//                .colorMethod("color")
//                .destinationName("export")
//                .notifyUser(Boolean.FALSE)
//                .storeInDocument(Boolean.FALSE)
//                .selectablePdfText(Boolean.TRUE)
//                .linkDocumentWorkspaceId(drawing.getWorkspaceId())
//                .call(drawing).asFuture(onshape);
//        System.out.println("Started translation");
//        // Wait for completion of the translation process
//        DrawingsCreateTranslationResponse completedTranslation = translation.get();
//        System.out.println("Finished translation");
//        for(String fid : completedTranslation.getResultExternalDataIds()) {
//            DocumentsDownloadExternalDataResponse download = onshape.documents().downloadExternalData()
//                    .call(fid, completedTranslation.getResultDocumentId());
//            download.getData().toFile(new File(new File(System.getProperty("user.dir")), "target/export.pdf"));
//            System.out.println("Downloaded");
//        }
//    }
    @Test
    public void views() throws OnshapeException {
        Onshape onshape = new Onshape();
//        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
//                System.getenv("ONSHAPE_API_SECRETKEY"));
        OnshapeDesktop desktop = new OnshapeDesktop(System.getenv("ONSHAPE_CLIENTID"), System.getenv("ONSHAPE_CLIENTSECRET"));
        desktop.setupClient(onshape);
        OnshapeDocument drawing = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/w/8a8c9fb7f12ace4bfb9f4dad/e/3bf4a4a09776df4e40ef85ed");
        JsonNode views = onshape.call("GET",
                "/appelements/d/:did/[wvm]/:wvm/e/:eid/views",
                null,
                onshape.buildMap("did", drawing.getDocumentId(),
                        "wvmType", drawing.getWVM(),
                        "wvm", drawing.getWVMId(),
                        "eid", drawing.getElementId()),
                onshape.buildMap(),
                JsonNode.class);
        List<String> references = new ArrayList<>();
        for (int i = 0; i < views.get("items").size(); i++) {
            views.get("items").get(i).fields().forEachRemaining((entry) -> {
                if (entry.getKey().endsWith("eferenceId")) {
                    references.add(entry.getValue().asText());
                }
            });
        }
        AppElementsResolveReferencesResponse resolvedReferences = onshape.appElements().resolveReferences()
                .referenceIds(Joiner.on(',').join(references))
                .call(drawing);
        Set<String> targetElements = new HashSet<>();
        for (AppElementsResolveReferencesResponseResolvedReferences resolvedReference : resolvedReferences.getResolvedReferences()) {
            // We are only interested if it is internal references as this document is being configured
            if (resolvedReference.getIsConfigurable() 
                    && resolvedReference.getTargetDocumentId().equals(drawing.getDocumentId())) {
                // TODO: Update configuration HERE   
                //onshape.appElements().updateReference().targetConfiguration(value)
                targetElements.add(resolvedReference.getTargetElementId());
            }
        }
        System.out.println("Referenced elements: " + targetElements);
        // Update references in the drawing element
        DocumentsUpdateExternalReferencesToLatestDocumentsResponse referenceUpdateResult = onshape.documents()
                .updateExternalReferencesToLatestDocuments()
                .elements(Iterables.toArray(targetElements, String.class))
                .call(drawing);
        System.out.println(referenceUpdateResult);
        String syncResult = onshape.call("POST", "/documents/d/:did/w/:wid/syncApplicationElements",
                new HashMap<>(),
                onshape.buildMap("did", drawing.getDocumentId(),
                        "wid", drawing.getWorkspaceId()),
                onshape.buildMap("applicationElementIds", drawing.getElementId()),
                String.class);
        System.out.println(syncResult);
    }
//    
//    @Test
//    public void listDrawings() throws OnshapeException {
//        Onshape onshape = new Onshape();
//        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
//                System.getenv("ONSHAPE_API_SECRETKEY"));
//        OnshapeDocument drawing = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/w/8a8c9fb7f12ace4bfb9f4dad/e/3bf4a4a09776df4e40ef85ed");
//        DocumentsGetElementListResponse elements = onshape.documents().getElementList()
//                .withThumbnails(Boolean.TRUE)
//                .elementType("APPLICATION")
//                .call(drawing.getDocumentId(), drawing.getWVM(), drawing.getWVMId());
//        System.out.println(elements);
//    }
}
