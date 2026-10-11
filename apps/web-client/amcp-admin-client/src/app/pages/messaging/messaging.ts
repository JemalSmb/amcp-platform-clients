import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { DomainService } from '../../core/services/domain.service';
import { MessagingChannel } from '../../core/models/admin.models';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messaging.html',
  styleUrl: './messaging.css',
})
export class Messaging {
  private readonly api = inject(AdminApiService);
  protected readonly domainService = inject(DomainService);

  private allChannels: MessagingChannel[] = [];

  constructor() {
    this.api.getChannels().subscribe((channels) => (this.allChannels = channels));
  }

  get channels(): MessagingChannel[] {
    return this.allChannels.filter((c) => c.domain === this.domainService.current());
  }
}
