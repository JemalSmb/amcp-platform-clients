import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelUpdateNotice, ModelUpdateWatcherService } from '../services/model-update-watcher.service';

interface Toast extends ModelUpdateNotice {
  id: number;
}

@Component({
  selector: 'app-model-update-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-update-toast.html',
  styleUrl: './model-update-toast.css',
})
export class ModelUpdateToast implements OnInit {
  private readonly watcher = inject(ModelUpdateWatcherService);
  private nextId = 0;

  toasts: Toast[] = [];

  ngOnInit(): void {
    this.watcher.start();
    this.watcher.updates$.subscribe((notice) => {
      const toast: Toast = { ...notice, id: this.nextId++ };
      this.toasts = [...this.toasts, toast];
      setTimeout(() => this.dismiss(toast.id), 8000);
    });
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}
