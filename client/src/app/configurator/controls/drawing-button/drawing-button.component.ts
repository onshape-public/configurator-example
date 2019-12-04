import {Component, Input, OnInit} from '@angular/core';
import {
    ConfigurableDrawing,
    Configuration,
    WVM
} from '../../../../typescript-generator/configurator';
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

    constructor(private http: HttpClient, private configuratorService: ConfiguratorService) {
    }

    ngOnInit() {
        this.drawings = new Array<ConfigurableDrawing>();
        const baseUrl = '/api/drawings'
            + this.configuratorService.getURLPath(this.documentId, this.wvmType, this.wvmId, this.elementId);
        if (this.drawingElements) {
            // Use only the specified drawings
            this.drawingElements.forEach((de) => {
                this.http.get(baseUrl + '/drawing/' + de).subscribe((drawing: ConfigurableDrawing) => this.drawings.push(drawing));
            });
        } else {
            // Fetch all available drawings
            this.http.get(baseUrl).subscribe((drawings: ConfigurableDrawing[]) => drawings.forEach(
                (drawing: ConfigurableDrawing) => this.drawings.push(drawing)));
        }
    }

    open(drawing: ConfigurableDrawing) {
        const url = '/api/drawings'
            + this.configuratorService.getURLPath(this.documentId, this.wvmType, this.wvmId, this.elementId)
            + '/c/' + this.configuratorService.getConfigurationString(this.configuration)
            + '/drawing/' + drawing.elementId + '.pdf';
        window.open(url, '_configurator_drawing');
    }

}
