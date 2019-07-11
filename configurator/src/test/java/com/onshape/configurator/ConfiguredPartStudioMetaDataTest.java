/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.onshape.configurator;

import com.onshape.api.Onshape;
import com.onshape.api.desktop.OnshapeDesktop;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.responses.MetadataGetPartMetadataResponse;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.model.Appearance;
import java.util.Map;
import org.junit.Test;

/**
 *
 * @author peter
 */
public class ConfiguredPartStudioMetaDataTest {

    @Test
    public void test() throws OnshapeException {
        OnshapeDocument partStudio = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/w/8a8c9fb7f12ace4bfb9f4dad/e/a35441e01221bb3fa9c9ff52");

        Onshape onshape = new Onshape();
//        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
//                System.getenv("ONSHAPE_API_SECRETKEY"));
        OnshapeDesktop desktop = new OnshapeDesktop(System.getenv("ONSHAPE_CLIENTID"), System.getenv("ONSHAPE_CLIENTSECRET"));
        desktop.setupClient(onshape);
//        MetadataGetElementMetadataResponse meta = onshape.metadata().getElementMetadata().detailLevel(5).thumbnail(Boolean.TRUE).call(partStudio);
//        System.out.println(meta);
//        MetadataGetPartListMetadataResponse partsMeta = onshape.metadata().getPartListMetadata().detailLevel(5).thumbnail(Boolean.TRUE).call(partStudio);
//        System.out.println(partsMeta);
//        
//        PartStudiosGetFeaturesResponse features = onshape.partStudios().getFeatures().call(partStudio);
//        System.out.println(features);

        MetadataGetPartMetadataResponse partMeta = onshape.metadata().getPartMetadata().call(partStudio, "JHD");
        for (Map property : partMeta.getProperties()) {
            if ("Appearance".equals(property.get("name"))) {
                Appearance appearance = new Appearance();
                Map value = (Map) property.get("value");
                appearance.setOpacity((Number) value.get("opacity"));
                Map color = (Map) value.get("color");
                Number red = (Number) color.get("red");
                Number green = (Number) color.get("green");
                Number blue = (Number) color.get("blue");
                appearance.setColor(new Number[]{red, green, blue});
                System.out.println(appearance);
            }
        }

    }
}
