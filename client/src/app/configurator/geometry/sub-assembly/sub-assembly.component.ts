import {Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractDocumentElement, Appearance, Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ConfiguredAssembly, ConfiguredPart, EnumOption, ParameterValue, SubAssembly, WVM} from '../../../../typescript-generator/configurator';
import {AbstractObject3D} from '../../../three/objects/abstract-object-3d';
import * as THREE from 'three';

@Component({
  selector: 'app-sub-assembly',
  templateUrl: './sub-assembly.component.html',
  styleUrls: ['./sub-assembly.component.scss'],
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => SubAssemblyComponent) }]
})
export class SubAssemblyComponent extends AbstractObject3D<THREE.Group> implements OnInit, OnChanges {
  @Input() subassembly: SubAssembly;

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  ngOnInit() {
  }

  protected afterInit(): void {
    console.log('Subassembly with ' + this.subassembly.parts.length + ' parts and ' + this.childNodes.size + ' child nodes, renderer: ' + this.getRendererComponent());
  }

  protected newObject3DInstance(): THREE.Group {
    return new THREE.Group();
  }

  trackElement(index: number, element: any) {
    return element ? element.instanceId : null;
  }
}
