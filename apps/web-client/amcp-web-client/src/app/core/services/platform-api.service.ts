import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, delay, map, of } from 'rxjs';
import { appConfigValues } from '../config';
import {
  Alert,
  AppSettings,
  Asset,
  AutomationPlaybook,
  Detection,
  DomainStatus,
  DomainTriggerRequest,
  DomainTriggerResponse,
  GatewayAlertEvent,
  GatewayDomainStatusEntry,
  GatewayHealth,
  GatewayModelInfo,
  HelpDoc,
  Incident,
  Investigation,
  ModelInfo,
  ModelStatus,
  Notification,
  PlatformDomain,
  PredictionResult,
  Report,
  Severity,
  UserProfile,
} from '../models/platform.models';
import {
  MOCK_ALERTS,
  MOCK_ASSETS,
  MOCK_AUTOMATIONS,
  MOCK_DETECTIONS,
  MOCK_DOMAIN_STATUS,
  MOCK_HELP_DOCS,
  MOCK_INCIDENTS,
  MOCK_INVESTIGATIONS,
  MOCK_MODELS,
  MOCK_NOTIFICATIONS,
  MOCK_PREDICTIONS,
  MOCK_PROFILE,
  MOCK_REPORTS,
  MOCK_SETTINGS,
} from './mock-data';

const MOCK_LATENCY_MS = 250;

// Maps the individual domain *services* the gateway health-checks
// (see DOMAIN_SERVICES in gateway.py) to the coarser platform domains the
// UI groups things by.
const SERVICE_TO_DOMAIN: Record<string, PlatformDomain> = {
  'threat-detection': 'cybersecurity',
  'phishing-detector': 'cybersecurity',
  'fraud-detector': 'finance',
  'process-anomaly-detector': 'manufacturing',
};

const ALL_DOMAINS: PlatformDomain[] = ['cybersecurity', 'finance', 'manufacturing', 'agriculture'];

function mapModelStatus(status: string | undefined, trained: boolean): ModelStatus {
  const normalized = (status ?? '').toLowerCase();
  if (['healthy', 'ready', 'active', 'online', 'ok'].includes(normalized)) {
    return 'healthy';
  }
  if (['degraded', 'training', 'warming', 'stale'].includes(normalized)) {
    return 'degraded';
  }
  if (!trained || ['offline', 'down', 'error'].includes(normalized)) {
    return 'offline';
  }
  return trained ? 'healthy' : 'offline';
}

function mapGatewayModel(model: GatewayModelInfo): ModelInfo {
  return {
    id: model.id,
    name: model.name,
    domain: model.domain as PlatformDomain,
    version: model.version,
    status: mapModelStatus(model.status, model.trained),
    lastScoredAt: new Date().toISOString(),
  };
}

function mapGatewayAlert(event: GatewayAlertEvent): Alert {
  const payload = event.payload ?? {};
  const title = (payload['title'] as string) ?? (payload['name'] as string) ?? event.event_type;
  const summary =
    (payload['description'] as string) ??
    (payload['message'] as string) ??
    (payload['summary'] as string) ??
    JSON.stringify(payload);
  const modelId =
    (payload['model_id'] as string) ??
    (payload['modelId'] as string) ??
    event.source?.['service'] ??
    event.source?.['id'] ??
    '';
  return {
    id: event.id,
    title,
    domain: event.domain as PlatformDomain,
    severity: (event.severity?.toLowerCase() ?? 'low') as Severity,
    modelId,
    createdAt: event.timestamp,
    summary,
  };
}

function mapGatewayDomainsStatus(entries: GatewayDomainStatusEntry[], alerts: Alert[]): DomainStatus[] {
  return ALL_DOMAINS.map((domain) => {
    const servicesForDomain = entries.filter((entry) => SERVICE_TO_DOMAIN[entry.name] === domain);
    const alertsForDomain = alerts.filter((alert) => alert.domain === domain).length;
    let health: DomainStatus['health'] = 'down';
    if (servicesForDomain.length > 0) {
      const upCount = servicesForDomain.filter((entry) => entry.status === 'up').length;
      if (upCount === servicesForDomain.length) {
        health = 'operational';
      } else if (upCount > 0) {
        health = 'degraded';
      } else {
        health = 'down';
      }
    }
    return {
      domain,
      health,
      eventsLast24h: alertsForDomain,
      alertsLast24h: alertsForDomain,
    };
  });
}

