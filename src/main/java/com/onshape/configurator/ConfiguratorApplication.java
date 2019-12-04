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
package com.onshape.configurator;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import com.onshape.api.Onshape;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.configurator.filters.CacheControlFilter;
import com.onshape.configurator.filters.CacheControlResponseFilter;
import com.onshape.configurator.filters.CompressionFilter;
import com.onshape.configurator.filters.CompressionWriterInterceptor;
import com.onshape.configurator.filters.OnshapeDocumentConverterProvider;
import com.onshape.configurator.resources.AssemblyResource;
import com.onshape.configurator.resources.ConfiguratorResource;
import com.onshape.configurator.resources.DrawingsResource;
import com.onshape.configurator.resources.ExportsResource;
import com.onshape.configurator.resources.PartResource;
import com.onshape.configurator.services.AssembliesService;
import com.onshape.configurator.services.ConfigurationsService;
import com.onshape.configurator.services.DrawingsService;
import com.onshape.configurator.services.ExportsService;
import com.onshape.configurator.services.PartsService;
import com.onshape.configurator.services.ThumbnailsService;
import com.onshape.configurator.storage.CacheResultFilter;
import com.onshape.configurator.storage.CacheResultWriterInterceptor;
import com.onshape.configurator.storage.CacheService;
import java.lang.annotation.Annotation;
import java.net.URI;
import java.util.Date;
import java.util.logging.Logger;
import javax.inject.Singleton;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;
import org.glassfish.hk2.api.Factory;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.process.internal.RequestScoped;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * JAX-RS application for the configurator.
 * 
 * @author Peter Harman peter.harman@cae.tech
 */
@ApplicationPath("api")
public class ConfiguratorApplication extends ResourceConfig {

    private static final Logger LOGGER = Logger.getGlobal();

    @SuppressWarnings("OverridableMethodCallInConstructor")
    public ConfiguratorApplication() throws OnshapeException {
        // Logging
        //register(new LoggingFeature(LOGGER, Level.INFO, LoggingFeature.Verbosity.HEADERS_ONLY, 1000));

        // Register filters and converters
        register(CompressionFilter.class);
        register(CompressionWriterInterceptor.class);
        register(OnshapeDocumentConverterProvider.class);
        register(CacheControlFilter.class);
        register(CacheControlResponseFilter.class);
        register(CacheResultFilter.class);
        register(CacheResultWriterInterceptor.class);

        // Register resources
        register(AssemblyResource.class);
        register(ConfiguratorResource.class);
        register(DrawingsResource.class);
        register(ExportsResource.class);
        register(PartResource.class);

        // Create a client object for Onshape APIs
        Onshape onshape = new Onshape();
        onshape.setAPICredentials(System.getenv("ONSHAPE_API_ACCESSKEY"),
                System.getenv("ONSHAPE_API_SECRETKEY"));

        onshape.addRequestListener((String method, URI uri, Entity entity) -> {
            long t0 = System.currentTimeMillis();
            return (Response rspns) -> {
                System.out.printf("%s %s %s -> %d (%f s)\n", new Date().toString(), method, uri.toString(), rspns.getStatus(), (System.currentTimeMillis() - t0) / 1e3);
            };
        });

        // Inject services
        register(new ServicesBinder(onshape));

        // Serialization using Jackson
        JacksonJaxbJsonProvider provider = new JacksonJaxbJsonProvider();
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.disable(MapperFeature.DEFAULT_VIEW_INCLUSION);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.configure(DeserializationFeature.FAIL_ON_INVALID_SUBTYPE, false);
        objectMapper.configure(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, true);
        provider.setMapper(objectMapper);
        register(provider);
        System.out.println("Application started");
    }

    /**
     * Utility class to bind context objects
     */
    static class ServicesBinder extends AbstractBinder {

        private final Onshape onshape;

        public ServicesBinder(Onshape onshape) {
            this.onshape = onshape;
        }

        @Override
        protected void configure() {
            bindService(onshape, Onshape.class, Singleton.class);
            bindService(new AssembliesService(onshape), AssembliesService.class, RequestScoped.class);
            bindService(new ConfigurationsService(onshape), ConfigurationsService.class, RequestScoped.class);
            bindService(new DrawingsService(onshape), DrawingsService.class, RequestScoped.class);
            bindService(new ThumbnailsService(onshape), ThumbnailsService.class, RequestScoped.class);
            bindService(new PartsService(onshape), PartsService.class, RequestScoped.class);
            bindService(new ExportsService(onshape), ExportsService.class, RequestScoped.class);
            bindService(new CacheService(), CacheService.class, Singleton.class);
        }

        private <T> void bindService(final T service, final Class<T> type, final Class<? extends Annotation> scope) {
            bindFactory(new Factory<T>() {
                @Override
                public T provide() {
                    return service;
                }

                @Override
                public void dispose(T instance) {
                }
            }).to(type).in(scope);
        }

    }
}
