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
import com.onshape.api.responses.AssembliesGetAssemblyDefinitionResponse;
import com.onshape.api.responses.AssembliesGetAssemblyDefinitionResponseRootAssemblyInstances;
import com.onshape.api.responses.AssembliesGetAssemblyDefinitionResponseRootAssemblyOccurrences;
import com.onshape.api.responses.AssembliesGetAssemblyDefinitionResponseSubAssemblies;
import com.onshape.api.responses.AssembliesGetAssemblyDefinitionResponseSubAssembliesInstances;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.model.ConfiguredAssembly;
import com.onshape.configurator.model.ConfiguredPart;
import java.util.Arrays;
import java.util.stream.Stream;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class AssembliesService {
    
    private final Onshape onshape;
    
    public AssembliesService(Onshape onshape) {
        this.onshape = onshape;
    }

    /**
     * Returns the assembly contents, with only visible parts and their
     * configuration and transforms
     *
     * @param document
     * @param configurationString
     * @return
     * @throws OnshapeException
     */
    public ConfiguredAssembly getAssembly(OnshapeDocument document, String configurationString) throws OnshapeException {
        AssembliesGetAssemblyDefinitionResponse assemblyDefinition = onshape.assemblies().getAssemblyDefinition()
                .configuration(configurationString)
                .call(document);
        ConfiguredAssembly configuredAssembly = new ConfiguredAssembly();
        configuredAssembly.setFromDocument(document);
        configuredAssembly.setConfiguration(configurationString);
        for (AssembliesGetAssemblyDefinitionResponseRootAssemblyInstances instance : assemblyDefinition.getRootAssembly().getInstances()) {
            if (!instance.getSuppressed()) {
                switch (instance.getType()) {
                    case "Part":
                        ConfiguredPart part = makePart(assemblyDefinition, instance.getConfiguration(), instance.getPartId(), instance.getDocument(), instance.getId());
                        if (part != null) {
                            configuredAssembly.getParts().add(part);
                        }
                        break;
                    case "Assembly":
                        ConfiguredAssembly.SubAssembly subassembly = makeSubassembly(assemblyDefinition, instance.getDocument(), instance.getId());
                        if (subassembly != null) {
                            configuredAssembly.getSubAssemblies().add(subassembly);
                        }
                        break;
                    default:
                    // do nothing
                }
            }
        }
        return configuredAssembly;
    }
    
    private AssembliesGetAssemblyDefinitionResponseRootAssemblyOccurrences getOccurrence(AssembliesGetAssemblyDefinitionResponse assemblyDefinition, String... path) {
        return Stream.of(assemblyDefinition.getRootAssembly().getOccurrences()).filter((occ) -> Arrays.equals(path, occ.getPath())).findFirst().get();
    }
    
    private AssembliesGetAssemblyDefinitionResponseSubAssemblies getSubAssemblyDefinition(AssembliesGetAssemblyDefinitionResponse assemblyDefinition, OnshapeDocument target) {
        return Stream.of(assemblyDefinition.getSubAssemblies()).filter((subass) -> subass.getDocument().equals(target)).findFirst().get();
    }
    
    private ConfiguredPart makePart(AssembliesGetAssemblyDefinitionResponse assemblyDefinition, String configuration, String partId, OnshapeDocument instanceDocument, String... path) {
        AssembliesGetAssemblyDefinitionResponseRootAssemblyOccurrences occurrence = getOccurrence(assemblyDefinition, path);
        if (!occurrence.getHidden()) {
            ConfiguredPart part = new ConfiguredPart();
            part.setInstanceId(path[path.length - 1]);
            part.setConfiguration(configuration);
            part.setTransform(occurrence.getTransform());
            part.setFromDocument(instanceDocument);
            part.setPartId(partId);
            return part;
        }
        return null;
    }
    
    private ConfiguredAssembly.SubAssembly makeSubassembly(AssembliesGetAssemblyDefinitionResponse assemblyDefinition, OnshapeDocument instanceDocument, String... path) {
        AssembliesGetAssemblyDefinitionResponseRootAssemblyOccurrences occurrence = getOccurrence(assemblyDefinition, path);
        if (!occurrence.getHidden()) {
            ConfiguredAssembly.SubAssembly subassembly = new ConfiguredAssembly.SubAssembly();
            subassembly.setTransform(occurrence.getTransform());
            subassembly.setInstanceId(path[path.length - 1]);
            AssembliesGetAssemblyDefinitionResponseSubAssemblies definition = getSubAssemblyDefinition(assemblyDefinition, instanceDocument);
            for (AssembliesGetAssemblyDefinitionResponseSubAssembliesInstances instance : definition.getInstances()) {
                if (!instance.getSuppressed()) {
                    String[] instancePath = new String[path.length + 1];
                    System.arraycopy(path, 0, instancePath, 0, path.length);
                    instancePath[instancePath.length - 1] = instance.getId();
                    switch (instance.getType()) {
                        case "Part":
                            ConfiguredPart part = makePart(assemblyDefinition, instance.getConfiguration(), instance.getPartId(), instance.getDocument(), instancePath);
                            if (part != null) {
                                subassembly.getParts().add(part);
                            }
                            break;
                        case "Assembly":
                            ConfiguredAssembly.SubAssembly subsubassembly = makeSubassembly(assemblyDefinition, instanceDocument, instancePath);
                            if (subsubassembly != null) {
                                subassembly.getSubAssemblies().add(subsubassembly);
                            }
                            break;
                        default:
                        // do nothing
                    }
                }
            }
            return subassembly;
        }
        return null;
    }
}
