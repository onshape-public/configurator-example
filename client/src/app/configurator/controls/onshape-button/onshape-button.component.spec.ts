import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnshapeButtonComponent } from './onshape-button.component';

describe('OnshapeButtonComponent', () => {
  let component: OnshapeButtonComponent;
  let fixture: ComponentFixture<OnshapeButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnshapeButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnshapeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
