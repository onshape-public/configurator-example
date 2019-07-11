import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractDocumentElement, Appearance, Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ConfiguredAssembly, ConfiguredPart, EnumOption, ParameterValue, SubAssembly, WVM} from '../../../../../configurator/target/typescript-generator/configurator';
import {Observable} from 'rxjs';
import { ConfiguratorService } from '../services/configurator.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-configurator',
  templateUrl: './configurator.component.html',
  styleUrls: ['./configurator.component.scss']
})
export class ConfiguratorComponent implements OnInit, OnChanges {

  @Input() documentId: string;
  @Input() wvmType: WVM;
  @Input() wvmId: string;
  @Input() elementId: string;
  @Input() drawingElements: string[];

  @Output() configurationChange = new EventEmitter<Configuration>(true);

  configurator$: Observable<Configurator>;
  configurator: Configurator;
  configuredAssembly: ConfiguredAssembly;
  configuration: Configuration;
  appliedConfiguration: Configuration;
  defaultConfiguration: Configuration;
  pi = Math.PI;
  halfpi = -1 * this.pi / 2;
  progress: number;
  inProgress: boolean;
  isDefault: boolean;
  changed: boolean;

  constructor(private configuratorService: ConfiguratorService) {
    this.configuredAssembly = null;
  }

  ngOnInit() {
    console.log(this.drawingElements);
    this.inProgress = false;
    this.progress = 100;
    this.configuratorService.progressChange.subscribe((p) => this.progress = p);
    this.configurator$ = this.configuratorService.getConfigurator(this.documentId,
      this.wvmType, this.wvmId, this.elementId);
    this.configurator$.subscribe({
      next: (configurator) => {
        this.configurator = configurator;
        this.defaultConfiguration = this.configuratorService.getDefaultConfiguration(configurator);
        this.configuration = _.cloneDeep(this.defaultConfiguration);
        this.appliedConfiguration = _.cloneDeep(this.defaultConfiguration);
        this.updateAssembly();
        },
      error: (err) => {
        console.log(err);
      }});
    this.configurationChange.subscribe((configuration) => {
      this.changed = !_.isEqual(this.configuration, this.appliedConfiguration);
      this.isDefault = _.isEqual(this.appliedConfiguration, this.defaultConfiguration);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    //this.ngOnInit();
  }

  updateAssembly() {
    console.log('Updating assembly');
    this.inProgress = true;
    this.configuratorService.getAssembly(this.configurator, this.configuration)
      .subscribe({next: (configuredAssembly) => {
          this.configuredAssembly = configuredAssembly;
          this.appliedConfiguration = _.cloneDeep(this.configuration);
          this.configuratorService.progressChange.subscribe((prog) => {
            if (prog >= 100) {
              this.inProgress = false;
              this.changed = !_.isEqual(this.configuration, this.appliedConfiguration);
              this.isDefault = _.isEqual(this.appliedConfiguration, this.defaultConfiguration);
            }
          });
        },
        error: (err) => {
          console.log(err);
          this.inProgress = false;
          this.changed = !_.isEqual(this.configuration, this.appliedConfiguration);
          this.isDefault = _.isEqual(this.appliedConfiguration, this.defaultConfiguration);
        }});
  }

  parameterValueChange(parameterValue: ParameterValue) {
    this.configurationChange.emit(this.configuration);
  }

  quantityParameter(parameter: ConfigurationParameter): ConfigurationParameterQuantity {
    return parameter as ConfigurationParameterQuantity;
  }

  enumParameter(parameter: ConfigurationParameter): ConfigurationParameterEnum {
    return parameter as ConfigurationParameterEnum;
  }

  undo() {
    this.configuration = _.cloneDeep(this.appliedConfiguration);
    this.configurationChange.emit(this.configuration);
  }

  home() {
    this.configuration = _.cloneDeep(this.defaultConfiguration);
    this.configurationChange.emit(this.configuration);
  }

}
