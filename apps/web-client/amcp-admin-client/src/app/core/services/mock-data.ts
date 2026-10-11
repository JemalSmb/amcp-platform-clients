import {
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
  SystemSettings,
} from '../models/admin.models';

export const MOCK_DOMAINS: DomainConfig[] = [
  { id: 'dom-cyber', name: 'cybersecurity', state: 'active', modelCount: 3, description: 'Threat, phishing, and ransomware detection.' },
  { id: 'dom-finance', name: 'finance', state: 'active', modelCount: 2, description: 'Fraud and trading behavior anomaly detection.' },
  { id: 'dom-mfg', name: 'manufacturing', state: 'active', modelCount: 2, description: 'Process anomaly and maintenance forecasting.' },
  { id: 'dom-agri', name: 'agriculture', state: 'planned', modelCount: 0, description: 'Coming soon.' },
];

export const MOCK_MODELS: ModelRegistryEntry[] = [
  { id: 'anomaly_detection', name: 'Anomaly Detection', domain: 'cybersecurity', version: '1.2.0', status: 'healthy', owner: 'S. Rao', deployedAt: '2026-09-10T10:00:00Z' },
  { id: 'phishing_detection', name: 'Phishing Detection', domain: 'cybersecurity', version: '1.0.4', status: 'healthy', owner: 'S. Rao', deployedAt: '2026-09-08T10:00:00Z' },
  { id: 'ransomware_detection', name: 'Ransomware Detection', domain: 'cybersecurity', version: '0.9.1', status: 'degraded', owner: 'K. Novak', deployedAt: '2026-08-30T10:00:00Z' },
  { id: 'finance_fraud_anomaly', name: 'Finance Fraud Anomaly', domain: 'finance', version: '1.1.0', status: 'healthy', owner: 'M. Chen', deployedAt: '2026-09-05T10:00:00Z' },
  { id: 'finance_trading_behavior', name: 'Finance Trading Behavior', domain: 'finance', version: '0.7.0', status: 'healthy', owner: 'M. Chen', deployedAt: '2026-08-28T10:00:00Z' },
  { id: 'manufacturing_process_anomaly', name: 'Manufacturing Process Anomaly', domain: 'manufacturing', version: '0.8.2', status: 'offline', owner: 'J. Alvarez', deployedAt: '2026-08-20T10:00:00Z' },
  { id: 'manufacturing_maintenance_forecast', name: 'Manufacturing Maintenance Forecast', domain: 'manufacturing', version: '0.5.1', status: 'healthy', owner: 'J. Alvarez', deployedAt: '2026-08-15T10:00:00Z' },
];

export const MOCK_POLICIES: Policy[] = [
  { id: 'pol-1', name: 'Block on critical fraud score', domain: 'finance', type: 'response', enforcement: 'enforced', updatedAt: '2026-09-14T09:00:00Z' },
  { id: 'pol-2', name: 'Quarantine phishing senders', domain: 'cybersecurity', type: 'response', enforcement: 'enforced', updatedAt: '2026-09-12T09:00:00Z' },
  { id: 'pol-3', name: 'Log manufacturing drift events', domain: 'manufacturing', type: 'observability', enforcement: 'monitor', updatedAt: '2026-09-10T09:00:00Z' },
];

export const MOCK_CHANNELS: MessagingChannel[] = [
  { id: 'ch-1', subject: 'cybersecurity.events.>', domain: 'cybersecurity', throughputPerMin: 420, status: 'connected' },
  { id: 'ch-2', subject: 'finance.events.>', domain: 'finance', throughputPerMin: 180, status: 'connected' },
  { id: 'ch-3', subject: 'manufacturing.events.>', domain: 'manufacturing', throughputPerMin: 65, status: 'degraded' },
];

export const MOCK_AUTOMATIONS: AutomationPlaybook[] = [
  { id: 'au-1', name: 'Lock account on credential stuffing', domain: 'cybersecurity', trigger: 'anomaly_detection: high severity', status: 'enabled', runCount: 12, lastRunAt: '2026-09-16T08:06:30Z' },
  { id: 'au-2', name: 'Freeze account on fraud score > 0.9', domain: 'finance', trigger: 'finance_fraud_anomaly: score > 0.9', status: 'enabled', runCount: 4, lastRunAt: '2026-09-16T07:41:15Z' },
  { id: 'au-3', name: 'Notify maintenance on process drift', domain: 'manufacturing', trigger: 'manufacturing_process_anomaly: any', status: 'disabled', runCount: 21, lastRunAt: '2026-09-15T22:11:00Z' },
];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int-1', name: 'MLflow', type: 'model-registry', status: 'connected', lastSyncAt: '2026-09-16T08:00:00Z' },
  { id: 'int-2', name: 'NATS', type: 'messaging', status: 'connected', lastSyncAt: '2026-09-16T08:12:00Z' },
  { id: 'int-3', name: 'Postgres', type: 'database', status: 'connected', lastSyncAt: '2026-09-16T08:12:00Z' },
  { id: 'int-4', name: 'Slack', type: 'notification', status: 'disconnected', lastSyncAt: '2026-09-01T00:00:00Z' },
];

