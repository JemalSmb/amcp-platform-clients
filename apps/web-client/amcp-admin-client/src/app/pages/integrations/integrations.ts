import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { Integration } from '../../core/models/admin.models';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './integrations.html',
  styleUrl: './integrations.css',
})
export class Integrations {
  private readonly api = inject(AdminApiService);

  integrations: Integration[] = [];

  constructor() {
    this.api.getIntegrations().subscribe((integrations) => (this.integrations = integrations));
  }
}
