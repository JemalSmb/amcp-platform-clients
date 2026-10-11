import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawerNav } from './drawer-nav';

describe('DrawerNav', () => {
  let component: DrawerNav;
  let fixture: ComponentFixture<DrawerNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerNav],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawerNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