export const MOCK_DATA_SOURCES: DataSource[] = [
  { id: 'ds-1', name: 'auth_logs', domain: 'cybersecurity', recordCount: 4_820_000, lastIngestedAt: '2026-09-16T08:11:00Z' },
  { id: 'ds-2', name: 'trade_events', domain: 'finance', recordCount: 1_240_000, lastIngestedAt: '2026-09-16T08:08:00Z' },
  { id: 'ds-3', name: 'sensor_telemetry', domain: 'manufacturing', recordCount: 980_000, lastIngestedAt: '2026-09-16T07:50:00Z' },
];

export const MOCK_USERS: AdminUser[] = [
  { id: 'usr-1', name: 'Jamal Samba', email: 'jamalsamba@gmail.com', role: 'admin', status: 'active', client: 'web', lastLoginAt: '2026-09-16T08:00:00Z' },
  { id: 'usr-2', name: 'S. Rao', email: 's.rao@example.com', role: 'analyst', status: 'active', client: 'app', lastLoginAt: '2026-09-16T07:30:00Z' },
  { id: 'usr-3', name: 'M. Chen', email: 'm.chen@example.com', role: 'analyst', status: 'active', client: 'web', lastLoginAt: '2026-09-15T18:00:00Z' },
  { id: 'usr-4', name: 'K. Novak', email: 'k.novak@example.com', role: 'viewer', status: 'invited', client: 'app', lastLoginAt: '' },
];

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'se-1', type: 'Failed admin login', severity: 'medium', actor: 'unknown@203.0.113.4', occurredAt: '2026-09-16T07:55:00Z' },
  { id: 'se-2', type: 'API key rotated', severity: 'low', actor: 'jamalsamba@gmail.com', occurredAt: '2026-09-16T07:00:00Z' },
  { id: 'se-3', type: 'Suspicious admin permission change', severity: 'high', actor: 'k.novak@example.com', occurredAt: '2026-09-15T21:10:00Z' },
];

export const MOCK_METRICS: ObservabilityMetric[] = [
  { id: 'm-1', name: 'Inference p95 latency', value: 182, unit: 'ms', trend: 'flat' },
  { id: 'm-2', name: 'Events processed / min', value: 665, unit: 'evt/min', trend: 'up' },
  { id: 'm-3', name: 'Error rate', value: 0.4, unit: '%', trend: 'down' },
  { id: 'm-4', name: 'NATS consumer lag', value: 12, unit: 'msgs', trend: 'flat' },
];

export const MOCK_DEPLOYMENTS: Deployment[] = [
  { id: 'dep-1', service: 'inference-service', version: '1.4.0', environment: 'production', status: 'running', deployedAt: '2026-09-15T10:00:00Z' },
  { id: 'dep-2', service: 'cybersecurity-domain-service', version: '1.1.2', environment: 'production', status: 'running', deployedAt: '2026-09-14T10:00:00Z' },
  { id: 'dep-3', service: 'manufacturing-domain-service', version: '0.9.0', environment: 'staging', status: 'deploying', deployedAt: '2026-09-16T08:00:00Z' },
];

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'al-1', actor: 'jamalsamba@gmail.com', action: 'Updated policy pol-1', target: 'pol-1', occurredAt: '2026-09-14T09:00:00Z' },
  { id: 'al-2', actor: 's.rao@example.com', action: 'Deployed model version', target: 'phishing_detection@1.0.4', occurredAt: '2026-09-08T10:00:00Z' },
  { id: 'al-3', actor: 'jamalsamba@gmail.com', action: 'Invited user', target: 'k.novak@example.com', occurredAt: '2026-08-25T12:00:00Z' },
];

export const MOCK_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'AMCP Platform',
  maintenanceMode: false,
  dataRetentionDays: 90,
  defaultAlertSeverity: 'medium',
};
