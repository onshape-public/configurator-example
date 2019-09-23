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
import com.onshape.api.responses.MetadataGetPartMetadataResponse;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.model.Appearance;
import java.util.Map;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class PartsService {

    private final Onshape onshape;

    public PartsService(Onshape onshape) {
        this.onshape = onshape;
    }

    public Appearance getAppearance(OnshapeDocument document, String partId, String configurationString) throws OnshapeException {
        // Note: The following does not use the client request object as the configuration parameter is missing
        MetadataGetPartMetadataResponse partMeta = onshape.call("get",
                "/metadata/d/:did/[wvm]/:wvm/e/:eid/p/:pid",
                null,
                onshape.buildMap("pid", partId, 
                        "did", document.getDocumentId(), 
                        "wvmType", document.getWVM(), 
                        "wvm", document.getWVMId(), 
                        "eid", document.getElementId()),
                onshape.buildMap("configuration", configurationString),
                MetadataGetPartMetadataResponse.class);
        Appearance appearance = new Appearance();
        appearance.setOpacity(1);
        appearance.setColor(new Number[]{0, 0, 0});
        for (Map property : partMeta.getProperties()) {
            if ("Appearance".equals(property.get("name"))) {
                Map value = (Map) property.get("value");
                appearance.setOpacity((Number) value.get("opacity"));
                Map color = (Map) value.get("color");
                Number red = (Number) color.get("red");
                Number green = (Number) color.get("green");
                Number blue = (Number) color.get("blue");
                appearance.setColor(new Number[]{red, green, blue});
                return appearance;
            }
        }
        return appearance;
    }
}
