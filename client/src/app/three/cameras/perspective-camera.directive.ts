/*
 * The MIT License
 *
 * Copyright (c) 2017 Mihail Akimenko
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

import { Directive, Input, forwardRef, HostListener } from '@angular/core';
import { AbstractCamera } from './abstract-camera';
import * as THREE from 'three';

@Directive({
  selector: 'three-perspective-camera',
  providers: [{ provide: AbstractCamera, useExisting: forwardRef(() => PerspectiveCameraDirective) }]
})
export class PerspectiveCameraDirective extends AbstractCamera<THREE.PerspectiveCamera> {

  // @Input() cameraTarget: THREE.Object3D;

  @Input() fov: number;
  @Input() near: number;
  @Input() far: number;

  @Input() positionX: number;
  @Input() positionY: number;
  @Input() positionZ: number;


  constructor() {
    console.log('PerspectiveCameraDirective.constructor');
    super();
  }

  protected afterInit(): void {
    console.log('PerspectiveCameraDirective.afterInit');
    // let aspectRatio = undefined; // Updated later
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      undefined,
      this.near,
      this.far
    );
    // Set position and look at
    this.camera.position.x = this.positionX;
    this.camera.position.y = this.positionY;
    this.camera.position.z = this.positionZ;
    this.camera.updateProjectionMatrix();
  }

  public updateAspectRatio(aspect: number) {
    console.log('PerspectiveCameraDirective.updateAspectRatio: ' + aspect);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }


}
