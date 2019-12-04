import {Directive, forwardRef} from '@angular/core';
import {AbstractPass} from './abstract-pass';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass';
import {WebGLRendererComponent} from '../webgl-renderer.component';
import {AbstractObject3D} from '../../objects/abstract-object-3d';
import * as THREE from 'three';

@Directive({
    selector: 'three-outline-pass',
    providers: [{provide: AbstractPass, useExisting: forwardRef(() => OutlinePassDirective)}]
})
export class OutlinePassDirective extends AbstractPass<OutlinePass> {

    outlinePass: OutlinePass;

    constructor() {
        super();
    }

    setup(renderer: WebGLRendererComponent): OutlinePass {
        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), renderer.getScene(), renderer.getCamera());
       // this.outlinePass.visibleEdgeColor = new THREE.Color(1,0,0);
//        this.outlinePass = new OutlinePass(renderer.getSize(), renderer.getScene(), renderer.getCamera());
        renderer.hoverChange.subscribe((hovered: AbstractObject3D<THREE.Object3D>[]) => {
            this.outlinePass.selectedObjects = hovered.map((component) => component.getObject());
        });
        return this.outlinePass;
    }

}
