import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { DomainService } from '../../core/services/domain.service';
import { Alert, DomainStatus, ModelInfo, PredictionResult } from '../../core/models/platform.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly api = inject(PlatformApiService);
  protected readonly domainService = inject(DomainService);

  private allModels: ModelInfo[] = [];
  private allAlerts: Alert[] = [];
  private allPredictions: PredictionResult[] = [];
  domainStatus: DomainStatus[] = [];
  loading = true;

  constructor() {
    this.api.getModels().subscribe((models) => (this.allModels = models));
    this.api.getAlerts().subscribe((alerts) => (this.allAlerts = alerts));
    this.api.getPredictions().subscribe((predictions) => (this.allPredictions = predictions));
    this.api.getDomainStatus().subscribe((status) => {
      this.domainStatus = status;
      this.loading = false;
    });
  }

  get models(): ModelInfo[] {
    return this.allModels.filter((m) => m.domain === this.domainService.current());
  }

  get alerts(): Alert[] {
    return this.allAlerts.filter((a) => a.domain === this.domainService.current()).slice(0, 5);
  }

  get predictions(): PredictionResult[] {
    return this.allPredictions.filter((p) => p.domain === this.domainService.current()).slice(0, 5);
  }

  get domainStat(): DomainStatus | undefined {
    return this.domainStatus.find((d) => d.domain === this.domainService.current());
  }

  get totalEvents24h(): number {
    return this.domainStat?.eventsLast24h ?? 0;
  }

  get totalAlerts24h(): number {
    return this.domainStat?.alertsLast24h ?? 0;
  }

  get healthyModelCount(): number {
    return this.models.filter((m) => m.status === 'healthy').length;
  }
}
