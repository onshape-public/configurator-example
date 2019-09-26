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
import com.onshape.api.requests.ElementsEncodeConfigurationRequestParameters;
import com.onshape.api.responses.ElementsDecodeConfigurationStringResponse;
import com.onshape.api.responses.ElementsDecodeConfigurationStringResponseParameters;
import com.onshape.api.responses.ElementsEncodeConfigurationResponse;
import com.onshape.api.responses.ElementsGetConfigurationResponse;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.model.Configuration;
import com.onshape.configurator.model.ConfigurationParameter;
import com.onshape.configurator.model.ConfigurationParameterEnum;
import com.onshape.configurator.model.ConfigurationParameterQuantity;
import com.onshape.configurator.model.Configurator;
import com.onshape.configurator.model.ParameterValue;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class ConfigurationsService {

    private final Onshape onshape;

    public ConfigurationsService(Onshape onshape) {
        this.onshape = onshape;
    }

    public Configurator getConfigurator(OnshapeDocument documentElement) throws OnshapeException {
        Configurator configurator = new Configurator();
        configurator.setFromDocument(documentElement);

        // Fetch the element configuration from Onshape
        ElementsGetConfigurationResponse elementConfiguration = onshape.elements()
                .getConfiguration().call(documentElement);

        // Iterate over parameters and gather types, default values and ranges
        for (Map elementParameter : elementConfiguration.getConfigurationParameters()) {
            ConfigurationParameter configurationParameter = getParameter(elementParameter);
            if (configurationParameter != null) {
                configurator.getParameters().add(configurationParameter);
            }
        }

        return configurator;
    }

//    public void updateDefaultValues(OnshapeDocument documentElement, String configurationString) throws OnshapeException {
//
//        // Fetch the current element configuration from Onshape
//        ElementsGetConfigurationResponse elementConfiguration = onshape.elements()
//                .getConfiguration().call(documentElement);
//
//        Map[] configurationParameters = elementConfiguration.getConfigurationParameters();
//        for (int i = 0; i < configurationParameters.length; i++) {
//            Map message = (Map) configurationParameters[i].get("message");
//            switch (configurationParameters[i].get("typeName").toString()) {
//                case "BTMConfigurationParameterQuantity":
//                    Map rangeAndDefault = (Map) message.get("rangeAndDefault");
//                    Map rangeAndDefaultMessage = (Map) rangeAndDefault.get("message");
//                    rangeAndDefaultMessage.put("defaultValue", value);
//                case "BTMConfigurationParameterEnum":
//                default:
//            }
//        }
//
//    }

    private ConfigurationParameter getParameter(Map elementParameter) {
        Map message = (Map) elementParameter.get("message");
        switch (elementParameter.get("typeName").toString()) {
            case "BTMConfigurationParameterQuantity":
                ConfigurationParameterQuantity parameterQuantity = new ConfigurationParameterQuantity();
                parameterQuantity.setId(message.get("parameterId").toString());
                parameterQuantity.setName(message.get("parameterName").toString());
                parameterQuantity.setQuantity(message.get("quantityType").toString());
                Map rangeAndDefault = (Map) message.get("rangeAndDefault");
                Map rangeAndDefaultMessage = (Map) rangeAndDefault.get("message");
                parameterQuantity.setUnits(rangeAndDefaultMessage.get("units").toString());
                parameterQuantity.setMinValue(new BigDecimal(rangeAndDefaultMessage.get("minValue").toString()));
                parameterQuantity.setMaxValue(new BigDecimal(rangeAndDefaultMessage.get("maxValue").toString()));
                parameterQuantity.setDefaultValue(new BigDecimal(rangeAndDefaultMessage.get("defaultValue").toString()));
                return parameterQuantity;
            case "BTMConfigurationParameterEnum":
                ConfigurationParameterEnum parameterEnum = new ConfigurationParameterEnum();
                parameterEnum.setId(message.get("parameterId").toString());
                parameterEnum.setName(message.get("parameterName").toString());
                Collection options = (Collection) message.get("options");
                options.forEach((option) -> {
                    Map optionMessage = (Map) ((Map) option).get("message");
                    ConfigurationParameterEnum.EnumOption enumOption = new ConfigurationParameterEnum.EnumOption();
                    enumOption.setOption(optionMessage.get("option").toString());
                    enumOption.setOptionName(optionMessage.get("optionName").toString());
                    parameterEnum.getOptions().add(enumOption);
                });
                return parameterEnum;
            default:
                return null;
        }
    }

    /**
     *
     * @param configurator
     * @return
     */
    public Configuration getDefault(Configurator configurator) {
        Configuration configuration = new Configuration();
        configurator.getParameters().forEach((parameter) -> {
            ParameterValue value = new ParameterValue();
            value.setParameter(parameter.getId());
            value.setValue(parameter.getDefaultValueExpression());
            configuration.getValues().add(value);
        });
        return configuration;
    }

    public Configuration decodeConfiguration(OnshapeDocument document, String configurationId, String source) throws OnshapeException {
        Configuration configuration = new Configuration();
        ElementsDecodeConfigurationStringResponse response = onshape.elements().decodeConfigurationString()
                .configurationIsId(Boolean.TRUE)
                .includeDisplay(Boolean.TRUE)
                .linkDocumentId(source)
                .call(document, configurationId);
        for (ElementsDecodeConfigurationStringResponseParameters parameter : response.getParameters()) {

        }
        return configuration;
    }

    /**
     *
     * @param document
     * @param configuration
     * @param source
     * @return
     * @throws OnshapeException
     */
    public String encodeConfiguration(OnshapeDocument document, Configuration configuration, String source) throws OnshapeException {
        ElementsEncodeConfigurationRequestParameters[] parameters = new ElementsEncodeConfigurationRequestParameters[configuration.getValues().size()];
        int i = 0;
        for (ParameterValue parameterValue : configuration.getValues()) {
            parameters[i++] = ElementsEncodeConfigurationRequestParameters.builder()
                    .parameterId(parameterValue.getParameter())
                    .parameterValue(parameterValue.getValue()).build();
        }
        ElementsEncodeConfigurationResponse response = onshape.elements().encodeConfiguration()
                .linkDocumentId(source)
                .parameters(parameters)
                .versionId(document.getVersionId()).call(document);
        return response.getEncodedId();
    }
}
