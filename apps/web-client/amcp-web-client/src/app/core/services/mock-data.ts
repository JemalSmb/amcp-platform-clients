import {
  Alert,
  Asset,
  AppSettings,
  AutomationPlaybook,
  Detection,
  DomainStatus,
  HelpDoc,
  Incident,
  Investigation,
  ModelInfo,
  Notification,
  PredictionResult,
  Report,
  UserProfile,
} from '../models/platform.models';

export const MOCK_MODELS: ModelInfo[] = [
  { id: 'anomaly_detection', name: 'Anomaly Detection', domain: 'cybersecurity', version: '1.2.0', status: 'healthy', lastScoredAt: '2026-09-16T08:12:00Z' },
  { id: 'phishing_detection', name: 'Phishing Detection', domain: 'cybersecurity', version: '1.0.4', status: 'healthy', lastScoredAt: '2026-09-16T08:10:00Z' },
  { id: 'ransomware_detection', name: 'Ransomware Detection', domain: 'cybersecurity', version: '0.9.1', status: 'degraded', lastScoredAt: '2026-09-16T07:55:00Z' },
  { id: 'finance_fraud_anomaly', name: 'Finance Fraud Anomaly', domain: 'finance', version: '1.1.0', status: 'healthy', lastScoredAt: '2026-09-16T08:09:00Z' },
  { id: 'manufacturing_process_anomaly', name: 'Manufacturing Process Anomaly', domain: 'manufacturing', version: '0.8.2', status: 'offline', lastScoredAt: '2026-09-16T05:30:00Z' },
];

export const MOCK_ALERTS: Alert[] = [
  { id: 'al-1001', title: 'Suspicious login burst', domain: 'cybersecurity', severity: 'high', modelId: 'anomaly_detection', createdAt: '2026-09-16T08:05:00Z', summary: 'Repeated failed logins from a new region followed by a success.' },
  { id: 'al-1002', title: 'Phishing email flagged', domain: 'cybersecurity', severity: 'medium', modelId: 'phishing_detection', createdAt: '2026-09-16T07:48:00Z', summary: 'Inbound email matched known phishing lure pattern.' },
  { id: 'al-1003', title: 'Unusual trading velocity', domain: 'finance', severity: 'critical', modelId: 'finance_fraud_anomaly', createdAt: '2026-09-16T07:40:00Z', summary: 'Account exceeded normal trade frequency by 12x baseline.' },
  { id: 'al-1004', title: 'Line pressure drift', domain: 'manufacturing', severity: 'low', modelId: 'manufacturing_process_anomaly', createdAt: '2026-09-16T06:58:00Z', summary: 'Sensor reading drifted outside tolerance for 3 cycles.' },
];

export const MOCK_PREDICTIONS: PredictionResult[] = [
  { id: 'pr-2001', modelId: 'anomaly_detection', domain: 'cybersecurity', score: 0.93, label: 'anomalous', createdAt: '2026-09-16T08:11:00Z' },
  { id: 'pr-2002', modelId: 'phishing_detection', domain: 'cybersecurity', score: 0.81, label: 'phishing', createdAt: '2026-09-16T08:09:30Z' },
  { id: 'pr-2003', modelId: 'finance_fraud_anomaly', domain: 'finance', score: 0.97, label: 'fraud_suspected', createdAt: '2026-09-16T08:08:00Z' },
  { id: 'pr-2004', modelId: 'manufacturing_process_anomaly', domain: 'manufacturing', score: 0.42, label: 'normal', createdAt: '2026-09-16T07:50:00Z' },
];

export const MOCK_DOMAIN_STATUS: DomainStatus[] = [
  { domain: 'cybersecurity', health: 'operational', eventsLast24h: 1842, alertsLast24h: 6 },
  { domain: 'finance', health: 'operational', eventsLast24h: 934, alertsLast24h: 2 },
  { domain: 'manufacturing', health: 'degraded', eventsLast24h: 411, alertsLast24h: 3 },
  { domain: 'agriculture', health: 'down', eventsLast24h: 0, alertsLast24h: 0 },
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'in-3001', title: 'Credential stuffing campaign', domain: 'cybersecurity', severity: 'high', status: 'investigating', assignee: 'S. Rao', openedAt: '2026-09-16T08:06:00Z', linkedAlertId: 'al-1001' },
  { id: 'in-3002', title: 'Fraud ring suspected', domain: 'finance', severity: 'critical', status: 'open', assignee: 'Unassigned', openedAt: '2026-09-16T07:41:00Z', linkedAlertId: 'al-1003' },
  { id: 'in-3003', title: 'Sensor calibration drift', domain: 'manufacturing', severity: 'low', status: 'resolved', assignee: 'J. Alvarez', openedAt: '2026-09-15T22:10:00Z', linkedAlertId: 'al-1004' },
];

