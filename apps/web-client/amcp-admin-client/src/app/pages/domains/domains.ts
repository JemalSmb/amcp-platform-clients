import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainConfig } from '../../core/models/admin.models';

@Component({
  selector: 'app-domains',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './domains.html',
  styleUrl: './domains.css',
})
export class Domains {
  private readonly api = inject(AdminApiService);

  domains: DomainConfig[] = [];

  constructor() {
    this.api.getDomains().subscribe((domains) => (this.domains = domains));
  }
}
