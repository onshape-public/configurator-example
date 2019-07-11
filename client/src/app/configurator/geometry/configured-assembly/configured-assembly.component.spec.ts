import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguredAssemblyComponent } from './configured-assembly.component';

describe('ConfiguredAssemblyComponent', () => {
  let component: ConfiguredAssemblyComponent;
  let fixture: ComponentFixture<ConfiguredAssemblyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfiguredAssemblyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguredAssemblyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
