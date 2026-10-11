import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
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

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  protected readonly title = 'Admin Drawer';

  private readonly menuIcons: Record<string, string> = {
    'Control': '/Logo.svg',
    'Domains': '/Domain.svg',
    'Models': '/ModelRegisty.svg',
    'Policies': '/Policies.svg',
    'Messaging': '/Messaging.svg',
    'Automation': '/Automation.svg',
    'Integrations': '/Integration.svg',
    'Data': '/Data.svg',
    'Users': '/Users.svg',
    'Security': '/Security.svg',
    'Observability': '/Observability.svg',
    'Deployments': '/Deployements.svg',
    'Audit': '/Audit.svg',
    'Settings': '/SystemSettings.svg'
  };

  private readonly menuRoutes: Record<string, string> = {
    'Control': '/dashboard',
    'Domains': '/domains',
    'Models': '/models',
    'Policies': '/policies',
    'Messaging': '/messaging',
    'Automation': '/automation',
    'Integrations': '/integrations',
    'Data': '/data',
    'Users': '/users',
    'Security': '/security',
    'Observability': '/observability',
    'Deployments': '/deployments',
    'Audit': '/audit',
    'Settings': '/settings'
  };

  protected readonly menuItems = [
    'Control',
    'Domains',
    'Models',
    'Policies',
    'Messaging',
    'Automation',
    'Integrations',
    'Data',
    'Users',
    'Security',
    'Observability',
    'Deployments',
    'Audit',
    'Settings'
  ];

  protected getMenuIcon(item: string): string {
    return this.menuIcons[item] ?? '/Logo.svg';
  }

  protected getMenuRoute(item: string): string {
    return this.menuRoutes[item] ?? '/dashboard';
  }
}
