import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { DomainSwitcher } from '../core/domain-switcher/domain-switcher';

@Component({
  selector: 'app-drawer-nav',
  imports: [CommonModule, RouterModule, DomainSwitcher],
  templateUrl: './drawer-nav.html',
  styleUrls: ['./drawer-nav.css'],
  standalone: true
})
export class DrawerNav {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly theme = inject(ThemeService);

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  protected readonly title = 'User Drawer';

  private readonly menuIcons: Record<string, string> = {
    'Home': '/Logo.svg',
    'Alerts': '/Alert.svg',
    'Incidents': '/Incident.svg',
    'Detections': '/Detection.svg',
    'Predictions': '/Prediction.svg',
    'Investigations': '/Investigations.svg',
    'Assets': '/Assets.svg',
    'Automation': '/Automation.svg',
    'Reports': '/Reports.svg',
    'Notifications': '/Notification.svg',
    'Profile': '/Profile.svg',
    'Help Docs': '/Doc.svg',
    'Settings': '/MySettings.svg'
  };

  private readonly menuRoutes: Record<string, string> = {
    'Home': '/dashboard',
    'Alerts': '/alerts',
    'Incidents': '/incidents',
    'Detections': '/detections',
    'Predictions': '/predictions',
    'Investigations': '/investigations',
    'Assets': '/assets',
    'Automation': '/automation',
    'Reports': '/reports',
    'Notifications': '/notifications',
    'Profile': '/profile',
    'Help Docs': '/help-docs',
    'Settings': '/settings'
  };

  protected readonly menuItems = [
    'Home',
    'Alerts',
    'Incidents',
    'Detections',
    'Predictions',
    'Investigations',
    'Assets',
    'Automation',
    'Reports',
    'Notifications',
    'Profile',
    'Help Docs',
    'Settings'
  ];

  protected getMenuIcon(item: string): string {
    return this.menuIcons[item] ?? '/Logo.svg';
  }

  protected getMenuRoute(item: string): string {
    return this.menuRoutes[item] ?? '/dashboard';
  }
}
