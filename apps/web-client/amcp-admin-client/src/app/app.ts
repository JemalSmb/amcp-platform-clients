import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
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
}
