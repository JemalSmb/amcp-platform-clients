import { env } from './env.generated';

// Prod config, swapped in by angular.json fileReplacements.
export const appConfigValues = {
  apiBaseUrl: env.apiBaseUrl,
  gatewayBaseUrl: env.gatewayBaseUrl,
  inferenceUrl: env.inferenceUrl,
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey,
  useMockData: false,
  useGatewayData: true,
};
