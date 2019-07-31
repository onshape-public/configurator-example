import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractDocumentElement, Appearance, Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ConfiguredAssembly, ConfiguredPart, EnumOption, ParameterValue, SubAssembly, WVM} from '../../../../typescript-generator/configurator';
import {Options} from 'ng5-slider';

@Component({
  selector: 'app-parameter-quantity',
  templateUrl: './parameter-quantity.component.html',
  styleUrls: ['./parameter-quantity.component.scss']
})
export class ParameterQuantityComponent implements OnInit {
  @Input() parameter: ConfigurationParameterQuantity;
  _parameterValue: ParameterValue;
  _appliedParameterValue: ParameterValue;

  @Input() set parameterValue(pv: ParameterValue) {
    this._parameterValue = pv;
    if (this._appliedParameterValue) {
      this.value = +this._parameterValue.value.split('+')[0];
      this.updateValue(null);
      this.sliderRefresh.emit();
    }
  }

  get parameterValue() {
    return this._parameterValue;
  }

  @Input() set appliedParameterValue(apv: ParameterValue) {
    this._appliedParameterValue = apv;
    if (this._parameterValue) {
      this.changed = this._parameterValue.value !== this._appliedParameterValue.value;
      this.sliderRefresh.emit();
    }
  }

  get appliedParameterValue() {
    return this._appliedParameterValue;
  }

  @Output() parameterValueChange = new EventEmitter<ParameterValue>();
  value: number;
  options: Options = {};
  changed: boolean;
  sliderRefresh = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    this.changed = false;
    this.value = this._appliedParameterValue.value.match(/[-]?([0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*(\w*)/)[1] as any as number;
    this.options = {
      floor: this.parameter.minValue,
      ceil: this.parameter.maxValue,
      step: 1,
      disabled: false,
      showTicks: false,
      draggableRange: false,
      getPointerColor: (value: number): string => {
        return this.changed ? '#28a745' : '#007bff';
      }
    };
  }

  updateValue(event: any) {
    this.value = Math.min(Math.max(this.value, this.parameter.minValue), this.parameter.maxValue);
    const fullValue = this.value + '+' + this.parameter.units;
    if (fullValue !== this._parameterValue.value) {
      this._parameterValue.value = fullValue;
      this.parameterValueChange.emit(this._parameterValue);
    }
    this.changed = this._parameterValue.value !== this._appliedParameterValue.value;
  }

}
