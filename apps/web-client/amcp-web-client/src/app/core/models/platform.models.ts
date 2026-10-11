export type PlatformDomain = 'cybersecurity' | 'finance' | 'manufacturing' | 'agriculture';

export type ModelStatus = 'healthy' | 'degraded' | 'offline';

export interface ModelInfo {
  id: string;
  name: string;
  domain: PlatformDomain;
  version: string;
  status: ModelStatus;
  lastScoredAt: string;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  title: string;
  domain: ModelInfo['domain'];
  severity: Severity;
  modelId: string;
  createdAt: string;
  summary: string;
}

export interface PredictionResult {
  id: string;
  modelId: string;
  domain: ModelInfo['domain'];
  score: number;
  label: string;
  createdAt: string;
}

export type DomainHealth = 'operational' | 'degraded' | 'down';

export interface DomainStatus {
  domain: ModelInfo['domain'];
  health: DomainHealth;
  eventsLast24h: number;
  alertsLast24h: number;
}

export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  domain: ModelInfo['domain'];
  severity: Severity;
  status: IncidentStatus;
  assignee: string;
  openedAt: string;
  linkedAlertId: string;
}

export interface Detection {
  id: string;
  modelId: string;
  domain: ModelInfo['domain'];
  signal: string;
  confidence: number;
  detectedAt: string;
}

export type InvestigationStatus = 'open' | 'in_progress' | 'closed';

export interface Investigation {
  id: string;
  title: string;
  domain: ModelInfo['domain'];
  status: InvestigationStatus;
  owner: string;
  incidentIds: string[];
  updatedAt: string;
}

export type AssetRisk = 'low' | 'medium' | 'high';

export interface Asset {
  id: string;
  name: string;
  domain: ModelInfo['domain'];
  type: string;
  risk: AssetRisk;
  lastSeenAt: string;
}

export type AutomationStatus = 'enabled' | 'disabled';

export interface AutomationPlaybook {
  id: string;
  name: string;
  domain: ModelInfo['domain'];
  trigger: string;
  status: AutomationStatus;
  lastRunAt: string;
  runCount: number;
}

export interface Report {
  id: string;
  title: string;
  domain: ModelInfo['domain'] | 'platform';
  generatedAt: string;
  period: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  timezone: string;
}

export interface HelpDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  emailAlerts: boolean;
  alertSeverityThreshold: Severity;
  refreshIntervalSeconds: number;
}

// AMCP backend gateway contracts (amcp-services/.../services/gateway/gateway.py)


export interface GatewayHealth {
  service: string;
  status: string;
  nats_connected: boolean;
  domains_configured: string[];
}

export interface GatewayModelInfo {
  id: string;
  name: string;
  domain: string;
  version: string;
  status: string;
  trained: boolean;
  architecture: string;
  source: string;
}

export interface GatewayDomainStatusEntry {
  name: string;
  url: string;
  status: 'up' | 'down';
  detail: unknown;
}

export interface GatewayAlertEvent {
  id: string;
  timestamp: string;
  domain: string;
  event_type: string;
  severity: string;
  source: Record<string, string>;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  _subject?: string;
}

export interface DomainTriggerRequest {
  features: Record<string, number>;
  source?: Record<string, string>;
}

export type DomainTriggerResponse = Record<string, unknown>;
