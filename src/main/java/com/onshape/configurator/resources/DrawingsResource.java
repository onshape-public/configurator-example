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
import com.onshape.configurator.services.DrawingsService;
import com.onshape.configurator.storage.CacheResult;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;

/**
 * REST methods for fetching details of a drawing or exporting the drawing for
 * given document and configuration
 *
 * @author Peter Harman peter.harman@cae.tech
 */
@Path("/drawings/{document: d\\/[^\\/]+\\/(?:w|v|m)\\/[^\\/]+\\/e\\/[^\\/]+}")
public class DrawingsResource {

    @GET
    @CacheResult
    @CacheControl
    @Compress
    @Produces({MediaType.APPLICATION_JSON})
    public Response getDrawings(
            @Context DrawingsService drawingsService,
            @PathParam("document") OnshapeDocument document) {
        try {
            // Fetch the drawing from Onshape, and return
            return Response.ok(drawingsService.getDrawings(document)).build();
        } catch (OnshapeException ex) {
            Logger.getLogger(ConfiguratorResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
    }

    @GET
    @CacheResult
    @CacheControl
    @Compress
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/drawing/{drawing_element_id}")
    public Response getDrawing(
            @Context DrawingsService drawingsService,
            @PathParam("document") OnshapeDocument document,
            @PathParam("drawing_element_id") String drawingElementId) {
        try {
            // Create instance of Onshape document for the requested drawing
            OnshapeDocument drawing = new OnshapeDocument(document.getDocumentId(),
                    document.getWorkspaceId(),
                    document.getVersionId(),
                    document.getMicroversionId(),
                    drawingElementId);

            // Fetch the drawing from Onshape, and return
            return Response.ok(drawingsService.getDrawing(document, drawing)).build();
        } catch (OnshapeException ex) {
            Logger.getLogger(ConfiguratorResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
    }

    @GET
    @CacheControl
    @Produces({"application/pdf"})
    @Path("/c/{configuration}/drawing/{drawing_element_id}.pdf")
    public Response getPDF(
            @Context DrawingsService drawingsService,
            @PathParam("document") OnshapeDocument document,
            @PathParam("configuration") String configuration,
            @PathParam("drawing_element_id") String drawingElementId) {
        try {
            // Create instance of Onshape document for the requested drawing
            OnshapeDocument drawing = new OnshapeDocument(document.getDocumentId(),
                    document.getWorkspaceId(),
                    document.getVersionId(),
                    document.getMicroversionId(),
                    drawingElementId);

            // Fetch the drawing from Onshape, pass stream directly to response
            InputStreamWithHeaders export = drawingsService.getConfiguredDrawing(document, drawing, configuration);
            return Response.ok((StreamingOutput) (OutputStream output) -> {
                ByteStreams.copy(export.getInputStream(), output);
                output.flush();
            }, "application/pdf")
                    .header("Content-Encoding", export.getContentEncoding() == null ? "" : export.getContentEncoding())
                    .build();
        } catch (OnshapeException ex) {
            Logger.getLogger(ConfiguratorResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
    }
}
