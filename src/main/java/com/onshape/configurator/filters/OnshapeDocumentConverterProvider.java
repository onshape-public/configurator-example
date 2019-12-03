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
package com.onshape.configurator.filters;

import com.onshape.api.types.OnshapeDocument;
import com.onshape.api.types.WVM;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.ws.rs.ext.ParamConverter;
import javax.ws.rs.ext.ParamConverterProvider;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class OnshapeDocumentConverterProvider implements ParamConverterProvider {

    public static WVMConverter WVM_CONVERTER = new WVMConverter();
    public static OnshapeDocumentConverter ONSHAPE_DOCUMENT_CONVERTER = new OnshapeDocumentConverter();

    @Override
    public <T> ParamConverter<T> getConverter(Class<T> rawType, Type genericType, Annotation[] annotations) {
        if (rawType.equals(WVM.class)) {
            return (ParamConverter<T>) WVM_CONVERTER;
        }
        if (rawType.equals(OnshapeDocument.class)) {
            return (ParamConverter<T>) ONSHAPE_DOCUMENT_CONVERTER;
        }
        return null;
    }

    public static class WVMConverter implements ParamConverter<WVM> {

        WVMConverter() {
        }

        @Override
        public WVM fromString(String s) {
            switch (s.toLowerCase()) {
                case "v":
                    return WVM.Version;
                case "m":
                    return WVM.Microversion;
                default:
                    return WVM.Workspace;
            }
        }

        @Override
        public String toString(WVM wvm) {
            return wvm.toString();
        }
    }

    public static class OnshapeDocumentConverter implements ParamConverter<OnshapeDocument> {

        private static final Pattern PATTERN = Pattern.compile("^d\\/([^\\/]+)\\/(w|v|m)\\/([^\\/]+)\\/e\\/([^\\/]+)$");

        OnshapeDocumentConverter() {
        }

        @Override
        public OnshapeDocument fromString(String s) {
            Matcher matcher = PATTERN.matcher(s);
            if (matcher.matches()) {
                switch (matcher.group(2).toLowerCase()) {
                    case "v":
                        return new OnshapeDocument(matcher.group(1), null, matcher.group(3), null, matcher.group(4));
                    case "m":
                        return new OnshapeDocument(matcher.group(1), null, null, matcher.group(3), matcher.group(4));
                    default:
                        return new OnshapeDocument(matcher.group(1), matcher.group(3), null, null, matcher.group(4));
                }
            }
            throw new IllegalArgumentException("Could not parse Onshape document path: " + s);
        }

        @Override
        public String toString(OnshapeDocument document) {
            switch (document.getWVM()) {
                case Version:
                    return "d" + document.getDocumentId() + "/v/" + document.getVersionId() + "/e/" + document.getElementId();
                case Microversion:
                    return "d" + document.getDocumentId() + "/m/" + document.getMicroversionId() + "/e/" + document.getElementId();
                default:
                    return "d" + document.getDocumentId() + "/w/" + document.getWorkspaceId() + "/e/" + document.getElementId();
            }
        }
    }
}
