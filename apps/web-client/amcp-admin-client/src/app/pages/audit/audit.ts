import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AuditLogEntry } from '../../core/models/admin.models';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.html',
  styleUrl: './audit.css',
})
export class Audit {
  private readonly api = inject(AdminApiService);

  entries: AuditLogEntry[] = [];

  constructor() {
    this.api.getAuditLog().subscribe((entries) => (this.entries = entries));
  }
}