@Injectable({ providedIn: 'root' })
export class PlatformApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = appConfigValues.apiBaseUrl;
  private readonly gatewayUrl = appConfigValues.gatewayBaseUrl;
  private readonly useMock = appConfigValues.useMockData;
  private readonly useGateway = appConfigValues.useGatewayData;

  health(): Observable<{ status: string }> {
    if (this.useMock) {
      return of({ status: 'ok' }).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<{ status: string }>(`${this.baseUrl}/health`);
  }

  /** Gateway's own liveness/status probe (GET /health on the gateway). */
  getGatewayHealth(): Observable<GatewayHealth> {
    const fallback: GatewayHealth = {
      service: 'gateway',
      status: 'unknown',
      nats_connected: false,
      domains_configured: [],
    };
    if (!this.useGateway) {
      return of(fallback).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http
      .get<GatewayHealth>(`${this.gatewayUrl}/v1/health`)
      .pipe(catchError(() => of(fallback)));
  }

  getModels(): Observable<ModelInfo[]> {
    if (!this.useGateway) {
      return of(MOCK_MODELS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<GatewayModelInfo[]>(`${this.gatewayUrl}/v1/models`).pipe(
      map((models) => models.map(mapGatewayModel)),
      catchError(() => of(MOCK_MODELS)),
    );
  }

  getAlerts(limit = 100, domain?: string): Observable<Alert[]> {
    if (!this.useGateway) {
      return of(MOCK_ALERTS).pipe(delay(MOCK_LATENCY_MS));
    }
    let params = new HttpParams().set('limit', limit);
    if (domain) {
      params = params.set('domain', domain);
    }
    return this.http.get<GatewayAlertEvent[]>(`${this.gatewayUrl}/v1/alerts`, { params }).pipe(
      map((events) => events.map(mapGatewayAlert)),
      catchError(() => of(MOCK_ALERTS)),
    );
  }

  /** Raw per-service up/down status as returned by GET /domains/status. */
  getGatewayDomainsStatus(): Observable<GatewayDomainStatusEntry[]> {
    if (!this.useGateway) {
      return of([]).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http
      .get<GatewayDomainStatusEntry[]>(`${this.gatewayUrl}/v1/domains/status`)
      .pipe(catchError(() => of([])));
  }

  getPredictions(): Observable<PredictionResult[]> {
    if (this.useMock) {
      return of(MOCK_PREDICTIONS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<PredictionResult[]>(`${this.baseUrl}/predictions`);
  }

  /**
   * Platform-domain-level health/volume summary consumed by the home page.
   * Combines the gateway's per-service /domains/status with recent /alerts
   * counts, since the gateway doesn't expose event/alert volume per domain
   * directly.
   */
  getDomainStatus(): Observable<DomainStatus[]> {
    if (!this.useGateway) {
      return of(MOCK_DOMAIN_STATUS).pipe(delay(MOCK_LATENCY_MS));
    }
    return new Observable<DomainStatus[]>((subscriber) => {
      let statusEntries: GatewayDomainStatusEntry[] | null = null;
      let alerts: Alert[] | null = null;
      const emitIfReady = () => {
        if (statusEntries !== null && alerts !== null) {
          subscriber.next(mapGatewayDomainsStatus(statusEntries, alerts));
          subscriber.complete();
        }
      };
      this.getGatewayDomainsStatus().subscribe((entries) => {
        statusEntries = entries;
        emitIfReady();
      });
      this.getAlerts(500).subscribe((a) => {
        alerts = a;
        emitIfReady();
      });
    }).pipe(catchError(() => of(MOCK_DOMAIN_STATUS)));
  }

  /** Relays a manual trigger to a domain service via POST /domains/{name}/trigger. */
  triggerDomain(name: string, request: DomainTriggerRequest): Observable<DomainTriggerResponse> {
    if (!this.useGateway) {
      return of({ status: 'simulated', domain: name }).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.post<DomainTriggerResponse>(`${this.gatewayUrl}/v1/domains/${name}/trigger`, request);
  }

  predict(modelId: string, payload: Record<string, unknown>): Observable<PredictionResult> {
    if (this.useMock) {
      const model = MOCK_MODELS.find((m) => m.id === modelId) ?? MOCK_MODELS[0];
      const result: PredictionResult = {
        id: `pr-${Date.now()}`,
        modelId: model.id,
        domain: model.domain,
        score: Math.random(),
        label: 'simulated',
        createdAt: new Date().toISOString(),
      };
      return of(result).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.post<PredictionResult>(`${this.baseUrl}/models/${modelId}/predict`, payload);
  }

  getIncidents(): Observable<Incident[]> {
    if (this.useMock) {
      return of(MOCK_INCIDENTS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<Incident[]>(`${this.baseUrl}/incidents`);
  }

  getDetections(): Observable<Detection[]> {
    if (this.useMock) {
      return of(MOCK_DETECTIONS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<Detection[]>(`${this.baseUrl}/detections`);
  }

  getInvestigations(): Observable<Investigation[]> {
    if (this.useMock) {
      return of(MOCK_INVESTIGATIONS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<Investigation[]>(`${this.baseUrl}/investigations`);
  }

  getAssets(): Observable<Asset[]> {
    if (this.useMock) {
      return of(MOCK_ASSETS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<Asset[]>(`${this.baseUrl}/assets`);
  }

  getAutomations(): Observable<AutomationPlaybook[]> {
    if (this.useMock) {
      return of(MOCK_AUTOMATIONS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<AutomationPlaybook[]>(`${this.baseUrl}/automations`);
  }

  toggleAutomation(id: string, status: AutomationPlaybook['status']): Observable<AutomationPlaybook> {
    if (this.useMock) {
      const playbook = MOCK_AUTOMATIONS.find((a) => a.id === id);
      if (playbook) {
        playbook.status = status;
      }
      return of(playbook ?? MOCK_AUTOMATIONS[0]).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.post<AutomationPlaybook>(`${this.baseUrl}/automations/${id}/status`, { status });
  }

  getReports(): Observable<Report[]> {
    if (this.useMock) {
      return of(MOCK_REPORTS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<Report[]>(`${this.baseUrl}/reports`);
  }

  getNotifications(): Observable<Notification[]> {
    if (this.useMock) {
      return of(MOCK_NOTIFICATIONS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications`);
  }

  getProfile(): Observable<UserProfile> {
    if (this.useMock) {
      return of(MOCK_PROFILE).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }

  getHelpDocs(): Observable<HelpDoc[]> {
    if (this.useMock) {
      return of(MOCK_HELP_DOCS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<HelpDoc[]>(`${this.baseUrl}/help-docs`);
  }

  getSettings(): Observable<AppSettings> {
    if (this.useMock) {
      return of(MOCK_SETTINGS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<AppSettings>(`${this.baseUrl}/settings`);
  }

  saveSettings(settings: AppSettings): Observable<AppSettings> {
    if (this.useMock) {
      Object.assign(MOCK_SETTINGS, settings);
      return of(MOCK_SETTINGS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.put<AppSettings>(`${this.baseUrl}/settings`, settings);
  }
}
