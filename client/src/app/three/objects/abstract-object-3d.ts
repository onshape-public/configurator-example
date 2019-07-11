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

 import {
  AfterContentInit,
  AfterViewInit,
  ViewChildren,
  ContentChildren, EventEmitter,
  Input,
  OnChanges, Output,
  QueryList,
  SimpleChanges, OnDestroy
 } from '@angular/core';
import * as THREE from 'three';
import {WebGLRendererComponent} from '../renderer/webgl-renderer.component';
import {AbstractMaterial} from './abstract-material';

export abstract class AbstractObject3D<T extends THREE.Object3D> implements AfterViewInit, OnChanges, AfterContentInit, OnDestroy {
  renderer: WebGLRendererComponent;

  @ViewChildren(AbstractObject3D) viewNodes: QueryList<AbstractObject3D<THREE.Object3D>>;
  @ContentChildren(AbstractObject3D, {descendants: false}) contentNodes: QueryList<AbstractObject3D<THREE.Object3D>>;
  @ContentChildren(AbstractMaterial, {descendants: false}) materials: QueryList<AbstractMaterial>;

  /**
   * Rotation in Euler angles (radians) with order X, Y, Z.
   */
  @Input() rotateX: number;

  /**
   * Rotation in Euler angles (radians) with order X, Y, Z.
   */
  @Input() rotateY: number;

  /**
   * Rotation in Euler angles (radians) with order X, Y, Z.
   */
  @Input() rotateZ: number;

  @Input() translateX: number;
  @Input() translateY: number;
  @Input() translateZ: number;

  @Input() matrix: number[];
  @Input() transposeMatrix = true;

  @Output() mouseOver: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() mouseOut: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() hover: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() click: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() select: EventEmitter<boolean> = new EventEmitter<boolean>();

  childNodes = new Set<AbstractObject3D<THREE.Object3D>>();
  childNodesChange = new EventEmitter<Set<AbstractObject3D<THREE.Object3D>>>();

  private object: T;
  private selected: boolean;

  protected rerender() {
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!this.object) {
      return;
    }

    let mustRerender = false;

    if (['rotateX', 'rotateY', 'rotateZ'].some(propName => propName in changes)) {
      this.applyRotation();
      mustRerender = true;
    }
    if (['translateX', 'translateY', 'translateZ'].some(propName => propName in changes)) {
      this.applyTranslation();
      mustRerender = true;
    }
    if (['matrix'].some(propName => propName in changes)) {
      this.applyMatrix();
      mustRerender = true;
    }

    if (mustRerender) {
      this.rerender();
    }
  }

  public updateChildNodes() {
    this.childNodes.clear();
    if (this.viewNodes != null) {
      this.viewNodes.filter(i => i !== this).forEach(child => this.childNodes.add(child));
    }
    if (this.contentNodes != null) {
      this.contentNodes.filter(i => i !== this).forEach(child => this.childNodes.add(child));
    }
    this.childNodesChange.emit(this.childNodes);
  }

  public setRendererComponent(renderer: WebGLRendererComponent) {
    this.renderer = renderer;
    this.childNodes.forEach(child => child.setRendererComponent(renderer));
    this.childNodesChange.subscribe((childNodes) => childNodes.forEach(child => child.setRendererComponent(renderer)));
    this.afterInit();
  }

  public getRendererComponent(): WebGLRendererComponent {
    return this.renderer;
  }

  public ngAfterContentInit(): void {
    this.updateChildNodes();
  }

  public ngAfterViewInit(): void {
    this.object = this.newObject3DInstance();

    this.applyTranslation();
    this.applyRotation();
    this.applyMatrix();

    this.updateChildNodes();
    this.childNodes.forEach(child => this.addChild(child.getObject()));
    this.childNodesChange.subscribe((childNodes) => {
      this.object.children.forEach((obj) => this.object.remove(obj));
      childNodes.forEach(child => this.addChild(child.getObject()));
    });
if (this.viewNodes) {
  this.viewNodes.changes.subscribe((newViewNodes) => {
    console.log('View nodes change');
    console.log(newViewNodes);
    newViewNodes.forEach((viewNode) => {
      if (this.object.children.indexOf(viewNode.getObject()) < 0) {
        viewNode.setRendererComponent(this.renderer);
        this.object.add(viewNode.getObject());
        console.log('Element added');
        console.log(viewNode);
      }
    });
    this.object.children.forEach((object) => {
      if (newViewNodes.filter((viewNode) => viewNode.getObject() === object).length === 0) {
        console.log('Element removed');
      }
    });
  });
}
  }

  /**
   *
   * @param object
   */
  public find(object: THREE.Object3D): AbstractObject3D<THREE.Object3D> {
    if (this.getObject() === object) {
      return this;
    }
    this.childNodes.forEach(child => {
      const childResult = child.find(object);
      if (childResult) {
        return childResult;
      }
    });
    // It is not owned by a child component, check if it is child geometry
    if (this.getObject().getObjectById(object.id)) {
      return this;
    }
    return null;
  }

  protected applyMatrix(): void {
    if (!this.matrix) {
      return;
    }
    const m = new THREE.Matrix4();
    switch (this.matrix.length) {
      case 9:
        m.set(
          this.matrix[0],
          this.matrix[1],
          this.matrix[2],
          0,
          this.matrix[3],
          this.matrix[4],
          this.matrix[5],
          0,
          this.matrix[6],
          this.matrix[7],
          this.matrix[8],
          0,
          0,
          0,
          0,
          1);
        this.object.matrixAutoUpdate = false;
        this.object.matrix.copy(this.transposeMatrix ? m.transpose() : m);
        return;
      case 16:
        m.set(
          this.matrix[0],
          this.matrix[1],
          this.matrix[2],
          this.matrix[3],
          this.matrix[4],
          this.matrix[5],
          this.matrix[6],
          this.matrix[7],
          this.matrix[8],
          this.matrix[9],
          this.matrix[10],
          this.matrix[11],
          this.matrix[12],
          this.matrix[13],
          this.matrix[14],
          this.matrix[15]);
        this.object.matrixAutoUpdate = false;
        this.object.matrix.copy(this.transposeMatrix ? m.transpose() : m);
        return;
      default:
        console.log('Wrong matrix length');
    }
  }

  private applyRotation(): void {
    this.object.rotation.set(
      this.rotateX || 0,
      this.rotateY || 0,
      this.rotateZ || 0,
      'XYZ'
    );
  }

  private applyTranslation(): void {
    this.object.position.set(
      this.translateX || 0,
      this.translateY || 0,
      this.translateZ || 0
    );
  }

  protected addChild(object: THREE.Object3D): void {
    this.object.add(object);
  }

  protected removeChild(object: THREE.Object3D): void {
    this.object.remove(object);
  }

  public getObject(): T {
    return this.object;
  }

  protected abstract newObject3DInstance(): T;

  protected abstract afterInit(): void;

  protected id(): string {
    return '';
  }

  public onProgress(message: string, progress: number) {
    console.log(message + progress + this.renderer);
    if (this.renderer) {
      this.renderer.onProgress(this.id(), message, progress);
    }
  }

  public onMouseOver(): void {
    this.mouseOver.emit();
    this.hover.emit(true);
  }

  public onMouseOut(): void {
    this.mouseOut.emit();
    this.hover.emit(false);
  }

  public onClick(): void {
    this.click.emit();
  }

  ngOnDestroy(): void {
    this.object.children.forEach((obj) => this.object.remove(obj));
  }

}
