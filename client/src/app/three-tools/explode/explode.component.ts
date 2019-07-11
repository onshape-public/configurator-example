import { Component, OnInit } from '@angular/core';
import {Options} from 'ng5-slider';

@Component({
  selector: 'app-explode',
  templateUrl: './explode.component.html',
  styleUrls: ['./explode.component.scss']
})
export class ExplodeComponent implements OnInit {
  value: number;
  options: Options;
  constructor() { }

  ngOnInit() {
    this.value = 0;
    this.options = {
      floor: 0,
      ceil: 100,
      translate: (value: number): string => {
        return value + '%';
      }
    };
  }

  explode(value: number) {

  }

  open($event) {

  }
}
