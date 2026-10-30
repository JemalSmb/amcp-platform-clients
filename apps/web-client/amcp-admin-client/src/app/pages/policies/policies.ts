import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainService } from '../../core/services/domain.service';
import { EnforcementMode, Policy } from '../../core/models/admin.models';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policies.html',
  styleUrl: './policies.css',
})
export class Policies {
  private readonly api = inject(AdminApiService);
  protected readonly domainService = inject(DomainService);

  readonly modes: EnforcementMode[] = ['enforced', 'monitor', 'disabled'];

  private allPolicies: Policy[] = [];
  form = { name: '', type: 'response', enforcement: 'monitor' as EnforcementMode };
  adding = false;
  busyId: string | null = null;
  confirmDeleteId: string | null = null;
  message = '';
  error = '';

  constructor() {
    this.load();
  }

  get policies(): Policy[] {
    return this.allPolicies.filter((p) => p.domain === this.domainService.current());
  }

  get formInvalid(): boolean {
    return this.form.name.trim() === '' || this.form.type.trim() === '';
  }

  private load(): void {
    this.api.getPolicies().subscribe({
      next: (policies) => (this.allPolicies = policies),
      error: () => (this.error = 'Could not load policies.'),
    });
  }

  private done(message: string): void {
    this.busyId = null;
    this.error = '';
    this.message = message;
  }

  private failed(what: string): void {
    this.busyId = null;
    this.message = '';
    this.error = `Could not ${what}. Please try again.`;
  }

  setEnforcement(policy: Policy, enforcement: EnforcementMode): void {
    if (enforcement === policy.enforcement) {
      return;
    }
    this.busyId = policy.id;
    this.api
      .updatePolicy(policy.id, { name: policy.name, domain: policy.domain, type: policy.type, enforcement })
      .subscribe({
        next: (updated) => {
          Object.assign(policy, updated);
          this.done(`"${policy.name}" is now ${enforcement}.`);
        },
        error: () => this.failed('update the policy'),
      });
  }

  add(): void {
    if (this.formInvalid) {
      return;
    }
    this.busyId = 'new';
    this.api
      .createPolicy({
        name: this.form.name.trim(),
        domain: this.domainService.current(),
        type: this.form.type.trim(),
        enforcement: this.form.enforcement,
      })
      .subscribe({
        next: (created) => {
          this.allPolicies = [...this.allPolicies, created];
          this.form = { name: '', type: 'response', enforcement: 'monitor' };
          this.adding = false;
          this.done(`Added "${created.name}".`);
        },
        error: () => this.failed('add the policy'),
      });
  }

  remove(policy: Policy): void {
    if (this.confirmDeleteId !== policy.id) {
      this.confirmDeleteId = policy.id; // first click asks for confirmation
      return;
    }
    this.busyId = policy.id;
    this.confirmDeleteId = null;
    this.api.deletePolicy(policy.id).subscribe({
      next: () => {
        this.allPolicies = this.allPolicies.filter((p) => p.id !== policy.id);
        this.done(`Deleted "${policy.name}".`);
      },
      error: () => this.failed('delete the policy'),
    });
  }
}
