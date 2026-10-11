import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ObservabilityMetric } from '../../core/models/admin.models';

@Component({
  selector: 'app-observability',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './observability.html',
  styleUrl: './observability.css',
})
export class Observability {
  private readonly api = inject(AdminApiService);

  metrics: ObservabilityMetric[] = [];

  constructor() {
    this.api.getMetrics().subscribe((metrics) => (this.metrics = metrics));
  }
}
