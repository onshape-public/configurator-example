import {Component, Input, OnInit} from '@angular/core';
import {ConfiguratorService} from '../../services/configurator.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  progress: number;

  constructor(private configuratorService: ConfiguratorService) {

  }

  ngOnInit() {
    this.configuratorService.progressChange.subscribe((progress) => this.progress = progress);
  }

}
