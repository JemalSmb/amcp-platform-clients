import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detections } from './detections';

describe('Detections', () => {
  let component: Detections;
  let fixture: ComponentFixture<Detections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detections],
    }).compileComponents();

    fixture = TestBed.createComponent(Detections);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