export const MOCK_DETECTIONS: Detection[] = [
  { id: 'de-4001', modelId: 'anomaly_detection', domain: 'cybersecurity', signal: 'Login velocity spike', confidence: 0.93, detectedAt: '2026-09-16T08:11:00Z' },
  { id: 'de-4002', modelId: 'phishing_detection', domain: 'cybersecurity', signal: 'Lookalike domain in email body', confidence: 0.81, detectedAt: '2026-09-16T08:09:30Z' },
  { id: 'de-4003', modelId: 'finance_fraud_anomaly', domain: 'finance', signal: 'Trade frequency outlier', confidence: 0.97, detectedAt: '2026-09-16T08:08:00Z' },
  { id: 'de-4004', modelId: 'manufacturing_process_anomaly', domain: 'manufacturing', signal: 'Pressure sensor drift', confidence: 0.42, detectedAt: '2026-09-16T07:50:00Z' },
];

export const MOCK_INVESTIGATIONS: Investigation[] = [
  { id: 'iv-5001', title: 'Q3 credential abuse review', domain: 'cybersecurity', status: 'in_progress', owner: 'S. Rao', incidentIds: ['in-3001'], updatedAt: '2026-09-16T08:20:00Z' },
  { id: 'iv-5002', title: 'Trading anomaly root cause', domain: 'finance', status: 'open', owner: 'M. Chen', incidentIds: ['in-3002'], updatedAt: '2026-09-16T07:45:00Z' },
];

export const MOCK_ASSETS: Asset[] = [
  { id: 'as-6001', name: 'auth-gateway-01', domain: 'cybersecurity', type: 'service', risk: 'high', lastSeenAt: '2026-09-16T08:12:00Z' },
  { id: 'as-6002', name: 'trading-api', domain: 'finance', type: 'service', risk: 'medium', lastSeenAt: '2026-09-16T08:09:00Z' },
  { id: 'as-6003', name: 'line-3-plc', domain: 'manufacturing', type: 'device', risk: 'low', lastSeenAt: '2026-09-16T07:50:00Z' },
];

export const MOCK_AUTOMATIONS: AutomationPlaybook[] = [
  { id: 'au-7001', name: 'Lock account on credential stuffing', domain: 'cybersecurity', trigger: 'anomaly_detection: high severity', status: 'enabled', lastRunAt: '2026-09-16T08:06:30Z', runCount: 12 },
  { id: 'au-7002', name: 'Freeze account on fraud score > 0.9', domain: 'finance', trigger: 'finance_fraud_anomaly: score > 0.9', status: 'enabled', lastRunAt: '2026-09-16T07:41:15Z', runCount: 4 },
  { id: 'au-7003', name: 'Notify maintenance on process drift', domain: 'manufacturing', trigger: 'manufacturing_process_anomaly: any', status: 'disabled', lastRunAt: '2026-09-15T22:11:00Z', runCount: 21 },
];

export const MOCK_REPORTS: Report[] = [
  { id: 'rp-8001', title: 'Weekly security posture summary', domain: 'cybersecurity', generatedAt: '2026-09-15T06:00:00Z', period: 'Sep 8 - Sep 15' },
  { id: 'rp-8002', title: 'Fraud detection performance', domain: 'finance', generatedAt: '2026-09-15T06:00:00Z', period: 'Sep 8 - Sep 15' },
  { id: 'rp-8003', title: 'Platform-wide event summary', domain: 'platform', generatedAt: '2026-09-15T06:00:00Z', period: 'Sep 8 - Sep 15' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'no-9001', message: 'New critical alert in finance domain', read: false, createdAt: '2026-09-16T07:41:00Z' },
  { id: 'no-9002', message: 'Automation "Lock account on credential stuffing" ran successfully', read: false, createdAt: '2026-09-16T08:06:35Z' },
  { id: 'no-9003', message: 'Weekly report generated', read: true, createdAt: '2026-09-15T06:01:00Z' },
];

export const MOCK_PROFILE: UserProfile = {
  id: 'usr-1',
  name: 'Jamal Samba',
  email: 'jamalsamba@gmail.com',
  role: 'Security Analyst',
  timezone: 'UTC',
};

export const MOCK_HELP_DOCS: HelpDoc[] = [
  { id: 'hd-1', title: 'Getting started with the dashboard', category: 'Basics', summary: 'Overview of the model status, alerts, and predictions views.' },
  { id: 'hd-2', title: 'Understanding alert severity', category: 'Alerts', summary: 'How severity levels are assigned and what they mean.' },
  { id: 'hd-3', title: 'Configuring automation playbooks', category: 'Automation', summary: 'How to enable, disable, and trigger response playbooks.' },
];

export const MOCK_SETTINGS: AppSettings = {
  theme: 'light',
  emailAlerts: true,
  alertSeverityThreshold: 'medium',
  refreshIntervalSeconds: 30,
};
