import {Component, Input, OnInit} from '@angular/core';
import { ConfigurableDrawing, AbstractDocumentElement, Appearance, Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ConfiguredAssembly, ConfiguredPart, EnumOption, ParameterValue, SubAssembly, WVM} from '../../../../../../configurator/target/typescript-generator/configurator';
import {HttpClient} from '@angular/common/http';
import {ConfiguratorService} from '../../services/configurator.service';

@Component({
  selector: 'app-drawing-button',
  templateUrl: './drawing-button.component.html',
  styleUrls: ['./drawing-button.component.scss']
})
export class DrawingButtonComponent implements OnInit {
  @Input() documentId: string;
  @Input() wvmType: WVM;
  @Input() wvmId: string;
  @Input() elementId: string;
  @Input() drawingElements: string[];
  @Input() configuration: Configuration;

  drawings: ConfigurableDrawing[];

  constructor(private http: HttpClient, private configuratorService: ConfiguratorService) { }

  ngOnInit() {
    this.drawings = new Array<ConfigurableDrawing>();
    const baseUrl = '/api/drawings'
      + this.configuratorService.getURLPath(this.documentId, this.wvmType, this.wvmId, this.elementId)
      + '/drawing/';
    this.drawingElements.forEach((de) => {
      this.http.get(baseUrl + de).subscribe((drawing) => this.drawings.push(drawing as ConfigurableDrawing));
    });
  }

  open(drawing: ConfigurableDrawing) {
    const url = '/api/drawings'
      + this.configuratorService.getURLPath(this.documentId, this.wvmType, this.wvmId, this.elementId)
      + '/c/' + this.configuratorService.getConfigurationString(this.configuration)
      + '/drawing/' + drawing.elementId + '.pdf';
    window.open(url, '_configurator_drawing');
  }

}
