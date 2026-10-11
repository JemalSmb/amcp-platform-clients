import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { Report } from '../../core/models/platform.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private readonly api = inject(PlatformApiService);

  reports: Report[] = [];

  constructor() {
    this.api.getReports().subscribe((reports) => (this.reports = reports));
  }
}
