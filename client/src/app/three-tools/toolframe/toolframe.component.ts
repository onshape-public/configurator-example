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
import { Component, ContentChild, ContentChildren, OnInit, AfterContentInit, QueryList } from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { WebGLRendererComponent } from '../../three/renderer/webgl-renderer.component';

@Component({
  selector: 'three-toolframe',
  templateUrl: './toolframe.component.html',
  styleUrls: ['./toolframe.component.scss']
})
export class ToolframeComponent implements OnInit, AfterContentInit {

  @ContentChild(WebGLRendererComponent, {static: true}) rendererComponent: WebGLRendererComponent;
  @ContentChildren(ToolbarComponent) toolbarComponents: QueryList<ToolbarComponent>;

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    // Inject renderer into toolbars
    if (!this.rendererComponent) {
      throw new Error('<three-toolframe> component must contain a <three-webgl-renderer> component');
    }
    this.toolbarComponents.forEach(toolbar => toolbar.setRendererComponent(this.rendererComponent));
  }
}
