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
import com.onshape.configurator.filters.Compress;
import com.onshape.configurator.model.Appearance;
import com.onshape.configurator.services.PartsService;
import com.onshape.configurator.storage.CacheResult;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;

/**
 * REST method for fetching part geometry and appearance for given document, part 
 * and configuration
 * 
 * @author Peter Harman peter.harman@cae.tech
 */
@Path("/parts/{document: d\\/[^\\/]+\\/(?:w|v|m)\\/[^\\/]+\\/e\\/[^\\/]+}")
public class PartResource {

    @GET
    @Path("/c/{configuration}/p/{part_id}.stl")
    @Compress
    @CacheControl
    @Produces({"application/sla"})
    public Response getGeometry(
            @Context PartsService partsService,
            @PathParam("document") OnshapeDocument document,
            @PathParam("configuration") String configuration,
            @PathParam("part_id") String partId,
            @QueryParam("source") String linkDocumentId) {
        try {
            // Fetch the geometry from Onshape, and pass stream directly to response
            InputStreamWithHeaders geometry = partsService.getGeometry(document, partId, configuration, linkDocumentId);
            return Response.ok((StreamingOutput) (OutputStream output) -> {
                ByteStreams.copy(geometry.getInputStream(), output);
                output.flush();
            }, "application/sla")
                    .header("Content-Encoding", geometry.getContentEncoding() == null ? "" : geometry.getContentEncoding())
                    .build();
        } catch (OnshapeException ex) {
            Logger.getLogger(PartResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
    }

    @GET
    @CacheResult
    @CacheControl
    @Path("/c/{configuration}/p/{part_id}/appearance")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getAppearance(
            @Context PartsService partsService,
            @PathParam("document") OnshapeDocument document,
            @PathParam("configuration") String configuration,
            @PathParam("part_id") String partId,
            @QueryParam("source") String linkDocumentId) {
        try {
            // Fetch the appearance from Onshape, and return
            Appearance appearance = partsService.getAppearance(document, partId, configuration, linkDocumentId);
            return Response.ok(appearance).build();
        } catch (OnshapeException ex) {
            Logger.getLogger(PartResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
    }
}
