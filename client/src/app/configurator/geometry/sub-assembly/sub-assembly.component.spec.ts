import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAssemblyComponent } from './sub-assembly.component';

describe('SubAssemblyComponent', () => {
  let component: SubAssemblyComponent;
  let fixture: ComponentFixture<SubAssemblyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubAssemblyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubAssemblyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
