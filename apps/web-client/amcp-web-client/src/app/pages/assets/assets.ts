import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { DomainService } from '../../core/services/domain.service';
import { Asset } from '../../core/models/platform.models';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
})
export class Assets {
  private readonly api = inject(PlatformApiService);
  protected readonly domainService = inject(DomainService);

  private allAssets: Asset[] = [];

  constructor() {
    this.api.getAssets().subscribe((assets) => (this.allAssets = assets));
  }

  get assets(): Asset[] {
    return this.allAssets.filter((a) => a.domain === this.domainService.current());
  }
}
