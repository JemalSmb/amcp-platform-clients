import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { UserProfile } from '../../core/models/platform.models';

const COMMON_TIMEZONES = [
  'UTC',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly api = inject(PlatformApiService);

  profile: UserProfile | null = null;
  timezones: string[] = COMMON_TIMEZONES;
  saving = false;
  saved = false;
  error = '';

  constructor() {
    this.api.getProfile().subscribe((profile) => {
      this.profile = profile;
      if (!this.timezones.includes(profile.timezone)) {
        this.timezones = [profile.timezone, ...COMMON_TIMEZONES];
      }
    });
  }

  get initials(): string {
    const parts = (this.profile?.name ?? '').trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? '?').toUpperCase() + (parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : '');
  }

  get nameMissing(): boolean {
    return !!this.profile && this.profile.name.trim() === '';
  }

  touch(): void {
    this.saved = false;
    this.error = '';
  }

  save(): void {
    if (!this.profile || this.nameMissing) {
      return;
    }
    this.saving = true;
    this.touch();
    this.api.updateProfile({ name: this.profile.name.trim(), timezone: this.profile.timezone }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.saving = false;
        this.saved = true;
      },
      error: () => {
        this.saving = false;
        this.error = 'Could not save your profile. Please try again.';
      },
    });
  }
}
