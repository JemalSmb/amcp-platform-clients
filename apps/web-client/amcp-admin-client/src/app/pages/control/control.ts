import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainService } from '../../core/services/domain.service';
import { AdminOverview, DomainConfig, ModelRegistryEntry } from '../../core/models/admin.models';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control.html',
  styleUrl: './control.css',
})
export class Control {
  private readonly api = inject(AdminApiService);
  protected readonly domainService = inject(DomainService);

  overview: AdminOverview | null = null;
  domains: DomainConfig[] = [];
  private allModels: ModelRegistryEntry[] = [];

  constructor() {
    this.api.getOverview().subscribe((overview) => (this.overview = overview));
    this.api.getDomains().subscribe((domains) => (this.domains = domains));
    this.api.getModels().subscribe((models) => (this.allModels = models));
  }

  get models(): ModelRegistryEntry[] {
    return this.allModels.filter((m) => m.domain === this.domainService.current()).slice(0, 5);
  }
}
