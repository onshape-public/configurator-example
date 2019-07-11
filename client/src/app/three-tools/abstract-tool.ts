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

import {
  AfterViewInit,
  ContentChildren,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges
} from '@angular/core';
import {WebGLRendererComponent} from '../three/renderer/webgl-renderer.component';
import {RendererListener} from '../three/renderer/renderer-listener';

/**
 *
 *
 * @author Peter Harman peter.harman@cae.tech
 */
export abstract class AbstractTool implements RendererListener {
  renderer: WebGLRendererComponent;
// TODO: Have a tool category, of which only 1 is enabled?
  // TODO:
  public name: string;
  public category: string;
  public active: boolean;
  public enabled: boolean;

  protected constructor(name: string, category: string, active: boolean, enabled: boolean) {
    this.name = name;
    this.category = category;
    this.active = active;
    this.enabled = enabled;
  }

  public setRendererComponent(renderer: WebGLRendererComponent) {
    if (renderer && !this.renderer && this.enabled) {
      // Setting for the first time
      renderer.addListener(this);
    }
    if (this.renderer && !renderer && this.enabled) {
      // Setting to null
      this.renderer.removeListener(this);
    }
    this.renderer = renderer;
  }

  public getRendererComponent(): WebGLRendererComponent {
    return this.renderer;
  }

  public activate() {
    this.active = true;
  }

  public deactivate() {
    this.active = false;
  }

  public enable() {
    if (this.renderer && !this.enabled) {
      this.renderer.addListener(this);
    }
    this.enabled = true;
  }

  public disable() {
    if (this.renderer && this.enabled) {
      this.renderer.removeListener(this);
    }
    this.enabled = false;
  }

  public toggle() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  onRender(delta: number) {
  }

  onStartRendering() {
  }
}
