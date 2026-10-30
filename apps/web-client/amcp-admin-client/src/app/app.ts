import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ModelUpdateToast } from './core/model-update-toast/model-update-toast';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet></router-outlet><app-model-update-toast></app-model-update-toast>',
  styleUrl: './app.css',
  imports: [RouterOutlet, ModelUpdateToast],
})

export class App {
  constructor() {
    inject(ThemeService); // applies the saved theme as soon as the app starts
  }
}

