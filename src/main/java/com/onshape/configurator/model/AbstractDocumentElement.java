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
package com.onshape.configurator.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.api.types.WVM;

/**
 * Base class for objects that reference an Onshape document
 * 
 * @author Peter Harman peter.harman@cae.tech
 */
public class AbstractDocumentElement {

    @JsonProperty
    private String documentId;
    @JsonProperty
    private WVM wvmType;
    @JsonProperty
    private String wvmId;
    @JsonProperty
    private String elementId;

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public WVM getWvmType() {
        return wvmType;
    }

    public void setWvmType(WVM wvmType) {
        this.wvmType = wvmType;
    }

    public String getWvmId() {
        return wvmId;
    }

    public void setWvmId(String wvmId) {
        this.wvmId = wvmId;
    }

    public String getElementId() {
        return elementId;
    }

    public void setElementId(String elementId) {
        this.elementId = elementId;
    }

    public void setFromDocument(OnshapeDocument document) {
        this.documentId = document.getDocumentId();
        this.wvmType = document.getWVM();
        this.wvmId = document.getWVMId();
        this.elementId = document.getElementId();
    }
}
