import { env } from './env.generated';

// Dev config; values come from .env via scripts/load-env.mjs.
export const appConfigValues = {
  apiBaseUrl: env.apiBaseUrl,
  gatewayBaseUrl: env.gatewayBaseUrl,
  inferenceUrl: env.inferenceUrl,
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey,
  useMockData: true,
  useGatewayData: false,
};
