import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { Notification } from '../../core/models/platform.models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  private readonly api = inject(PlatformApiService);

  notifications: Notification[] = [];

  constructor() {
    this.api.getNotifications().subscribe((notifications) => (this.notifications = notifications));
  }

  markRead(notification: Notification): void {
    notification.read = true;
  }
}
