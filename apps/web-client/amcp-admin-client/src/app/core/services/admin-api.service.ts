import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { appConfigValues } from '../config';
import {
  AdminOverview,
  AdminUser,
  AuditLogEntry,
  AutomationPlaybook,
  DataSource,
  Deployment,
  DomainConfig,
  Integration,
  MessagingChannel,
  ModelRegistryEntry,
  ObservabilityMetric,
  Policy,
  SecurityEvent,
  SystemSettings, CreateUserRequest } from '../models/admin.models';
import {
  MOCK_AUDIT_LOG,
  MOCK_AUTOMATIONS,
  MOCK_CHANNELS,
  MOCK_DATA_SOURCES,
  MOCK_DEPLOYMENTS,
  MOCK_DOMAINS,
  MOCK_INTEGRATIONS,
  MOCK_METRICS,
  MOCK_MODELS,
  MOCK_POLICIES,
  MOCK_SECURITY_EVENTS,
  MOCK_SYSTEM_SETTINGS,
  MOCK_USERS,
} from './mock-data';

const MOCK_LATENCY_MS = 250;

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = appConfigValues.apiBaseUrl;
  private readonly useMock = appConfigValues.useMockData;

  getOverview(): Observable<AdminOverview> {
    if (this.useMock) {
      const overview: AdminOverview = {
        activeDomains: MOCK_DOMAINS.filter((d) => d.state === 'active').length,
        totalModels: MOCK_MODELS.length,
        healthyModels: MOCK_MODELS.filter((m) => m.status === 'healthy').length,
        activeUsers: MOCK_USERS.filter((u) => u.status === 'active').length,
        openSecurityEvents: MOCK_SECURITY_EVENTS.filter((e) => e.severity === 'high' || e.severity === 'critical').length,
        runningDeployments: MOCK_DEPLOYMENTS.filter((d) => d.status === 'running').length,
      };
      return of(overview).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<AdminOverview>(`${this.baseUrl}/admin/overview`);
  }

  getDomains(): Observable<DomainConfig[]> {
    if (this.useMock) return of(MOCK_DOMAINS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<DomainConfig[]>(`${this.baseUrl}/domains`);
  }

  getModels(): Observable<ModelRegistryEntry[]> {
    if (this.useMock) return of(MOCK_MODELS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<ModelRegistryEntry[]>(`${this.baseUrl}/admin/models`);
  }

  getPolicies(): Observable<Policy[]> {
    if (this.useMock) return of(MOCK_POLICIES).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<Policy[]>(`${this.baseUrl}/policies`);
  }

  getChannels(): Observable<MessagingChannel[]> {
    if (this.useMock) return of(MOCK_CHANNELS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<MessagingChannel[]>(`${this.baseUrl}/messaging/channels`);
  }

  getAutomations(): Observable<AutomationPlaybook[]> {
    if (this.useMock) return of(MOCK_AUTOMATIONS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<AutomationPlaybook[]>(`${this.baseUrl}/automations`);
  }

  toggleAutomation(id: string, status: AutomationPlaybook['status']): Observable<AutomationPlaybook> {
    if (this.useMock) {
      const playbook = MOCK_AUTOMATIONS.find((a) => a.id === id);
      if (playbook) playbook.status = status;
      return of(playbook ?? MOCK_AUTOMATIONS[0]).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.post<AutomationPlaybook>(`${this.baseUrl}/automations/${id}/status`, { status });
  }

  getIntegrations(): Observable<Integration[]> {
    if (this.useMock) return of(MOCK_INTEGRATIONS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<Integration[]>(`${this.baseUrl}/integrations`);
  }

  getDataSources(): Observable<DataSource[]> {
    if (this.useMock) return of(MOCK_DATA_SOURCES).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<DataSource[]>(`${this.baseUrl}/data-sources`);
  }

  getUsers(): Observable<AdminUser[]> {
    if (this.useMock) return of(MOCK_USERS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<AdminUser[]>(`${this.baseUrl}/admin/users`);
  }

  createUser(req: CreateUserRequest): Observable<AdminUser> {
    if (this.useMock) {
      const user: AdminUser = {
        id: `usr-${MOCK_USERS.length + 1}`,
        name: req.name,
        email: req.email,
        role: req.role,
        status: 'invited',
        client: 'web',
        lastLoginAt: '',
      };
      MOCK_USERS.push(user);
      return of(user).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.post<AdminUser>(`${this.baseUrl}/admin/users`, req);
  }

  setUserStatus(id: string, status: AdminUser['status']): Observable<AdminUser> {
    if (this.useMock) {
      const user = MOCK_USERS.find((u) => u.id === id);
      if (user) user.status = status;
      return of(user ?? MOCK_USERS[0]).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.post<AdminUser>(`${this.baseUrl}/admin/users/${id}/status`, { status });
  }

  getSecurityEvents(): Observable<SecurityEvent[]> {
    if (this.useMock) return of(MOCK_SECURITY_EVENTS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<SecurityEvent[]>(`${this.baseUrl}/security/events`);
  }

  getMetrics(): Observable<ObservabilityMetric[]> {
    if (this.useMock) return of(MOCK_METRICS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<ObservabilityMetric[]>(`${this.baseUrl}/observability/metrics`);
  }

  getDeployments(): Observable<Deployment[]> {
    if (this.useMock) return of(MOCK_DEPLOYMENTS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<Deployment[]>(`${this.baseUrl}/deployments`);
  }

  getAuditLog(): Observable<AuditLogEntry[]> {
    if (this.useMock) return of(MOCK_AUDIT_LOG).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<AuditLogEntry[]>(`${this.baseUrl}/audit-log`);
  }

  getSystemSettings(): Observable<SystemSettings> {
    if (this.useMock) return of(MOCK_SYSTEM_SETTINGS).pipe(delay(MOCK_LATENCY_MS));
    return this.http.get<SystemSettings>(`${this.baseUrl}/admin/settings`);
  }

  saveSystemSettings(settings: SystemSettings): Observable<SystemSettings> {
    if (this.useMock) {
      Object.assign(MOCK_SYSTEM_SETTINGS, settings);
      return of(MOCK_SYSTEM_SETTINGS).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.put<SystemSettings>(`${this.baseUrl}/admin/settings`, settings);
  }
}
