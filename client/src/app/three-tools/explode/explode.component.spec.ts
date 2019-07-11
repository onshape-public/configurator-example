import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplodeComponent } from './explode.component';

describe('ExplodeComponent', () => {
  let component: ExplodeComponent;
  let fixture: ComponentFixture<ExplodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
