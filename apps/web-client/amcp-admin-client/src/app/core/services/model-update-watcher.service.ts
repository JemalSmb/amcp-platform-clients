import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { appConfigValues } from '../config';

export interface ModelUpdateNotice {
  modelId: string;
  version: string;
}

interface InferenceModelInfo {
  id: string;
  version: string;
}

const POLL_INTERVAL_MS = 15_000;

/**
 * Polls the inference service's /models endpoint directly (it sets
 * permissive CORS) so the admin dashboard can surface "model updated"
 * notifications without a backend aggregator API in front of it yet.
 * The first poll only establishes a baseline -- it never fires a notice
 * for models the dashboard hasn't "seen" change yet.
 */
@Injectable({ providedIn: 'root' })
export class ModelUpdateWatcherService {
  private readonly http = inject(HttpClient);
  private readonly knownVersions = new Map<string, string>();
  private readonly _updates = new Subject<ModelUpdateNotice>();
  readonly updates$ = this._updates.asObservable();

  private started = false;

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.poll();
    setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  private poll(): void {
    this.http.get<InferenceModelInfo[]>(`${appConfigValues.inferenceUrl}/models`).subscribe({
      next: (models) => this.diff(models),
      error: () => {
        // inference service unreachable; try again next interval
      },
    });
  }

  private diff(models: InferenceModelInfo[]): void {
    for (const model of models) {
      const previous = this.knownVersions.get(model.id);
      this.knownVersions.set(model.id, model.version);
      if (previous !== undefined && previous !== model.version) {
        this._updates.next({ modelId: model.id, version: model.version });
      }
    }
  }
}
