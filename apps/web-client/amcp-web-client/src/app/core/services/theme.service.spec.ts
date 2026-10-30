import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.resetTestingModule();
  });

  it('applies an explicit mode to <html> and remembers it', () => {
    const service = TestBed.inject(ThemeService);
    service.setMode('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('amcp.theme')).toBe('dark');
    expect(service.hasStoredPreference()).toBe(true);
  });

  it('toggles between light and dark', () => {
    const service = TestBed.inject(ThemeService);
    service.setMode('light');
    service.toggle();
    expect(service.resolved()).toBe('dark');
    service.toggle();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('restores the saved mode and resolves system to light or dark', () => {
    localStorage.setItem('amcp.theme', 'system');
    const service = TestBed.inject(ThemeService);
    expect(service.mode()).toBe('system');
    expect(['light', 'dark']).toContain(document.documentElement.getAttribute('data-theme'));
  });
});
