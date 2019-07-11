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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import javax.annotation.Priority;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.WriterInterceptor;
import javax.ws.rs.ext.WriterInterceptorContext;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
@Priority(100)
public class CacheResultWriterInterceptor implements WriterInterceptor {

    @Context
    private CacheService cacheService;

    @Override
    public void aroundWriteTo(WriterInterceptorContext context) throws IOException, WebApplicationException {
        Object key = context.getProperty("CACHE-KEY");
        if (key != null) {
            OutputStream entityStream = context.getOutputStream();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            context.setOutputStream(baos);
            try {
                context.proceed();
            } finally {
                cacheService.set(key.toString(), baos.toByteArray(), getStringHeader(context, "Content-Type"));
                baos.writeTo(entityStream);
                context.setOutputStream(entityStream);
            }
            return;
        }
        context.proceed();
    }

    private String getStringHeader(WriterInterceptorContext context, String name) {
        List<Object> headers = context.getHeaders().get(name);
        if (headers != null && headers.size() > 0) {
            return headers.get(0).toString();
        }
        return "";
    }

}
