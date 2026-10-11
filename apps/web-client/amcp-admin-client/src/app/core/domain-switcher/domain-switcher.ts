import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainService } from '../services/domain.service';
import { PlatformDomain } from '../models/admin.models';

@Component({
  selector: 'app-domain-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './domain-switcher.html',
  styleUrl: './domain-switcher.css',
})
export class DomainSwitcher {
  protected readonly domainService = inject(DomainService);

  select(id: PlatformDomain): void {
    this.domainService.setDomain(id);
  }
}
