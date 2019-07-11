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

import { Input } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

export abstract class AbstractMesh extends AbstractObject3D<THREE.Mesh> {
  @Input()
  material: string;
  @Input()
  materialColor: number;

  constructor() {
    super();
    console.log('AbstractMesh.constructor');
  }


  public getMaterial(): THREE.MeshBasicMaterial {
    let appliedColor = 0xffff00;
    if (this.materialColor !== undefined ) {
      appliedColor = this.materialColor * 1;
    }
    console.log('AbstractMesh.getMaterial.appliedColor: ', appliedColor);

    if (this.material === 'lamb' ) {
      return new THREE.MeshLambertMaterial({color: appliedColor, side: THREE.DoubleSide});
    } else {
      return new THREE.MeshBasicMaterial({color: appliedColor, side: THREE.DoubleSide});
    }
  }
}
