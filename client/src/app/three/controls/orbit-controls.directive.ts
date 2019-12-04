/*
 * The MIT License
 *
 * Copyright (c) 2017 Mihail Akimenko
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

 import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  QueryList
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WebGLRendererComponent } from '../renderer/webgl-renderer.component';
import { AbstractCamera } from '../cameras/abstract-camera';

@Directive({
  selector: 'three-orbit-controls'
})
export class OrbitControlsDirective implements AfterViewInit, OnChanges, OnDestroy {

  @ContentChildren(AbstractCamera, { descendants: true }) childCameras: QueryList<AbstractCamera<THREE.Camera>>;
  @ContentChildren(WebGLRendererComponent, { descendants: true }) childRenderers: QueryList<WebGLRendererComponent>;
  /**
   * The element on whose native element the orbit controls will listen for mouse events.
   *
   * Note that keyboard events are still listened for on the global window object, this is
   * a known issue from Three.js: https://github.com/mrdoob/three.js/pull/10315
   *
   * @example This property can be used to restrict the orbit controls (i.e. the
   * area which is listened for mouse move and zoom events) to the rendering pane:
   * ```
   * <three-orbit-controls [listeningControlElement]=mainRenderer.renderPane>
   *   <three-renderer #mainRenderer>
   *     ...
   *   </three-renderer>
   * </three-orbit-controls>
   * ```
   */
  @Input() listeningControlElement: ElementRef | undefined = undefined;

  @Input() rotateSpeed = 1.0;
  @Input() zoomSpeed = 1.2;

  private controls: OrbitControls;

  constructor() {
    console.log('OrbitControlsDirective.constructor');
  }

  ngOnChanges(changes: SimpleChanges) {
    // If the THREE.js OrbitControls are not set up yet, we do not need to update
    // anything as they will pick the new values from the @Input properties automatically
    // upon creation.
    if (!this.controls) {
      return;
    }

    if (changes['rotateSpeed']) {
      this.controls.rotateSpeed = this.rotateSpeed;
    }
    if (changes['zoomSpeed']) {
      this.controls.zoomSpeed = this.zoomSpeed;
    }
    if (changes['listeningControlElement']) {
      // The DOM element the OrbitControls listen on cannot be changed once an
      // OrbitControls object is created. We thus need to recreate it.
      this.controls.dispose();
      this.setUpOrbitControls();
    }
  }

  ngOnDestroy() {
    this.controls.dispose();
  }

  private setUpOrbitControls() {
    this.controls = new OrbitControls(
      this.childCameras.first.camera,
      this.listeningControlElement && this.listeningControlElement.nativeElement
    );
    this.controls.rotateSpeed = this.rotateSpeed;
    this.controls.zoomSpeed = this.zoomSpeed;
    // this.controls.addEventListener('change', this.childRenderers.first.render);
    // this.childRenderers.first.render();
  }

  ngAfterViewInit(): void {
    console.log('OrbitControlsDirective.ngAfterViewInit');
    if (this.childCameras === undefined || this.childCameras.first === undefined) {
      throw new Error('Camera is not found');
    }
    if (this.childRenderers === undefined || this.childRenderers.first === undefined) {
      throw new Error('Renderer is not found');
    }

    this.setUpOrbitControls();
  }

}
