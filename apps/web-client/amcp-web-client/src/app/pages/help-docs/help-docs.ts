import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformApiService } from '../../core/services/platform-api.service';
import { HelpDoc } from '../../core/models/platform.models';

@Component({
  selector: 'app-help-docs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-docs.html',
  styleUrl: './help-docs.css',
})
export class HelpDocs {
  private readonly api = inject(PlatformApiService);

  docs: HelpDoc[] = [];

  constructor() {
    this.api.getHelpDocs().subscribe((docs) => (this.docs = docs));
  }
}
