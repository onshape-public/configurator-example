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
import com.onshape.api.types.OnshapeDocument;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class CacheControlService {

    public static final int ONE_HOUR = 60 * 60;
    public static final int ONE_WEEK = 7 * 24 * ONE_HOUR;
    private final Onshape onshape;

    public CacheControlService(Onshape onshape) {
        this.onshape = onshape;
    }

    public EntityTag getEntityTag(OnshapeDocument document) throws OnshapeException {
        switch (document.getWVM()) {
            case Microversion:
                return new EntityTag("m/" + document.getMicroversionId());
            case Version:
                return new EntityTag("v/" + document.getVersionId());
            default:
                return new EntityTag("m/" + this.onshape.documents().getCurrentMicroversion().call(document).getMicroversion());
        }
    }

    public Response.ResponseBuilder evaluatePreconditions(Request request, OnshapeDocument document, EntityTag tag) {
        Response.ResponseBuilder responseBuilder = request.evaluatePreconditions(tag);
        if (responseBuilder != null) {
            CacheControl cc = new CacheControl();
            switch (document.getWVM()) {
                case Microversion:
                case Version:
                    cc.setMaxAge(ONE_WEEK);
                    break;
                default:
                    cc.setMaxAge(ONE_HOUR);
            }
            responseBuilder.cacheControl(cc);
        }
        return responseBuilder;
    }

    public Response.ResponseBuilder applyCacheControl(Response.ResponseBuilder responseBuilder, OnshapeDocument document, EntityTag tag) {
        responseBuilder.tag(tag);
        CacheControl cc = new CacheControl();
        switch (document.getWVM()) {
            case Microversion:
            case Version:
                cc.setMaxAge(ONE_WEEK);
                break;
            default:
                cc.setMaxAge(ONE_HOUR);
        }
        responseBuilder.cacheControl(cc);
        return responseBuilder;
    }

}
