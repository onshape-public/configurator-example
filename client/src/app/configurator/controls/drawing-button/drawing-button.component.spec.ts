import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingButtonComponent } from './drawing-button.component';

describe('DrawingButtonComponent', () => {
  let component: DrawingButtonComponent;
  let fixture: ComponentFixture<DrawingButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawingButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
