/*
 * The MIT License
 *
 * Copyright (c) 2017 Mihail Akimenko
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
    Component,
    ViewChild,
    ElementRef,
    ContentChild,
    HostListener,
    AfterViewInit, AfterContentInit, NgZone, ChangeDetectorRef
} from '@angular/core';
import * as THREE from 'three';
import {SceneDirective} from '../objects/scene.directive';
import {AbstractCamera} from '../cameras/abstract-camera';
import {RendererListener} from './renderer-listener';
import {fromEvent} from 'rxjs';
import {auditTime} from 'rxjs/operators';
import {SelectionManager} from './selection-manager';
import {OrthographicCamera} from 'three';


@Component({
    selector: 'three-webgl-renderer',
    templateUrl: './webgl-renderer.component.html',
    styleUrls: ['./webgl-renderer.component.scss']
})
export class WebGLRendererComponent implements AfterViewInit, AfterContentInit {

    private renderer: THREE.WebGLRenderer;
    private viewInitialized = false;
    private loading: boolean;
    private rendererListeners: Set<RendererListener>;
    public progressMap: Map<String, number>;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private preHovered: Array<THREE.Intersection>;
    private hovered: Array<THREE.Intersection>;
    private clock: THREE.Clock;
    private selectionManager: SelectionManager;
    @ViewChild('canvas', {static: true})
    private canvasRef: ElementRef;

    @ContentChild(SceneDirective, {static: true}) sceneComponent: SceneDirective;
    @ContentChild(AbstractCamera, {static: true}) cameraComponent: AbstractCamera<THREE.Camera>;

    constructor(private zone: NgZone, private changeDetector: ChangeDetectorRef) {
        console.log('RendererComponent.constructor');
        this.render = this.render.bind(this);
        this.loading = true;
        this.rendererListeners = new Set<RendererListener>();
        this.progressMap = new Map<String, number>();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.hovered = new Array<THREE.Intersection>();
        this.clock = new THREE.Clock();
    }

    ngAfterViewInit() {
        console.log('RendererComponent.ngAfterViewInit');
        this.viewInitialized = true;
        this.startRendering();
    }

    ngAfterContentInit(): void {
    }

    /**
     * The render pane on which the scene is rendered.
     * Currently, only the WebGL renderer with a canvas is used in this
     * implementation, so this property will always be an ElementRef to the
     * underlying <canvas> element.
     *
     * @example This property can be used to restrict the orbit controls (i.e. the
     * area which is listened for mouse move and zoom events) to the rendering pane:
     * ```
     * <three-orbit-controls [rotateSpeed]=1 [zoomSpeed]=1.2 [listeningControlElement]=mainRenderer.renderPane>
     *   <three-renderer #mainRenderer>
     *     ...
     *   </three-renderer>
     * </three-orbit-controls>
     * ```
     */
    public get renderPane(): ElementRef {
        return this.canvasRef;
    }

    public get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private startRendering() {
        console.log('RendererComponent.startRendering');
        this.sceneComponent.setRendererComponent(this);
        this.clock.start();
        this.selectionManager = new SelectionManager(this.sceneComponent);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.autoClear = true;

        this.zone.runOutsideAngular(() => {
            fromEvent(this.canvasRef.nativeElement, 'mousemove').pipe(auditTime(100)).subscribe(event => {
                this.mouse.x = (event['clientX'] / this.canvasRef.nativeElement.width) * 2 - 1;
                this.mouse.y = -(event['clientY'] / this.canvasRef.nativeElement.height) * 2 + 1;
                this.raycaster.setFromCamera(this.mouse, this.getCamera());
                const newHovered = new Array<THREE.Intersection>();
                this.raycaster.intersectObjects(this.getScene().children, true, newHovered);
                const components = newHovered
                    .sort((a, b) => a.distance - b.distance)
                    .map((intersection) => intersection.object)
                    .filter((v, i, a) => a.indexOf(v) === i);
                this.selectionManager.setHovered(components
                    .map((component) => this.sceneComponent.find(component))
                    .filter((component) => component != null));
            });
            fromEvent(this.canvasRef.nativeElement, 'click').subscribe(event => {
                console.log(event);
                this.mouse.x = (event['clientX'] / this.canvasRef.nativeElement.width) * 2 - 1;
                this.mouse.y = -(event['clientY'] / this.canvasRef.nativeElement.height) * 2 + 1;
                this.raycaster.setFromCamera(this.mouse, this.getCamera());
                const newHovered = new Array<THREE.Intersection>();
                this.raycaster.intersectObjects(this.getScene().children, true, newHovered);
                const components = newHovered.map((intersection) => intersection.object).filter((v, i, a) => a.indexOf(v) === i);
                if (event['ctrlKey']) {
                    this.selectionManager.addSelected(components
                        .map((component) => this.sceneComponent.find(component))
                        .filter((component) => component != null));
                } else {
                    this.selectionManager.setSelected(components
                        .map((component) => this.sceneComponent.find(component))
                        .filter((component) => component != null));
                }
            });
        });

        this.updateChildCamerasAspectRatio();
        this.rendererListeners.forEach(rl => rl.onStartRendering());
        this.zone.runOutsideAngular(() => {
            requestAnimationFrame(this.doRender.bind(this));
        });
    }

    public render() {
        if (this.viewInitialized) {
            this.renderer.render(this.getScene(), this.getCamera());
            //this.raycaster.setFromCamera(this.mouse, this.getCamera());
            //this.renderer.render(this.getScene(), this.getCamera());
            //this.hovered.length = 0;
            //this.raycaster.intersectObjects(this.getScene().children, true, this.hovered);
            //console.log(this.hovered);
            // this.rendererListeners.forEach(rl => rl.onRender());
        }
    }

    private doRender() {
        const delta = this.clock.getDelta();
        this.rendererListeners.forEach((rl) => rl.onRender(delta));
        this.renderer.render(this.getScene(), this.getCamera());
        requestAnimationFrame(this.doRender.bind(this));
    }

    public getCamera(): THREE.Camera {
        return this.cameraComponent.getCamera();
    }

    public getScene(): THREE.Scene {
        if (!this.sceneComponent) {
            return null;
        }
        return this.sceneComponent.getObject();
    }

    private calculateAspectRatio(): number {
        const height = this.canvas.clientHeight;
        if (height === 0) {
            return 0;
        }
        return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    @HostListener('window:resize', ['$event'])
    public onResize(event: Event) {
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        console.log('RendererComponent.onResize: ' + this.canvas.clientWidth + ', ' + this.canvas.clientHeight);

        this.updateChildCamerasAspectRatio();

        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render();
    }

    public updateChildCamerasAspectRatio() {
        const aspect = this.calculateAspectRatio();
        this.cameraComponent.updateAspectRatio(aspect);
    }

    public onProgress(source: string, message: string, progress: number) {
        /*if (source.length > 0) {
          setTimeout(() => {
            if (progress >= 1.0) {
              // Loading is complete, remove the progress data and render
              this.progressMap.delete(source);
            } else {
              this.progressMap.set(source, progress);
            }
          });
        }*/
    }

    public addListener(listener: RendererListener) {
        this.rendererListeners.add(listener);
    }

    public removeListener(listener: RendererListener) {
        this.rendererListeners.delete(listener);
    }
}
