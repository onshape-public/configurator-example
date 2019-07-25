import {Component, Input, OnInit} from '@angular/core';
import { ExportFormat, WVM, Configuration } from '../../../../typescript-generator/configurator';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ConfiguratorService} from '../../services/configurator.service';
import { saveAs } from 'file-saver/dist/FileSaver';

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss']
})
export class ExportButtonComponent implements OnInit {
  @Input() documentId: string;
  @Input() wvmType: WVM;
  @Input() wvmId: string;
  @Input() elementId: string;
  @Input() configuration: Configuration;
  formats: ExportFormat[];
  inProgress = false;

  constructor(private http: HttpClient, private configuratorService: ConfiguratorService) {
    this.formats = new Array<ExportFormat>();
  }

  ngOnInit() {
    this.inProgress = true;
    this.http.get('/api/exports/formats').subscribe({
      next: (formats) => {
        const exportFormats = formats as ExportFormat[];
        exportFormats.forEach((format) => this.formats.push(format));
        this.inProgress = false;
      },
      error: (err) => { this.inProgress = false; }
    });
  }

  export(format: ExportFormat) {
    this.inProgress = true;
    const url = '/api/exports'
      + this.configuratorService.getURLPath(this.documentId, this.wvmType, this.wvmId, this.elementId)
      + '/c/' + this.configuratorService.getConfigurationString(this.configuration)
      + '/f/' + format.name.toLowerCase();
    const headers = new HttpHeaders();
    headers.set('Accept', 'application/octet-stream');
    this.http.get(url, {headers: headers, observe: 'response', responseType: 'blob'}).subscribe({
      next: (response) => {
        const contentDispositionHeader: string = response.headers.get('Content-Disposition');
        const parts: string[] = contentDispositionHeader.split(';');
        const filename = parts[1].split('=')[1];
        const blob = new Blob([response.body as any], {type: 'application/octet-stream'});
        saveAs(blob, filename);
        this.inProgress = false;
      },
      error: err => { this.inProgress = false; }
    });
  }
}
