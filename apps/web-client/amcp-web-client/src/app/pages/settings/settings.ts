import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { ThemeMode, ThemeService } from '../../core/services/theme.service';
import { AppSettings, EmailDigest, Severity } from '../../core/models/platform.models';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly api = inject(PlatformApiService);
  protected readonly theme = inject(ThemeService);

  settings: AppSettings | null = null;
  saving = false;
  saved = false;
  error = '';

  readonly severities: { value: Severity; label: string; hint: string }[] = [
    { value: 'low', label: 'Low', hint: 'Everything, including informational alerts' },
    { value: 'medium', label: 'Medium', hint: 'Medium severity and above' },
    { value: 'high', label: 'High', hint: 'High and critical only' },
    { value: 'critical', label: 'Critical', hint: 'Critical alerts only' },
  ];
  readonly digests: { value: EmailDigest; label: string }[] = [
    { value: 'off', label: 'Off' },
    { value: 'daily', label: 'Daily summary' },
    { value: 'weekly', label: 'Weekly summary' },
  ];
  readonly themes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];
  readonly refreshOptions = [10, 15, 30, 60, 120, 300];

  constructor() {
    this.api.getSettings().subscribe((settings) => {
      // A theme picked on this device wins; otherwise adopt the saved one.
      if (!this.theme.hasStoredPreference()) {
        this.theme.setMode(settings.theme);
      }
      this.settings = { ...settings, theme: this.theme.mode() };
    });
  }

  get emailInvalid(): boolean {
    const email = this.settings?.notificationEmail.trim() ?? '';
    return email !== '' && !EMAIL_PATTERN.test(email);
  }

  get emailMissing(): boolean {
    return !!this.settings && this.settings.emailAlerts && this.settings.notificationEmail.trim() === '';
  }

  setTheme(mode: ThemeMode): void {
    if (!this.settings) {
      return;
    }
    this.settings.theme = mode;
    this.theme.setMode(mode); // preview immediately
    this.touch();
  }

  async onBrowserNotifications(enabled: boolean): Promise<void> {
    if (!this.settings) {
      return;
    }
    this.touch();
    if (enabled && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        this.settings.browserNotifications = false;
        this.error = 'Browser notifications were blocked. Allow them in your browser settings to enable this.';
      }
    }
  }

  touch(): void {
    this.saved = false;
    this.error = '';
  }

  save(): void {
    if (!this.settings || this.emailInvalid) {
      return;
    }
    this.saving = true;
    this.touch();
    const payload = { ...this.settings, notificationEmail: this.settings.notificationEmail.trim() };
    this.api.saveSettings(payload).subscribe({
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
