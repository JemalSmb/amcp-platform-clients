export type PlatformDomain = 'cybersecurity' | 'finance' | 'manufacturing' | 'agriculture';

export type DomainState = 'active' | 'inactive' | 'planned';

export interface DomainConfig {
  id: string;
  name: PlatformDomain;
  state: DomainState;
  modelCount: number;
  description: string;
}

export type ModelStatus = 'healthy' | 'degraded' | 'offline';

export interface ModelRegistryEntry {
  id: string;
  name: string;
  domain: PlatformDomain;
  version: string;
  status: ModelStatus;
  owner: string;
  deployedAt: string;
}

export type EnforcementMode = 'enforced' | 'monitor' | 'disabled';

export interface Policy {
  id: string;
  name: string;
  domain: PlatformDomain;
  type: string;
  enforcement: EnforcementMode;
  updatedAt: string;
}

export type ChannelStatus = 'connected' | 'degraded' | 'down';

export interface MessagingChannel {
  id: string;
  subject: string;
  domain: PlatformDomain;
  throughputPerMin: number;
  status: ChannelStatus;
}

export type AutomationStatus = 'enabled' | 'disabled';

export interface AutomationPlaybook {
  id: string;
  name: string;
  domain: PlatformDomain;
  trigger: string;
  status: AutomationStatus;
  runCount: number;
  lastRunAt: string;
}

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: IntegrationStatus;
  lastSyncAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  domain: PlatformDomain;
  recordCount: number;
  lastIngestedAt: string;
}

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type UserStatus = 'active' | 'suspended' | 'invited';

/** Which client the user signs in from: the browser web client or the desktop app. */
export type UserClient = 'web' | 'app';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  client: UserClient;
  lastLoginAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id: string;
  type: string;
  severity: SecuritySeverity;
  actor: string;
  occurredAt: string;
}

export interface ObservabilityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
}

export type DeploymentStatus = 'running' | 'deploying' | 'failed';

export interface Deployment {
  id: string;
  service: string;
  version: string;
  environment: string;
  status: DeploymentStatus;
  deployedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
}

export interface SystemSettings {
  platformName: string;
  maintenanceMode: boolean;
  dataRetentionDays: number;
  defaultAlertSeverity: SecuritySeverity;
}

export interface AdminOverview {
  activeDomains: number;
  totalModels: number;
  healthyModels: number;
  activeUsers: number;
  openSecurityEvents: number;
  runningDeployments: number;
}
