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
import com.onshape.api.responses.AssembliesCreateTranslationResponse;
import com.onshape.api.responses.DocumentsDownloadExternalDataResponse;
import com.onshape.api.responses.TranslationsGetTranslatorFormatsResponseItems;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.model.ExportFormat;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class ExportsService {

    private final Onshape onshape;

    public ExportsService(Onshape onshape) {
        this.onshape = onshape;
    }

    public List<ExportFormat> getFormats() throws OnshapeException {
        List<ExportFormat> out = new ArrayList<>();
        for (TranslationsGetTranslatorFormatsResponseItems item : onshape.translations().getTranslatorFormats().call().getItems()) {
            if (item.getValidDestinationFormat() && item.getCouldBeAssembly() && !item.getName().equals("ONSHAPE")) {
                ExportFormat format = new ExportFormat();
                format.setName(item.getName());
                out.add(format);
            }
        }
        return out;
    }

    public InputStream export(OnshapeDocument document, String configuration, String format) throws OnshapeException {
//        if("GLTF".equals(format.toUpperCase())){
//            System.out.println("it's a GLTF");
//
//        }
                    System.out.println(format);

        try {
            // Start the translation process
            CompletableFuture<AssembliesCreateTranslationResponse> exportFuture
                    = onshape.call("post", "/assemblies/d/:did/[wv]/:wv/e/:eid/translations",
                            onshape.buildMap("formatName", format.toUpperCase(), "storeInDocument", Boolean.FALSE, "configuration", configuration),
                            onshape.buildMap("did", document.getDocumentId(), "wvType", document.getWV(), "wv", document.getWVId(), "eid", document.getElementId()),
                            onshape.buildMap(),
                            AssembliesCreateTranslationResponse.class).asFuture(onshape);

            // Wait for completion of the translation process
            AssembliesCreateTranslationResponse export = exportFuture.get();
            if(!"DONE".equals(export.getRequestState())) {
                throw new OnshapeException("Translation failed: " + export.getFailureReason());
            }

            // Download the translated file
            DocumentsDownloadExternalDataResponse download
                    = onshape.documents().downloadExternalData()
                            .call(export.getResultExternalDataIds()[0], export.getDocumentId());
            return download.getData().toInputStream();
        } catch (ExecutionException | InterruptedException ex) {
            throw new OnshapeException("Error while waiting for translation to complete", ex);
        }
    }
}
