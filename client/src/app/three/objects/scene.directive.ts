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

import { Directive, AfterViewInit, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';
import {WebGLRendererComponent} from '../renderer/webgl-renderer.component';

@Directive({
  selector: 'three-scene',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => SceneDirective) }]
})
export class SceneDirective extends AbstractObject3D<THREE.Scene> {

  constructor() {
    console.log('SceneDirective.constructor');
    super();
  }

  setRendererComponent(renderer: WebGLRendererComponent) {
    console.log('Setting renderer on scene');
    this.childNodes.forEach(child => console.log(child));
    super.setRendererComponent(renderer);
  }

  protected afterInit(): void {
    console.log('SceneDirective.afterInit');
  }

  protected newObject3DInstance(): THREE.Scene {
    console.log('SceneDirective.newObject3DInstance');
    return new THREE.Scene();
  }

  protected id(): string {
    return 'scene';
  }

}
