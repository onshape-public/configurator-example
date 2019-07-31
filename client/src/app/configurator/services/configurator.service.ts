import {EventEmitter, Injectable, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AbstractDocumentElement, Appearance, Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ConfiguredAssembly, ConfiguredPart, EnumOption, ParameterValue, SubAssembly, WVM} from '../../../typescript-generator/configurator';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { STLLoader } from '../../three/js/STLLoader';
import * as THREE from 'three';
import {CacheService} from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguratorService {
  private loader = new STLLoader();

  private nRequested = 0;
  private nReturned = 0;
  public progressChange = new EventEmitter<number>(true);
  public progress: number;

  constructor(private http: HttpClient, private cache: CacheService) {
    this.progress = 100;
  }

  request() {
    this.nRequested++;
    this.progress = this.nRequested === 0 ? 100 : (100 * this.nReturned / this.nRequested);
    this.progressChange.emit(this.progress);
  }

  returned() {
    this.nReturned++;
    if (this.nReturned === this.nRequested) {
      this.nRequested = 0;
      this.nReturned = 0;
    }
    this.progress = this.nRequested === 0 ? 100 : (100 * this.nReturned / this.nRequested);
    this.progressChange.emit(this.progress);
  }

  getConfigurator(documentId: string, wvmType: WVM, wvmId: string, elementId: string): Observable<Configurator> {
    return this.http.get('/api/configurator' + this.getURLPath(documentId, wvmType, wvmId, elementId))
      .pipe(map((result) => result as Configurator));
  }

  getAssembly(configurator: Configurator, configuration: Configuration): Observable<ConfiguredAssembly> {
    this.request();
    // Construct the URL and a key for caching
    const urlPath = this.getURLPathFor(configurator);
    const key = 'assemblies' + urlPath + '/c/' + this.getConfigurationString(configuration);

    // Create an Observable for fetching from the API
    const fetchAssemblyObservable = new Observable((observer) => {
      this.http.get('/api/assemblies' + urlPath + '/c/' + this.getConfigurationString(configuration))
        .subscribe({
          next: (assembly) => {
            observer.next(assembly);
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
    });

    // Use either the cache or the observable to fetch the result
    return this.cache.get(key, fetchAssemblyObservable, 3600).pipe(map((result) => { this.returned(); return result; }));
  }

  getDefaultConfiguration(configurator: Configurator): Configuration {
    const configuration = new Configuration();
    configuration.values = [];
    configurator.parameters.forEach((parameter) => {
      const parameterValue = new ParameterValue();
      parameterValue.parameter = parameter.id;
      switch (parameter.type) {
        case 'quantity':
          const parameterQuantity = parameter as ConfigurationParameterQuantity;
          parameterValue.value = parameterQuantity.defaultValue + '+' + parameterQuantity.units;
          break;
        case 'enum':
          parameterValue.value = 'Default';
          break;
        default:
      }
      configuration.values.push(parameterValue);
    });
    console.log(configuration);
    return configuration;
  }

  getPart(part: ConfiguredPart, progressCallback: any): Observable<THREE.Object3D> {
    this.request();
    // Construct the URLs to the geometry and appearance
    const urlPath = this.getURLPathFor(part)  + '/c/'
      + encodeURIComponent(part.configuration)
      + '/p/' + encodeURIComponent(part.partId);
    const geometryURL = '/api/parts' + urlPath + '.stl';
    const appearanceURL = '/api/parts' + urlPath + '/appearance';
    // Construct a unique key for caching
    const key = 'parts' + urlPath;

    // Create an Observable for fetching from the API
    const fetchObjectObservable = new Observable((observer) => {
      // Get the appearance, then the geometry
       this.http.get(appearanceURL).subscribe({
          next: (appearance) => {
          this.loader.load(geometryURL, geometry => {
              const material = this.getMaterial(appearance as Appearance);
              const mesh = new THREE.Mesh( geometry, material );
              observer.next(mesh);
              observer.complete();
            },
            (progress) => {},
            (err) => observer.error(err)
          );
        },
        error: (err) => {
          observer.error(err);
        }});
      });

    // Use either the cache or the observable to fetch the result
    return this.cache.get(key, fetchObjectObservable, 3600).pipe(map((result) => { this.returned(); return result; }));
  }

  getMaterial(appearance: Appearance): THREE.Material {
    if (appearance && appearance.color && appearance.opacity) {
      const colorString = 'rgb(' + appearance.color[0] + ',' + appearance.color[1] + ',' + appearance.color[2] + ')';
      const material = new THREE.MeshPhongMaterial({
        color: colorString,
        specular: 0x111111, shininess: 200, opacity: appearance.opacity
      });
      return material;
    }
    const defaultMaterial = new THREE.MeshPhongMaterial({
      color: 'rgb(0,0,0)',
      specular: 0x111111, shininess: 200, opacity: 1
    });
    return defaultMaterial;
  }

  getURLPathFor(document: AbstractDocumentElement): string {
    return this.getURLPath(document.documentId, document.wvmType, document.wvmId, document.elementId);
  }

  getURLPath(documentId: string, wvmType: WVM, wvmId: string, elementId: string): string {
    let url = '/d/' + documentId;
    switch (wvmType) {
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
    url += wvmId + '/e/' + elementId;
    return url;
  }

  // CONFIGURATION UTILS METHODS

  getConfigurationString(configuration: Configuration) {
    let out = '';
    configuration.values.forEach((pv) => out += (out.length === 0 ? '' : ';') + pv.parameter + '=' + pv.value);
    return encodeURIComponent(out);
  }

  private parseApiConfiguration(apiConfig: string) {
    const idToValueMap = {};
    if (apiConfig) {
      for (const kvpair of apiConfig.split(';')) {
        const kv = kvpair.split('=');
        idToValueMap[kv[0]] = kv[1];
      }
    }
    return idToValueMap;
  }

  getParameterIndex(parameterId: string, configuration: Configuration) {
    return configuration.values.findIndex(value => value.parameter === parameterId);
  }

  applyStringOverrideForDefaults(apiConfig: string, configuration: Configuration) {
    const idToValueMap = this.parseApiConfiguration(apiConfig);
    const newConfiguration = configuration;
    for (const [id, value] of Object.entries(idToValueMap)) {
      newConfiguration.values[this.getParameterIndex(id, configuration)].value = value as string;
    }
    return newConfiguration;
  }
}
