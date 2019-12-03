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
package com.onshape.configurator.resources;

import com.google.common.io.ByteStreams;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.types.InputStreamWithHeaders;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.configurator.filters.CacheControl;
import com.onshape.configurator.filters.CacheControlFilter;
import com.onshape.configurator.filters.Compress;
import com.onshape.configurator.services.ExportsService;
import com.onshape.configurator.storage.CacheResult;
import java.io.OutputStream;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
@Path("/exports")
public class ExportsResource {

    @GET
    @CacheResult
    @Compress
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/formats")
    public Response getFormats(@Context ExportsService exportsService) throws OnshapeException {
        javax.ws.rs.core.CacheControl cc = new javax.ws.rs.core.CacheControl();
        cc.setMaxAge(CacheControlFilter.ONE_WEEK);
        return Response.ok(exportsService.getFormats()).cacheControl(cc).build();
    }

    @GET
    @CacheControl
    @Produces({MediaType.APPLICATION_OCTET_STREAM})
    @Path("/{document: d\\/[^\\/]+\\/(?:w|v|m)\\/[^\\/]+\\/e\\/[^\\/]+}/c/{configuration}/f/{format}")
    public Response export(@Context ExportsService exportsService,
            @PathParam("document") OnshapeDocument document,
            @PathParam("configuration") String configuration,
            @PathParam("format") String format) throws OnshapeException {
        // Fetch the file from Onshape, pass stream directly to response
        InputStreamWithHeaders export = exportsService.export(document, configuration, format);
        return Response.ok((StreamingOutput) (OutputStream output) -> {
            ByteStreams.copy(export.getInputStream(), output);
            output.flush();
        }, export.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM : export.getContentType())
                .header("Content-Disposition", "attachment; filename=export." + format.toLowerCase() + "")
                .header("Content-Encoding", export.getContentEncoding() == null ? "" : export.getContentEncoding())
                .build();
    }
}
