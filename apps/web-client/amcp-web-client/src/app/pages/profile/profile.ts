import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { UserProfile } from '../../core/models/platform.models';

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

  constructor() {
    this.api.getProfile().subscribe((profile) => (this.profile = profile));
  }
}
