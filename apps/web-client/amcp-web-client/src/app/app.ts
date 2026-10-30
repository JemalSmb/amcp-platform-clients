import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css',
  imports: [RouterOutlet],
})
export class App {
  constructor() {
    inject(ThemeService); // applies the saved theme as soon as the app starts
  }
}
