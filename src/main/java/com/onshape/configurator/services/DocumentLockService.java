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
package com.onshape.configurator.services;

import com.onshape.api.Onshape;
import com.onshape.api.exceptions.OnshapeException;
import com.onshape.api.types.OnshapeDocument;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Service to lock a single client to write-access for a document (NOTE: This is
 * only needed for drawing export, and is only required because currently the
 * Onshape API methods for this require multiple write steps to the document and
 * hence cannot be used concurrently, this will change in a future release)
 * 
 * @author Peter Harman peter.harman@cae.tech
 */
public class DocumentLockService {

    private static DocumentLockService INSTANCE;
    private final Onshape onshape;
    private final ConcurrentMap<OnshapeDocument, Lock> locks;

    public static DocumentLockService getInstance(Onshape onshape) {
        if (INSTANCE == null) {
            INSTANCE = new DocumentLockService(onshape);
        }
        return INSTANCE;
    }

    DocumentLockService(Onshape onshape) {
        this.onshape = onshape;
        this.locks = new ConcurrentHashMap<>();
    }

    public OnshapeDocument getWritable(OnshapeDocument document) throws OnshapeException {
        try {
            // Does document have a Workspace?
            if (document.getWorkspaceId() == null) {
                String wid = onshape.documents().getDocument().call(document).getDefaultWorkspace().getId();
                document = new OnshapeDocument(document.getDocumentId(), wid, document.getElementId());
            }
            // Get or create a lock
            Lock lock = locks.computeIfAbsent(document, (doc) -> new ReentrantLock());
            lock.lockInterruptibly();
            return document;
        } catch (InterruptedException ex) {
            throw new OnshapeException("Failed to lock access to default Workspace", ex);
        }
    }

    public void release(OnshapeDocument document) {
        locks.computeIfPresent(document, (doc, lock) -> {
            lock.unlock();
            return lock;
        });
    }
}
