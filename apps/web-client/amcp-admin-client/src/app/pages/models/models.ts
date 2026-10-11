import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainService } from '../../core/services/domain.service';
import { ModelRegistryEntry } from '../../core/models/admin.models';

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './models.html',
  styleUrl: './models.css',
})
export class Models {
  private readonly api = inject(AdminApiService);
  protected readonly domainService = inject(DomainService);

  private allModels: ModelRegistryEntry[] = [];

  constructor() {
    this.api.getModels().subscribe((models) => (this.allModels = models));
  }

  get models(): ModelRegistryEntry[] {
    return this.allModels.filter((m) => m.domain === this.domainService.current());
  }
}
