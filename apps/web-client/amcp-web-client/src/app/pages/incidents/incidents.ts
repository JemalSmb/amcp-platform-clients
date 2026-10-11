import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { DomainService } from '../../core/services/domain.service';
import { Incident } from '../../core/models/platform.models';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incidents.html',
  styleUrl: './incidents.css',
})
export class Incidents {
  private readonly api = inject(PlatformApiService);
  protected readonly domainService = inject(DomainService);

  private allIncidents: Incident[] = [];

  constructor() {
    this.api.getIncidents().subscribe((incidents) => (this.allIncidents = incidents));
  }

  get incidents(): Incident[] {
    return this.allIncidents.filter((i) => i.domain === this.domainService.current());
  }
}
