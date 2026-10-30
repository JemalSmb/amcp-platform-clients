import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainConfig, DomainState } from '../../core/models/admin.models';

interface DomainRow extends DomainConfig {
  draftState: DomainState;
  draftDescription: string;
}

@Component({
  selector: 'app-domains',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domains.html',
  styleUrl: './domains.css',
})
export class Domains {
  private readonly api = inject(AdminApiService);

  readonly states: DomainState[] = ['active', 'inactive', 'planned'];

  domains: DomainRow[] = [];
  savingId: string | null = null;
  message = '';
  error = '';

  constructor() {
    this.api.getDomains().subscribe({
      next: (domains) => (this.domains = domains.map((d) => this.toRow(d))),
      error: () => (this.error = 'Could not load domains.'),
    });
  }

  private toRow(d: DomainConfig): DomainRow {
    return { ...d, draftState: d.state, draftDescription: d.description };
  }

  dirty(d: DomainRow): boolean {
    return d.draftState !== d.state || d.draftDescription.trim() !== d.description;
  }

  save(d: DomainRow): void {
    if (!this.dirty(d)) {
      return;
    }
    this.savingId = d.id;
    this.message = '';
    this.error = '';
    this.api.updateDomain(d.id, { state: d.draftState, description: d.draftDescription.trim() }).subscribe({
      next: (updated) => {
        Object.assign(d, this.toRow(updated));
        this.savingId = null;
        this.message = `${d.name} saved.`;
      },
      error: () => {
        this.savingId = null;
        this.error = `Could not save ${d.name}. Please try again.`;
      },
    });
  }
}
