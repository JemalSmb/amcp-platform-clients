import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
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
}
