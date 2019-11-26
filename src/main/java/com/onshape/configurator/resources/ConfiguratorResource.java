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

import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.types.OnshapeDocument;
import com.onshape.api.types.WVM;
import com.onshape.configurator.filters.Compress;
import com.onshape.configurator.model.Configurator;
import com.onshape.configurator.services.CacheControlService;
import com.onshape.configurator.services.ConfigurationsService;
import com.onshape.configurator.storage.CacheResult;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
@Path("/configurator")
public class ConfiguratorResource {

    @GET
    @CacheResult
    @Compress
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/d/{document_id}/{wvm}/{wvm_id}/e/{element_id}")
    public Response getConfigurator(
            @Context ConfigurationsService configurationsService,
            @Context CacheControlService cacheControlService,
            @Context Request request,
            @PathParam("document_id") String documentId,
            @PathParam("wvm") WVM wvm,
            @PathParam("wvm_id") String wvmId,
            @PathParam("element_id") String elementId) {
        try {
            // Create an instance of Onshape document for the requested document
            OnshapeDocument document = new OnshapeDocument(documentId,
                    wvm == WVM.Workspace ? wvmId : null,
                    wvm == WVM.Version ? wvmId : null,
                    wvm == WVM.Microversion ? wvmId : null,
                    elementId);

            // Get an ETag and compare to the ETag in the request, respond with 304 if matching
            EntityTag etag = cacheControlService.getEntityTag(document);
            Response.ResponseBuilder responseBuilder = cacheControlService.evaluatePreconditions(request, document, etag);
            if (responseBuilder != null) {
                return responseBuilder.build();
            }

            // Fetch the configuration information from Onshape, and return
            Configurator configurator = configurationsService.getConfigurator(document);
            return cacheControlService.applyCacheControl(Response.ok(configurator), document, etag).build();
        } catch (OnshapeException ex) {
            Logger.getLogger(ConfiguratorResource.class.getName()).log(Level.SEVERE, null, ex);
            return Response.status(500, ex.getMessage()).build();
        }
    }
}
