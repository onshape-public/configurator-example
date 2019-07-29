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
import {AfterViewInit, Component, Input, OnChanges, OnDestroy, forwardRef, SimpleChanges} from '@angular/core';
import { AbstractTool } from '../abstract-tool';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

@Component({
  selector: 'orbit-controls',
  templateUrl: './orbit-controls.component.html',
  styleUrls: ['./orbit-controls.component.scss'],
  providers: [{provide: AbstractTool, useExisting: forwardRef(() => OrbitControlsComponent)}]
})
export class OrbitControlsComponent extends AbstractTool implements OnChanges, OnDestroy {
  @Input() rotateSpeed = 1.0;
  @Input() zoomSpeed = 1.2;
  @Input() zoomToFit = true;
  @Input() zoomToFitInitial = false;

  private controls: OrbitControls;

  constructor() {
    super('Orbit Controls', 'navigation', true, true);
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
    console.log("Starting Orbit Controls");
    this.controls = new OrbitControls(
      this.getRendererComponent().getCamera(),
      this.getRendererComponent().canvas
  );
    this.controls.rotateSpeed = this.rotateSpeed;
    this.controls.zoomSpeed = this.zoomSpeed;
    this.controls.addEventListener('change', this.renderer.render);
    if (this.zoomToFitInitial) {
      this.doZoomToFit();
    }
    this.renderer.render();
  }

  onStartRendering() {
    super.onStartRendering();
    this.setUpOrbitControls();
  }

  public doZoomToFit() {
    // https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/17
    const camera = <THREE.PerspectiveCamera>this.getRendererComponent().getCamera();
    const scene = this.getRendererComponent().getScene();
    const object = scene;
    const offset = 1.25;

    const boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject( object );
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max( size.x, size.y, size.z );
    const fov = camera.fov * ( Math.PI / 180 );
    let cameraZ = Math.abs( maxDim / 2 * Math.tan( fov * 2 ) ); // Applied fifonik correction
    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

      // <--- NEW CODE
      // Method 1 to get object's world position
      scene.updateMatrixWorld(); // Update world positions
      const objectWorldPosition = new THREE.Vector3();
      objectWorldPosition.setFromMatrixPosition( object.matrixWorld );

      // Method 2 to get object's world position
      // objectWorldPosition = object.getWorldPosition();

      const directionVector = camera.position.sub(objectWorldPosition); 	// Get vector from camera to object
      const unitDirectionVector = directionVector.normalize(); // Convert to unit vector
      camera.translateOnAxis(unitDirectionVector, cameraZ); // position = unitDirectionVector.multiplyScalar(cameraZ); // Multiply unit vector times cameraZ distance
      camera.lookAt(objectWorldPosition); // Look at object
      // --->

      const minZ = boundingBox.min.z;
      const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

      camera.far = cameraToFarEdge * 3;
      camera.updateProjectionMatrix();

      if ( this.controls ) {

        // set camera to rotate around center of loaded object
        this.controls.target = center;

        // prevent camera from zooming out far enough to create far plane cutoff
        this.controls.maxDistance = cameraToFarEdge * 2;

      } else {

        camera.lookAt( center );

      }

  }
}
