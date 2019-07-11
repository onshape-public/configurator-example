import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterQuantityComponent } from './parameter-quantity.component';

describe('ParameterQuantityComponent', () => {
  let component: ParameterQuantityComponent;
  let fixture: ComponentFixture<ParameterQuantityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParameterQuantityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
