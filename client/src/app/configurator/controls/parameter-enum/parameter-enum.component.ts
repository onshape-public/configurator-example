import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {AbstractDocumentElement, Appearance, Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ConfiguredAssembly, ConfiguredPart, EnumOption, ParameterValue, SubAssembly, WVM} from '../../../../../../configurator/target/typescript-generator/configurator';

@Component({
  selector: 'app-parameter-enum',
  templateUrl: './parameter-enum.component.html',
  styleUrls: ['./parameter-enum.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ParameterEnumComponent implements OnInit {
  @Input() parameter: ConfigurationParameterEnum;
  _parameterValue: ParameterValue;
  _appliedParameterValue: ParameterValue;

  @Input() set parameterValue(pv: ParameterValue) {
    this._parameterValue = pv;
    if (this._appliedParameterValue) {
      this.option = this._parameterValue.value;
      this.optionChange(this._parameterValue.value);
    }
  }

  get parameterValue() {
    return this._parameterValue;
  }

  @Input() set appliedParameterValue(apv: ParameterValue) {
    this._appliedParameterValue = apv;
    if (this._parameterValue) {
      this.changed = this._parameterValue.value !== this._appliedParameterValue.value;
    }
  }

  get appliedParameterValue() {
    return this._appliedParameterValue;
  }

  @Output() parameterValueChange = new EventEmitter<ParameterValue>();

  option: string;
  changed: boolean;

  constructor() {
    this.option = 'Default';
  }

  ngOnInit(): void {
    this.changed = false;
    this.optionChange(this._parameterValue.value);
  }

  optionChange(value: any) {
    if (value == null) {
      this.option = 'Default';
    }
    if (this._parameterValue.value !== this.option) {
      this._parameterValue.value = this.option;
      this.parameterValueChange.emit(this._parameterValue);
    }
    this.changed = this._parameterValue.value !== this._appliedParameterValue.value;
  }
}
