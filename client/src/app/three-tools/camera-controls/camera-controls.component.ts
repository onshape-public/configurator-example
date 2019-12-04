/*
 * The MIT License
 *
 * Copyright (c) 2019 Onshape Inc.
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
import {Component, Input, OnChanges, OnDestroy, forwardRef, SimpleChanges} from '@angular/core';
import {AbstractTool} from '../abstract-tool';
import CameraControls from 'camera-controls';
import * as THREE from 'three';

@Component({
    selector: 'app-camera-controls',
    templateUrl: './camera-controls.component.html',
    styleUrls: ['./camera-controls.component.scss'],
    providers: [{provide: AbstractTool, useExisting: forwardRef(() => CameraControlsComponent)}]
})
export class CameraControlsComponent extends AbstractTool implements OnChanges, OnDestroy {
    @Input() zoomToFit = true;
    @Input() zoomToFitInitial = false;
    @Input() button = true;

    private controls: CameraControls;

    constructor() {
        super('Camera Controls', 'navigation', true, true);
    }

    ngOnChanges(changes: SimpleChanges) {
        // If the THREE.js OrbitControls are not set up yet, we do not need to update
        // anything as they will pick the new values from the @Input properties automatically
        // upon creation.
        if (!this.controls) {
            return;
        }

        if (changes['listeningControlElement']) {
            // The DOM element the OrbitControls listen on cannot be changed once an
            // OrbitControls object is created. We thus need to recreate it.
            this.controls.dispose();
            this.setUpCameraControls();
        }
    }

    ngOnDestroy() {
        this.controls.dispose();
    }

    private setUpCameraControls() {
        console.log('Starting Camera Controls');
        CameraControls.install({THREE: THREE});
        this.controls = new CameraControls(
            this.getRendererComponent().getCamera() as THREE.PerspectiveCamera | THREE.OrthographicCamera,
            this.getRendererComponent().canvas
        );
        this.controls.addEventListener('update', () => {
        });
        // Following line seems to trigger controls to start, unsure why
        this.controls.addEventListener('control', () => {
        });
        if (this.zoomToFitInitial) {
            this.doZoomToFit();
        }
    }

    onStartRendering() {
        super.onStartRendering();
        this.setUpCameraControls();
    }

    onRender(delta: number) {
        super.onRender(delta);
        this.controls.update(delta);
    }

    public doZoomToFit() {
        const bbox = new THREE.Box3().setFromObject(this.getRendererComponent().getScene());
        if (this.getRendererComponent().getCamera() instanceof THREE.PerspectiveCamera) {
            this.controls.fitTo(bbox, true);
        } else {
            const camera = this.getRendererComponent().getCamera() as THREE.OrthographicCamera;
            const sphere = new THREE.Sphere();
            bbox.getBoundingSphere(sphere);
        }
    }
}
