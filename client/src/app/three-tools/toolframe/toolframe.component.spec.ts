import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolframeComponent } from './toolframe.component';

describe('ToolframeComponent', () => {
  let component: ToolframeComponent;
  let fixture: ComponentFixture<ToolframeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolframeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
