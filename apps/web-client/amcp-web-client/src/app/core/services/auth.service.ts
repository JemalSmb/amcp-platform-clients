import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { appConfigValues } from '../config';

// Supabase Auth wrapper; the gateway verifies the access token it issues.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client: SupabaseClient = createClient(
    appConfigValues.supabaseUrl,
    appConfigValues.supabaseAnonKey,
  );

  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { client: 'web', ...(name ? { full_name: name } : {}) } },
    });
    if (error) throw error;
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  async getAccessToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token ?? null;
  }
}
