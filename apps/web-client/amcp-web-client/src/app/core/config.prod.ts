import { env } from './env.generated';

// Prod config, swapped in by angular.json fileReplacements.
export const appConfigValues = {
  apiBaseUrl: env.apiBaseUrl,
  gatewayBaseUrl: env.gatewayBaseUrl,
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey,
  helpDocsSource: env.helpDocsSource,
  helpDocsSupabaseBucket: env.helpDocsSupabaseBucket,
  helpDocsSupabasePrefix: env.helpDocsSupabasePrefix,
  useMockData: false,
  useGatewayData: true,
};
