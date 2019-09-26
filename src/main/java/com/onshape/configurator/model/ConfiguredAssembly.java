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
import com.onshape.api.Onshape;
import java.util.ArrayList;
import java.util.Collection;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class ConfiguredAssembly extends AbstractDocumentElement {

    @JsonProperty
    private String configuration;
    @JsonProperty
    private final Collection<SubAssembly> subAssemblies = new ArrayList<>();
    @JsonProperty
    private final Collection<ConfiguredPart> parts = new ArrayList<>();
    @JsonProperty
    private BoundingBox boundingBox;

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    public Collection<SubAssembly> getSubAssemblies() {
        return subAssemblies;
    }

    public Collection<ConfiguredPart> getParts() {
        return parts;
    }

    public BoundingBox getBoundingBox() {
        return boundingBox;
    }

    public void setBoundingBox(BoundingBox boundingBox) {
        this.boundingBox = boundingBox;
    }

    public static class BoundingBox {
        @JsonProperty
        private Number lowX;
        @JsonProperty
        private Number lowY;
        @JsonProperty
        private Number lowZ;
        @JsonProperty
        private Number highX;
        @JsonProperty
        private Number highY;
        @JsonProperty
        private Number highZ;

        public Number getLowX() {
            return lowX;
        }

        public void setLowX(Number lowX) {
            this.lowX = lowX;
        }

        public Number getLowY() {
            return lowY;
        }

        public void setLowY(Number lowY) {
            this.lowY = lowY;
        }

        public Number getLowZ() {
            return lowZ;
        }

        public void setLowZ(Number lowZ) {
            this.lowZ = lowZ;
        }

        public Number getHighX() {
            return highX;
        }

        public void setHighX(Number highX) {
            this.highX = highX;
        }

        public Number getHighY() {
            return highY;
        }

        public void setHighY(Number highY) {
            this.highY = highY;
        }

        public Number getHighZ() {
            return highZ;
        }

        public void setHighZ(Number highZ) {
            this.highZ = highZ;
        }
    }

    public static class SubAssembly {

        @JsonProperty
        private String instanceId;
        @JsonProperty
        private Number[] transform;
        @JsonProperty
        private final Collection<SubAssembly> subAssemblies = new ArrayList<>();
        @JsonProperty
        private final Collection<ConfiguredPart> parts = new ArrayList<>();

        public String getInstanceId() {
            return instanceId;
        }

        public void setInstanceId(String instanceId) {
            this.instanceId = instanceId;
        }

        public Number[] getTransform() {
            return transform;
        }

        public void setTransform(Number[] transform) {
            this.transform = transform;
        }

        public Collection<SubAssembly> getSubAssemblies() {
            return subAssemblies;
        }

        public Collection<ConfiguredPart> getParts() {
            return parts;
        }

        @Override
        public String toString() {
            return Onshape.toString(this);
        }
    }

    @Override
    public String toString() {
        return Onshape.toString(this);
    }
}
