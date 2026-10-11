import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { appConfigValues } from '../config';

export type AdminRole = 'admin' | 'staff';

// Supabase Auth wrapper; admin access needs app_metadata.role of 'admin' or 'staff'.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client: SupabaseClient = createClient(
    appConfigValues.supabaseUrl,
    appConfigValues.supabaseAnonKey,
  );

  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!this.roleOf(data.session)) {
      await this.client.auth.signOut();
      throw new Error('This account is not authorized for the admin app.');
    }
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

  roleOf(session: Session | null): AdminRole | null {
    const role = session?.user?.app_metadata?.['role'];
    return role === 'admin' || role === 'staff' ? role : null;
  }

  async getAccessToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token ?? null;
  }
}
