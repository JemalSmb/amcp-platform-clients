import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
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

  settings: SystemSettings | null = null;
  severities: SecuritySeverity[] = ['low', 'medium', 'high', 'critical'];
  saved = false;

  constructor() {
    this.api.getSystemSettings().subscribe((settings) => (this.settings = settings));
  }

  save(): void {
    if (!this.settings) {
      return;
    }
    this.saved = false;
    this.api.saveSystemSettings(this.settings).subscribe(() => (this.saved = true));
  }
}
