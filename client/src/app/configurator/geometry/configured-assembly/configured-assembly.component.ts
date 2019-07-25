import {Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractDocumentElement, Appearance, Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ConfiguredAssembly, ConfiguredPart, EnumOption, ParameterValue, SubAssembly, WVM} from '../../../../typescript-generator/configurator';
import {Observable} from 'rxjs';
import {AbstractObject3D} from 'atft/';
import * as THREE from 'three';

@Component({
  selector: 'app-configured-assembly',
  templateUrl: './configured-assembly.component.html',
  styleUrls: ['./configured-assembly.component.scss'],
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => ConfiguredAssemblyComponent) }]
})
export class ConfiguredAssemblyComponent extends AbstractObject3D<THREE.Group> implements OnInit, OnChanges {
  @Input() configuredAssembly: ConfiguredAssembly;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes.configuredAssembly) {
      //this.updateChildNodes();
    }
  }

  protected newObject3DInstance(): THREE.Group {
    return new THREE.Group();
  }

  protected afterInit(): void {
    console.log('Assembly with ' + this.configuredAssembly.parts.length + ' parts and ' + + this.configuredAssembly.subAssemblies.length + ' subassemblies and ' + this.childNodes.size + ' child nodes, renderer: ' + this.getRendererComponent());
  }

  trackElement(index: number, element: any) {
    return element ? element.instanceId : null;
  }
}
