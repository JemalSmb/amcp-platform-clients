import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ThemeMode, ThemeService } from '../../core/services/theme.service';
import { SecuritySeverity, SystemSettings } from '../../core/models/admin.models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly api = inject(AdminApiService);
  protected readonly theme = inject(ThemeService);

  settings: SystemSettings | null = null;
  themeMode: ThemeMode = this.theme.mode();
  saving = false;
  saved = false;
  error = '';

  readonly severities: { value: SecuritySeverity; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];
  readonly themes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  constructor() {
    this.api.getSystemSettings().subscribe({
      next: (settings) => (this.settings = settings),
      error: () => (this.error = 'Could not load system settings.'),
    });
  }

  get nameMissing(): boolean {
    return !!this.settings && this.settings.platformName.trim() === '';
  }

  get retentionInvalid(): boolean {
    const days = this.settings?.dataRetentionDays;
    return !!this.settings && (!Number.isInteger(days) || (days as number) < 1 || (days as number) > 3650);
  }

  get invalid(): boolean {
    return this.nameMissing || this.retentionInvalid;
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode = mode;
    this.theme.setMode(mode); // applies right away on this device
  }

  touch(): void {
    this.saved = false;
    this.error = '';
  }

  save(): void {
    if (!this.settings || this.invalid) {
      return;
    }
    this.saving = true;
    this.touch();
    this.api.saveSystemSettings({ ...this.settings, platformName: this.settings.platformName.trim() }).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
      },
      error: () => {
        this.saving = false;
        this.error = 'Could not save settings. Please try again.';
      },
    });
  }
}
