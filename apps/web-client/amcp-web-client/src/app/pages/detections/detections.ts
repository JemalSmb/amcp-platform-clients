import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { DomainService } from '../../core/services/domain.service';
import { Detection } from '../../core/models/platform.models';

@Component({
  selector: 'app-detections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detections.html',
  styleUrl: './detections.css',
})
export class Detections {
  private readonly api = inject(PlatformApiService);
  protected readonly domainService = inject(DomainService);

  private allDetections: Detection[] = [];

  constructor() {
    this.api.getDetections().subscribe((detections) => (this.allDetections = detections));
  }

  get detections(): Detection[] {
    return this.allDetections.filter((d) => d.domain === this.domainService.current());
  }
}
