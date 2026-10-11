import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Investigations } from './investigations';

describe('Investigations', () => {
  let component: Investigations;
  let fixture: ComponentFixture<Investigations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Investigations],
    }).compileComponents();

    fixture = TestBed.createComponent(Investigations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
