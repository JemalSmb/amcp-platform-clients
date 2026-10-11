import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { DomainService } from '../../core/services/domain.service';
import { Alert, Severity } from '../../core/models/platform.models';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts {
  private readonly api = inject(PlatformApiService);
  protected readonly domainService = inject(DomainService);

  allAlerts: Alert[] = [];
  severities: Severity[] = ['low', 'medium', 'high', 'critical'];

  severityFilter = 'all';

  constructor() {
    this.api.getAlerts().subscribe((alerts) => (this.allAlerts = alerts));
  }

  get filteredAlerts(): Alert[] {
    return this.allAlerts.filter((alert) => {
      const domainMatch = alert.domain === this.domainService.current();
      const severityMatch = this.severityFilter === 'all' || alert.severity === this.severityFilter;
      return domainMatch && severityMatch;
    });
  }
}
