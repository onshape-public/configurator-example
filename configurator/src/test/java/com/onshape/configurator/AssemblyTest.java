/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.onshape.configurator;

import com.onshape.api.Onshape;
import com.onshape.api.desktop.OnshapeDesktop;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.model.Configuration;
import com.onshape.configurator.model.Configurator;
import com.onshape.configurator.model.ConfiguredAssembly;
import com.onshape.configurator.services.AssembliesService;
import com.onshape.configurator.services.ConfigurationsService;
import org.junit.Test;

/**
 *
 * @author peter
 */
public class AssemblyTest {

    @Test
    public void test() throws OnshapeException {
        Onshape onshape = new Onshape();
//        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
//                System.getenv("ONSHAPE_API_SECRETKEY"));
        OnshapeDesktop desktop = new OnshapeDesktop(System.getenv("ONSHAPE_CLIENTID"), System.getenv("ONSHAPE_CLIENTSECRET"));
        desktop.setupClient(onshape);

        OnshapeDocument assembly = new OnshapeDocument("https://cad.onshape.com/documents/9558507b2d8feaea012281be/w/8a8c9fb7f12ace4bfb9f4dad/e/a8d9da8f108b44b9fa903800");

        ConfigurationsService configurationsService = new ConfigurationsService(onshape);
        Configurator configurator = configurationsService.getConfigurator(assembly);
        Configuration configuration = configurationsService.getDefault(configurator);
        AssembliesService service = new AssembliesService(onshape);
        ConfiguredAssembly configuredAssembly = service.getAssembly(assembly, configuration.toString());
        System.out.println(configuredAssembly);
    }
}
