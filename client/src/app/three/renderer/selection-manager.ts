import {AbstractObject3D} from '../objects/abstract-object-3d';
import * as THREE from 'three';
import {Subject} from 'rxjs';


export class SelectionManager {

    private scene: AbstractObject3D<THREE.Object3D>;
    private hovered: Map<THREE.Object3D, AbstractObject3D<THREE.Object3D>>;
    private selected: Map<THREE.Object3D, AbstractObject3D<THREE.Object3D>>;
    private selectionChange: Subject<AbstractObject3D<THREE.Object3D>[]>;
    private hoverChange: Subject<AbstractObject3D<THREE.Object3D>[]>;

    constructor(scene: AbstractObject3D<THREE.Object3D>,
                selectionChange: Subject<AbstractObject3D<THREE.Object3D> []>,
                hoverChange: Subject<AbstractObject3D<THREE.Object3D>[]>) {
        this.scene = scene;
        this.hovered = new Map<THREE.Object3D, AbstractObject3D<THREE.Object3D>>();
        this.selected = new Map<THREE.Object3D, AbstractObject3D<THREE.Object3D>>();
        this.hoverChange = hoverChange;
        this.selectionChange = selectionChange;
    }

    public setHovered(objects: THREE.Object3D[]): void {
        // Added
        const added = objects.filter((obj) => !this.hovered.has(obj));
        // Removed
        const removed = Array.from(this.hovered.keys()).filter((obj) => objects.indexOf(obj) === -1);
        // Apply removed
        removed.forEach((obj) => {
            const component = this.hovered.get(obj);
            if (component) {
                component.onMouseOut();
            }
            this.hovered.delete(obj);
        });
        // Apply added
        added.forEach((obj) => {
            const component = this.scene.find(obj);
            if (component) {
                component.onMouseOver();
            }
            this.hovered.set(obj, component);
        });
        // Fire event
        if (added.length > 0 || removed.length > 0) {
            this.hoverChange.next(this.getHovered());
        }
    }

    public setSelected(objects: THREE.Object3D[]): void {
        // Added
        const added = objects.filter((obj) => !this.selected.has(obj));
        // Remained
        const remained = objects.filter((obj) => this.selected.has(obj));
        // Removed
        const removed = Array.from(this.selected.keys()).filter((obj) => objects.indexOf(obj) === -1);
        // Apply removed
        removed.forEach((obj) => {
            const component = this.selected.get(obj);
            if (component) {
                component.onDeselect();
            }
            this.selected.delete(obj);
        });
        // Apply remained
        remained.forEach((obj) => {
            const component = this.selected.get(obj);
            if (component) {
                component.onClick();
            }
        });
        // Apply added
        added.forEach((obj) => {
            const component = this.scene.find(obj);
            if (component) {
                component.onClick();
                component.onSelect();
            }
            this.selected.set(obj, component);
        });
        // Fire event
        if (added.length > 0 || removed.length > 0) {
            this.selectionChange.next(this.getSelected());
        }
    }

    public toggleSelected(objects: THREE.Object3D[]): void {
        // Added
        const added = objects.filter((obj) => !this.selected.has(obj));
        // Removed
        const removed = objects.filter((obj) => this.selected.has(obj));
        // Apply removed
        removed.forEach((obj) => {
                const component = this.selected.get(obj);
                if (component) {
                    component.onClick();
                    component.onDeselect();
                }
                this.hovered.delete(obj);
            }
        );
        // Apply added
        added.forEach((obj) => {
            const component = this.scene.find(obj);
            if (component) {
                component.onClick();
                component.onSelect();
            }
            this.selected.set(obj, component);
        });
        // Fire event
        if (added.length > 0 || removed.length > 0) {
            this.selectionChange.next(this.getSelected());
        }
    }

    public getHovered(): AbstractObject3D<THREE.Object3D>[] {
        return Array.from(this.hovered.values()).filter((obj) => obj !== null);
    }

    public getSelected(): AbstractObject3D<THREE.Object3D>[] {
        return Array.from(this.selected.values()).filter((obj) => obj !== null);
    }
}
