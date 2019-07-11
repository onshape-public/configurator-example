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
  selector: 'three-cylindermesh',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => CylindermeshDirective) }]
})
export class CylindermeshDirective extends AbstractMesh {
  @Input()
  radiustop: number;
  @Input()
  radiusbottom: number;
  @Input()
  cylheight: number;
  @Input()
  radialSegments: number;
  @Input()
  hightSegments: number;

  constructor() { 
    super();
    console.log('CylindermeshDirective.constructor');
  }

  protected newObject3DInstance(): THREE.Mesh {
    console.log('CylindermeshDirective.newObject3DInstance');
    const geometry = new THREE.CylinderGeometry(this.radiustop, this.radiusbottom, this.cylheight, this.radialSegments, this.hightSegments);
    const material: THREE.MeshBasicMaterial = this.getMaterial();
    return new THREE.Mesh(geometry, material);
  }

  protected afterInit(): void {
    console.log('CylindermeshDirective.afterInit');
    // none
  }
}
