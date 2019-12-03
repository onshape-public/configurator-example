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

import com.onshape.api.Onshape;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.types.OnshapeDocument;
import java.io.IOException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Response.ResponseBuilder;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
@CacheControl
public class CacheControlFilter implements ContainerRequestFilter {

    public static final int ONE_HOUR = 60 * 60;
    public static final int ONE_WEEK = 7 * 24 * ONE_HOUR;
    @Context
    private Onshape onshape;
    @Context
    private ResourceInfo resourceInfo;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        OnshapeDocument document = getDocument(requestContext);
        if (document != null) {
            // Create a Cache-Control header
            javax.ws.rs.core.CacheControl ccHeader = new javax.ws.rs.core.CacheControl();
            switch (document.getWVM()) {
                case Microversion:
                case Version:
                    ccHeader.setMaxAge(ONE_WEEK);
                    break;
                default:
                    ccHeader.setMaxAge(ONE_HOUR);
            }
            try {
                // Create an ETag header
                EntityTag eTag = getEntityTag(document);
                // Test any ETag header in the request
                ResponseBuilder responseBuilder = requestContext.getRequest().evaluatePreconditions(eTag);
                if (responseBuilder != null) {
                    // The document hasn't changed so we respond as such, after adding the headers
                    requestContext.abortWith(responseBuilder
                            .cacheControl(ccHeader)
                            .tag(eTag)
                            .build());
                    return;
                }
                // The method will be applied so pass cache-control headers to the CacheControlResponseFilter
                requestContext.setProperty("Cache-Control", ccHeader);
                requestContext.setProperty("ETag", eTag);
            } catch (OnshapeException ex) {
                throw new IOException("Failed to determine document Microversion while generating ETag", ex);
            }
        }
    }

    protected OnshapeDocument getDocument(ContainerRequestContext requestContext) {
        String documentPath = requestContext.getUriInfo().getPathParameters().getFirst(getAnnotation().document());
        if (documentPath != null && !documentPath.isEmpty()) {
            return OnshapeDocumentConverterProvider.ONSHAPE_DOCUMENT_CONVERTER.fromString(documentPath);
        }
        return null;
    }

    protected EntityTag getEntityTag(OnshapeDocument document) throws OnshapeException {
        switch (document.getWVM()) {
            case Microversion:
                return new EntityTag("m/" + document.getMicroversionId());
            case Version:
                return new EntityTag("v/" + document.getVersionId());
            default:
                return new EntityTag("m/" + this.onshape.documents().getCurrentMicroversion().call(document).getMicroversion());
        }
    }

    protected CacheControl getAnnotation() {
        CacheControl cc = resourceInfo.getResourceMethod().getAnnotation(CacheControl.class);
        if (cc == null) {
            return resourceInfo.getResourceClass().getAnnotation(CacheControl.class);
        }
        return cc;
    }
}
