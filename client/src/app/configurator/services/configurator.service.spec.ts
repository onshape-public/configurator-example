import { TestBed } from '@angular/core/testing';

import { ConfiguratorService } from './configurator.service';

describe('ConfiguratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConfiguratorService = TestBed.get(ConfiguratorService);
    expect(service).toBeTruthy();
  });
});
