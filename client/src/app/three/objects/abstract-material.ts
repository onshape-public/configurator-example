
// material could have id, so multiple can be added and referred to, else default to first one
import * as THREE from 'three';
import {Input, OnChanges, SimpleChanges} from '@angular/core';

export abstract class AbstractMaterial implements OnChanges {
  @Input() id: string;

  private material: THREE.Material;

  getMaterial(): THREE.Material {
    return this.material;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }
}
