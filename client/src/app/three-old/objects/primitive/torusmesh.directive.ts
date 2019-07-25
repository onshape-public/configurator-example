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

import { Directive, Input, AfterViewInit, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractMesh } from '../abstract-mesh-3d';
import { AbstractObject3D } from '../abstract-object-3d';

@Directive({
  selector: 'three-torusmesh',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => TorusmeshDirective) }]
})
export class TorusmeshDirective extends AbstractMesh {
  //  - Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
  @Input()
  radius: number;
  //  — Radius of the tube. Default is 0.4.
  @Input()
  tube: number;
  @Input()
  radialSegments: number; //  — Default is 8
  @Input()
  tubularSegments: number; //  — Default is 6.
  @Input()
  arc: number; // — Central angle. Default is Math.PI * 2.

  constructor() { 
    super();
    console.log('TorusmeshDirective.constructor');
  }

  protected newObject3DInstance(): THREE.Mesh {
    this.radius *= 1;
    this.tube *= 1;
    this.radialSegments *= 1;
    this.tubularSegments *= 1;

    console.log('TorusmeshDirective.newObject3DInstance', this.radius, this.tube, 
      this.radialSegments, this.tubularSegments, this.arc );

    const geometry = new THREE.TorusGeometry(this.radius, this.tube, 
      this.radialSegments, this.tubularSegments);
    const material: THREE.MeshBasicMaterial = this.getMaterial();
    return new THREE.Mesh(geometry, material);
  }

  protected afterInit(): void {
    console.log('TorusmeshDirective.afterInit');
    // none
  }
}
