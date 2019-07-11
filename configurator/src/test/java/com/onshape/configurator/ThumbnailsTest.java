/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.onshape.configurator;

import com.onshape.api.Onshape;
import com.onshape.api.desktop.OnshapeDesktop;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.requests.ElementsEncodeConfigurationRequestParameters;
import com.onshape.api.responses.ThumbnailsGetConfiguredElementThumbnailWithSizeResponse;
import com.onshape.api.responses.ThumbnailsGetElementThumbnailWithApiConfigurationResponse;
import com.onshape.api.types.OnshapeDocument;
import java.net.URLEncoder;
import java.util.stream.Stream;
import org.junit.Test;

/**
 *
 * @author peter
 */
public class ThumbnailsTest {

    @Test
    public void test() throws OnshapeException {
        //Depth=0.35000000000000003+meter;Height=0.35000000000000003+meter;List_snEFfKUxlIeAjb=Default;Width=0.5+meter

//https://cad.onshape.com/documents/9558507b2d8feaea012281be/m/e07b3903cb5cb46afb402517/e/a35441e01221bb3fa9c9ff52
        Onshape onshape = new Onshape();
//        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
//                System.getenv("ONSHAPE_API_SECRETKEY"));
        OnshapeDesktop desktop = new OnshapeDesktop(System.getenv("ONSHAPE_CLIENTID"), System.getenv("ONSHAPE_CLIENTSECRET"));
        desktop.setupClient(onshape);
        OnshapeDocument doc = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/m/e07b3903cb5cb46afb402517/e/a35441e01221bb3fa9c9ff52");
        String wid = onshape.documents().getDocument().call(doc).getDefaultWorkspace().getId();
        String configString = "Depth=0.35000000000000003+meter;Height=0.35000000000000003+meter;List_snEFfKUxlIeAjb=Default;Width=0.5+meter";
        String cid = onshape.elements().encodeConfiguration().parameters(parameters(configString)).call(doc).getEncodedId();
        ThumbnailsGetConfiguredElementThumbnailWithSizeResponse thumbnail = onshape.thumbnails().getConfiguredElementThumbnailWithSize().call(cid, "300x300", doc.getDocumentId(), wid, doc.getElementId(), false);
//        ThumbnailsGetElementThumbnailWithApiConfigurationResponse thumbnail = onshape.thumbnails().getElementThumbnailWithApiConfiguration()
//                .call(configString, "300x300", doc.getDocumentId(), wid, doc.getElementId(), false);
        System.out.println(thumbnail);
    }

    ElementsEncodeConfigurationRequestParameters[] parameters(String configString) {
        String[] pv = configString.trim().split(";");
        ElementsEncodeConfigurationRequestParameters[] parameters = new ElementsEncodeConfigurationRequestParameters[pv.length];
        for (int i = 0; i < pv.length; i++) {
            String[] parameterValue = pv[i].split("=");
            parameters[i] = ElementsEncodeConfigurationRequestParameters.builder().parameterId(parameterValue[0]).parameterValue(parameterValue[1]).build();
        }
        return parameters;
    }
}
