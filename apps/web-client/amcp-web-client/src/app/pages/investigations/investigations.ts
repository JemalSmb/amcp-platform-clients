import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { DomainService } from '../../core/services/domain.service';
import { Investigation } from '../../core/models/platform.models';

@Component({
  selector: 'app-investigations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investigations.html',
  styleUrl: './investigations.css',
})
export class Investigations {
  private readonly api = inject(PlatformApiService);
  protected readonly domainService = inject(DomainService);

  private allInvestigations: Investigation[] = [];

  constructor() {
    this.api.getInvestigations().subscribe((investigations) => (this.allInvestigations = investigations));
  }

  get investigations(): Investigation[] {
    return this.allInvestigations.filter((i) => i.domain === this.domainService.current());
  }
}
