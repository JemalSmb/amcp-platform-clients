import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainService } from '../../core/services/domain.service';
import { AutomationPlaybook } from '../../core/models/admin.models';

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './automation.html',
  styleUrl: './automation.css',
})
export class Automation {
  private readonly api = inject(AdminApiService);
  protected readonly domainService = inject(DomainService);

  private allPlaybooks: AutomationPlaybook[] = [];

  constructor() {
    this.api.getAutomations().subscribe((playbooks) => (this.allPlaybooks = playbooks));
  }

  get playbooks(): AutomationPlaybook[] {
    return this.allPlaybooks.filter((p) => p.domain === this.domainService.current());
  }

  toggle(playbook: AutomationPlaybook): void {
    const nextStatus = playbook.status === 'enabled' ? 'disabled' : 'enabled';
    this.api.toggleAutomation(playbook.id, nextStatus).subscribe((updated) => {
      playbook.status = updated.status;
    });
  }
}
