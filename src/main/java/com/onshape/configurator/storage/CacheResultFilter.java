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
package com.onshape.configurator.storage;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
@CacheResult
public class CacheResultFilter implements ContainerRequestFilter {
    
    @Context
    private CacheService cacheService;
    
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String uri = requestContext.getUriInfo().getRequestUri().toString();
        // If URL is in cache, abort with cached result
        CachedResponse response = cacheService.get(uri);
        if (response != null) {
            // We know we can cache in the client as we cached it here
            CacheControl cc = new CacheControl();
            cc.setMaxAge(3600);
            requestContext.abortWith(Response.ok(new ByteArrayInputStream(response.getData()), response.getContentType())
                    .cacheControl(cc)
                    .build());
            return;
        }
        // Else write URL as CACHE-KEY property and the response will be captured later
        requestContext.setProperty("CACHE-KEY", uri);
    }
    
}
