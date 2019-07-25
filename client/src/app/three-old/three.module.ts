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
 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrbitControlsDirective } from './controls/orbit-controls.directive';
import { ObjLoaderDirective } from './objects/loaders/obj-loader.directive';
import { StlLoaderDirective } from './objects/loaders/stl-loader.directive';
import { Rad2DegPipe } from './pipes/rad2deg.pipe';
import { Deg2RadPipe } from './pipes/deg2rad.pipe';
import { PerspectiveCameraDirective } from './cameras/perspective-camera.directive';
import { WebGLRendererComponent } from './renderer/webgl-renderer.component';
import { SceneDirective } from './objects/scene.directive';
import { AxesHelperDirective } from './objects/helpers/axes-helper.directive';
import { GridHelperDirective } from './objects/helpers/grid-helper.directive';
import { ObjectLoaderDirective } from './objects/loaders/object-loader.directive';
import { PointLightDirective } from './objects/light/point-light.directive';
import { SpheremeshDirective } from './objects/primitive/spheremesh.directive';
import { PlanemeshDirective } from './objects/primitive/planemesh.directive';
import { CylindermeshDirective } from './objects/primitive/cylindermesh.directive';
import { TorusmeshDirective } from './objects/primitive/torusmesh.directive';
import { EmptyDirective } from './objects/helpers/empty.directive';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {OrthographicCameraDirective} from './cameras/orthographic-camera.directive';
import {AmbientLightDirective} from './objects/light/ambient-light.directive';
import {DirectionalLightDirective} from './objects/light/directional-light.directive';
import {CameraHelperDirective} from './objects/helpers/camera-helper.directive';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  declarations: [
    OrbitControlsDirective,
    ObjLoaderDirective,
    StlLoaderDirective,
    Rad2DegPipe,
    Deg2RadPipe,
    PerspectiveCameraDirective,
    OrthographicCameraDirective,
    WebGLRendererComponent,
    SceneDirective,
    AxesHelperDirective,
    GridHelperDirective,
    CameraHelperDirective,
    ObjectLoaderDirective,
    PointLightDirective,
    AmbientLightDirective,
    DirectionalLightDirective,
    CylindermeshDirective,
    TorusmeshDirective,
    SpheremeshDirective,
    PlanemeshDirective,
    EmptyDirective
  ],
  exports: [
    OrbitControlsDirective,
    ObjLoaderDirective,
    StlLoaderDirective,
    Rad2DegPipe,
    Deg2RadPipe,
    PerspectiveCameraDirective,
    OrthographicCameraDirective,
    WebGLRendererComponent,
    SceneDirective,
    AxesHelperDirective,
    GridHelperDirective,
    CameraHelperDirective,
    ObjectLoaderDirective,
    PointLightDirective,
    AmbientLightDirective,
    DirectionalLightDirective,
    CylindermeshDirective,
    TorusmeshDirective,
    SpheremeshDirective,
    PlanemeshDirective,
    EmptyDirective
  ]
})
export class ThreeModule {
  constructor() {
    library.add(fas);
  }
}

