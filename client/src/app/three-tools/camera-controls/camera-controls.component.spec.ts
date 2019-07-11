import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraControlsComponent } from './camera-controls.component';

describe('CameraControlsComponent', () => {
  let component: CameraControlsComponent;
  let fixture: ComponentFixture<CameraControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
