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

import com.onshape.api.Onshape;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.types.Blob;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.api.types.WVM;
import com.onshape.configurator.filters.Compress;
import com.onshape.configurator.model.Appearance;
import com.onshape.configurator.services.PartsService;
import com.onshape.configurator.storage.CacheResult;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
@Path("/parts")
public class PartResource {
    // /configurator_id/parts/part_id.stl?configuration=...

    @GET
    @Path("/d/{document_id}/{wvm}/{wvm_id}/e/{element_id}/c/{configuration}/p/{part_id}.stl")
    @Compress
    @CacheResult
    @Produces({"application/sla"})
    public Response getGeometry(@Context Onshape onshape,
            @PathParam("document_id") String documentId,
            @PathParam("wvm") WVM wvm,
            @PathParam("wvm_id") String wvmId,
            @PathParam("element_id") String elementId,
            @PathParam("configuration") String configuration,
            @PathParam("part_id") String partId,
            @QueryParam("source") String linkDocumentId) {
        Blob file;
        try {
            // Use the Onshape client to fetch the geometry
            // TODO: Could store a future so that multple threads don't ask for the same resource
            file = onshape.parts().exportStl()
                    .configuration(configuration)
                    .mode("text")
                    .units("meter")
                    .linkDocumentId(linkDocumentId)
                    .call(documentId, wvm, wvmId, elementId, partId).getFile();
        } catch (OnshapeException ex) {
            Logger.getLogger(PartResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
        CacheControl cc = new CacheControl();
        cc.setMaxAge(3600);
        return Response.ok(file.toInputStream(), "application/sla").cacheControl(cc).build();
    }

    @GET
    @CacheResult
    @Path("/d/{document_id}/{wvm}/{wvm_id}/e/{element_id}/c/{configuration}/p/{part_id}/appearance")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getAppearance(@Context PartsService partsService,
            @PathParam("document_id") String documentId,
            @PathParam("wvm") WVM wvm,
            @PathParam("wvm_id") String wvmId,
            @PathParam("element_id") String elementId,
            @PathParam("configuration") String configuration,
            @PathParam("part_id") String partId,
            @QueryParam("source") String linkDocumentId) {
        try {
            OnshapeDocument document = new OnshapeDocument(documentId,
                    wvm == WVM.Workspace ? wvmId : null,
                    wvm == WVM.Version ? wvmId : null,
                    wvm == WVM.Microversion ? wvmId : null,
                    elementId);
            Appearance appearance = partsService.getAppearance(document, partId, configuration, linkDocumentId);
            CacheControl cc = new CacheControl();
            cc.setMaxAge(3600);
            return Response.ok(appearance).cacheControl(cc).build();
        } catch (OnshapeException ex) {
            Logger.getLogger(PartResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
    }
}
