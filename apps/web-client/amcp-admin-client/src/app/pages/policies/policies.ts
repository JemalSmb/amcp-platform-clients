import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainService } from '../../core/services/domain.service';
import { Policy } from '../../core/models/admin.models';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policies.html',
  styleUrl: './policies.css',
})
export class Policies {
  private readonly api = inject(AdminApiService);
  protected readonly domainService = inject(DomainService);

  private allPolicies: Policy[] = [];

  constructor() {
    this.api.getPolicies().subscribe((policies) => (this.allPolicies = policies));
  }

  get policies(): Policy[] {
    return this.allPolicies.filter((p) => p.domain === this.domainService.current());
  }
}
