import {Component, Input, OnInit} from '@angular/core';
import { WVM} from '../../../../../../configurator/target/typescript-generator/configurator';

@Component({
  selector: 'app-onshape-button',
  templateUrl: './onshape-button.component.html',
  styleUrls: ['./onshape-button.component.scss']
})
export class OnshapeButtonComponent implements OnInit {
  @Input() documentId: string;
  @Input() wvmType: WVM;
  @Input() wvmId: string;
  @Input() elementId: string;
  constructor() { }

  ngOnInit() {
  }

  openOnshape() {
    let url = 'https://cad.onshape.com/documents/' + this.documentId;
    switch (this.wvmType) {
      case 'Workspace':
        url += '/w/';
        break;
      case 'Version':
        url += '/v/';
        break;
      case 'Microversion':
        url += '/m/';
        break;
    }
    url += this.wvmId + '/e/' + this.elementId;
    window.open(url, '_blank');
  }
}
