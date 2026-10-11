import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { AppSettings, Severity } from '../../core/models/platform.models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly api = inject(PlatformApiService);

  settings: AppSettings | null = null;
  severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  saved = false;

  constructor() {
    this.api.getSettings().subscribe((settings) => (this.settings = settings));
  }

  save(): void {
    if (!this.settings) {
      return;
    }
    this.saved = false;
    this.api.saveSettings(this.settings).subscribe(() => (this.saved = true));
  }
}
