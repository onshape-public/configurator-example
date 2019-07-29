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

import { Directive, forwardRef, Input } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from '../abstract-object-3d';
import { AbstractModelLoader } from './abstract-model-loader';

import { STLLoader } from '../../js/STLLoader';

@Directive({
  selector: 'three-stl-loader',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => StlLoaderDirective) }]
})
export class StlLoaderDirective extends AbstractModelLoader {
  private loader = new STLLoader();

  protected async loadModelObject() {
      return new Promise<THREE.Object3D>((resolve, reject) => {
        this.loader.load(this.model, geometry => {
          const material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
          const mesh = new THREE.Mesh( geometry, material );
          resolve(mesh);
        },
          (progress) => { this.onProgress('Loading...', progress.loaded / progress.total); },
          reject
        );
      });
  }
}
