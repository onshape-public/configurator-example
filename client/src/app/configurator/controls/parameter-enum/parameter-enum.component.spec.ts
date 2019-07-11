import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterEnumComponent } from './parameter-enum.component';

describe('ParameterEnumComponent', () => {
  let component: ParameterEnumComponent;
  let fixture: ComponentFixture<ParameterEnumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParameterEnumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterEnumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
