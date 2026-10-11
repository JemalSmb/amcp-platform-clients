import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainService } from '../../core/services/domain.service';
import { DataSource } from '../../core/models/admin.models';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data.html',
  styleUrl: './data.css',
})
export class Data {
  private readonly api = inject(AdminApiService);
  protected readonly domainService = inject(DomainService);

  private allSources: DataSource[] = [];

  constructor() {
    this.api.getDataSources().subscribe((sources) => (this.allSources = sources));
  }

  get sources(): DataSource[] {
    return this.allSources.filter((s) => s.domain === this.domainService.current());
  }
}
