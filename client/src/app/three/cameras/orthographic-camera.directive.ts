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

import {Directive, Input, forwardRef, HostListener} from '@angular/core';
import {AbstractCamera} from './abstract-camera';
import * as THREE from 'three';

@Directive({
    selector: 'three-orthographic-camera',
    providers: [{provide: AbstractCamera, useExisting: forwardRef(() => OrthographicCameraDirective)}]
})
export class OrthographicCameraDirective extends AbstractCamera<THREE.OrthographicCamera> {
//https://stackoverflow.com/questions/17558085/three-js-orthographic-camera
    // @Input() cameraTarget: THREE.Object3D;

    @Input() fov: number;
    @Input() near = 0;
    @Input() far = 1000;

    @Input() positionX: number;
    @Input() positionY: number;
    @Input() positionZ: number;


    constructor() {
        super();
        console.log('OrthographicCameraDirective.constructor');
    }

    protected afterInit(): void {
        console.log('OrthographicCameraDirective.afterInit');
        const top = 2;
        this.camera = new THREE.OrthographicCamera(
            -top,
            top,
            top,
            -top,
            this.near,
            this.far
        );

        // Set position and look at
        this.camera.position.x = this.positionX;
        this.camera.position.y = this.positionY;
        this.camera.position.z = this.positionZ;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();
    }

    public updateAspectRatio(aspect: number) {
        console.log('OrthographicCameraDirective.updateAspectRatio: ' + aspect);
        this.camera.left = -this.camera.top * aspect;
        this.camera.right = this.camera.top * aspect;
        this.camera.updateProjectionMatrix();
    }


}
