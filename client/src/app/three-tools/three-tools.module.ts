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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { ToolframeComponent } from './toolframe/toolframe.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { OrbitControlsComponent } from './orbit-controls/orbit-controls.component';
import { ExplodeComponent } from './explode/explode.component';
import { CameraControlsComponent } from './camera-controls/camera-controls.component';
import { Ng5SliderModule } from 'ng5-slider';

@NgModule({
  declarations: [
    ToolframeComponent,
    ToolbarComponent,
    OrbitControlsComponent,
    CameraControlsComponent,
    ExplodeComponent
  ],
  exports: [
    ToolframeComponent,
    ToolbarComponent,
    OrbitControlsComponent,
    CameraControlsComponent,
    ExplodeComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    FontAwesomeModule,
    Ng5SliderModule
  ]
})
export class ThreeToolsModule {
  constructor() {
    library.add(fas);
  }
}
