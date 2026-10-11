import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { Deployment } from '../../core/models/admin.models';

@Component({
  selector: 'app-deployments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deployments.html',
  styleUrl: './deployments.css',
})
export class Deployments {
  private readonly api = inject(AdminApiService);

  deployments: Deployment[] = [];

  constructor() {
    this.api.getDeployments().subscribe((deployments) => (this.deployments = deployments));
  }
}
