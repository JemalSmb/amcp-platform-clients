import { Injectable, signal } from '@angular/core';
import { PlatformDomain } from '../models/admin.models';

export interface DomainMeta {
  id: PlatformDomain;
  label: string;
  color: string;
  colorSoft: string;
  comingSoon?: boolean;
}

export const DOMAINS: DomainMeta[] = [
  { id: 'cybersecurity', label: 'Cybersecurity', color: '#00571A', colorSoft: '#d1fae5' },
  { id: 'finance', label: 'Finance', color: '#2563eb', colorSoft: '#dbeafe' },
  { id: 'manufacturing', label: 'Manufacturing', color: '#d97706', colorSoft: '#fef3c7' },
  { id: 'agriculture', label: 'Agriculture', color: '#65a30d', colorSoft: '#ecfccb', comingSoon: true },
];

const STORAGE_KEY = 'amcp.admin.selectedDomain';

@Injectable({ providedIn: 'root' })
export class DomainService {
  readonly domains = DOMAINS;

  private readonly _current = signal<PlatformDomain>(this.readStored());
  readonly current = this._current.asReadonly();

  constructor() {
    this.applyTheme(this.currentMeta());
  }

  currentMeta(): DomainMeta {
    return this.domains.find((d) => d.id === this._current()) ?? this.domains[0];
  }

  setDomain(id: PlatformDomain): void {
    this._current.set(id);
    this.applyTheme(this.currentMeta());
    this.writeStored(id);
  }

  private applyTheme(meta: DomainMeta): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.style.setProperty('--domain-color', meta.color);
    document.documentElement.style.setProperty('--domain-color-soft', meta.colorSoft);
  }

  private readStored(): PlatformDomain {
    if (typeof localStorage === 'undefined') {
      return 'cybersecurity';
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PlatformDomain | null;
      return stored && this.domains.some((d) => d.id === stored) ? stored : 'cybersecurity';
    } catch {
      return 'cybersecurity';
    }
  }

  private writeStored(id: PlatformDomain): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // per-viewer convenience only; ignore storage failures
    }
  }
}
