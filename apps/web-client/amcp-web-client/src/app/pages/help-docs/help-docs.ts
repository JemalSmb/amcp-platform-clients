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
  openDoc: HelpDoc | null = null;
  loadingId: string | null = null;
  error = '';

  constructor() {
    this.api.getHelpDocs().subscribe((docs) => (this.docs = docs));
  }

  toggle(doc: HelpDoc): void {
    if (this.openDoc?.id === doc.id) {
      this.close();
      return;
    }
    this.open(doc);
  }

  open(doc: HelpDoc): void {
    this.error = '';
    this.loadingId = doc.id;
    this.api.getHelpDoc(doc).subscribe({
      next: (full) => {
        this.openDoc = full;
        this.loadingId = null;
        // The content renders inside the clicked card; bring it into view.
        setTimeout(() => document.querySelector('article')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
      },
      error: () => {
        this.error = `Could not load "${doc.title}".`;
        this.loadingId = null;
      },
    });
  }

  close(): void {
    this.openDoc = null;
  }
}
