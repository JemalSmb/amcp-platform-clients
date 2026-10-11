import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDocs } from './help-docs';

describe('HelpDocs', () => {
  let component: HelpDocs;
  let fixture: ComponentFixture<HelpDocs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpDocs],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpDocs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
