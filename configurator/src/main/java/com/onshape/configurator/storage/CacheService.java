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

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalCause;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 *
 * @author Peter Harman peter.harman@cae.tech
 */
public class CacheService {

    private final Cache<String, CachedResponse> cache;
    private final ExecutorService writeExecutor = Executors.newCachedThreadPool();
    private long lastGC;

    public CacheService() {
        this.lastGC = System.currentTimeMillis();
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .maximumSize(200)
                .removalListener((String k, CachedResponse v, RemovalCause rc) -> {
                    // Try to garbage collect, up to 10mins apart
                    if (System.currentTimeMillis() - lastGC > 10 * 60 * 1000) {
                        System.gc();
                        lastGC = System.currentTimeMillis();
                    }
                })
                .build();
    }

    public CachedResponse get(String url) {
        return this.cache.getIfPresent(url);
    }

    public void set(String key, byte[] entity, String contentType) {
        writeExecutor.submit(() -> {
            this.cache.put(key, new CachedResponse(entity, contentType));
        });
    }
}
