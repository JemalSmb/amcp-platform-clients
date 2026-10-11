import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { DomainService } from '../../core/services/domain.service';
import { ModelInfo, PredictionResult } from '../../core/models/platform.models';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './predictions.html',
  styleUrl: './predictions.css',
})
export class Predictions {
  private readonly api = inject(PlatformApiService);
  protected readonly domainService = inject(DomainService);

  private allModels: ModelInfo[] = [];
  private allPredictions: PredictionResult[] = [];
  selectedModelId = '';
  running = false;

  constructor() {
    this.api.getModels().subscribe((models) => {
      this.allModels = models;
      this.selectedModelId = this.models[0]?.id ?? '';
    });
    this.api.getPredictions().subscribe((predictions) => (this.allPredictions = predictions));
  }

  get models(): ModelInfo[] {
    return this.allModels.filter((m) => m.domain === this.domainService.current());
  }

  get predictions(): PredictionResult[] {
    return this.allPredictions.filter((p) => p.domain === this.domainService.current());
  }

  runPrediction(): void {
    if (!this.selectedModelId) {
      return;
    }
    this.running = true;
    this.api.predict(this.selectedModelId, {}).subscribe((result) => {
      this.allPredictions = [result, ...this.allPredictions];
      this.running = false;
    });
  }
}
