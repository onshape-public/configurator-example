import {AbstractObject3D} from '../objects/abstract-object-3d';
import * as THREE from 'three';


export class SelectionManager {

    private scene: AbstractObject3D<THREE.Object3D>;

    constructor(scene: AbstractObject3D<THREE.Object3D>) {
        this.scene = scene;
    }

    public setHovered(objects: AbstractObject3D<THREE.Object3D>[]): void {

    }

    public setSelected(objects: AbstractObject3D<THREE.Object3D>[]): void {

    }

    public addSelected(objects: AbstractObject3D<THREE.Object3D>[]): void {

    }

    public getSelected(): AbstractObject3D<THREE.Object3D>[] {
        return new Array();
    }
}
