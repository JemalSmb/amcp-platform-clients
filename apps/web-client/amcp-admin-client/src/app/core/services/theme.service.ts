import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'amcp.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.readStored() ?? 'system');
  readonly mode = this._mode.asReadonly();

  constructor() {
    this.apply();
    if (typeof window !== 'undefined' && window.matchMedia) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => this._mode() === 'system' && this.apply());
    }
  }

  /** The theme actually on screen, with 'system' resolved to light/dark. */
  resolved(): 'light' | 'dark' {
    const mode = this._mode();
    if (mode !== 'system') {
      return mode;
    }
    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  hasStoredPreference(): boolean {
    return this.readStored() !== null;
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // storage blocked -- the choice still applies for this session
    }
    this.apply();
  }

  toggle(): void {
    this.setMode(this.resolved() === 'dark' ? 'light' : 'dark');
  }

  private apply(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.setAttribute('data-theme', this.resolved());
  }

  private readStored(): ThemeMode | null {
    try {
      const value = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' || value === 'system' ? value : null;
    } catch {
      return null;
    }
  }
}
