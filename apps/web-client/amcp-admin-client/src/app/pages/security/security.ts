import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { SecurityEvent } from '../../core/models/admin.models';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security {
  private readonly api = inject(AdminApiService);

  events: SecurityEvent[] = [];

  constructor() {
    this.api.getSecurityEvents().subscribe((events) => (this.events = events));
  }
}
