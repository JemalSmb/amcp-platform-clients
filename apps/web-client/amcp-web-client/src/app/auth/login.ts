import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-form-panel auth-form-panel--login">
      <form (ngSubmit)="onSubmit($event)" #loginForm="ngForm" class="auth-form auth-form--login">
        <div class="auth-field">
          <input id="login-email" name="email" type="email" required [(ngModel)]="model.email" class="auth-input auth-input--email" placeholder="Email" aria-label="Email" />
          <span class="auth-underline auth-underline--email" aria-hidden="true"></span>
        </div>

        <div class="auth-field">
          <input id="login-password" name="password" type="password" required [(ngModel)]="model.password" class="auth-input auth-input--password" placeholder="Password" aria-label="Password" />
          <span class="auth-underline auth-underline--password" aria-hidden="true"></span>
        </div>

        <p *ngIf="error" class="auth-error" role="alert">{{ error }}</p>

        <button type="submit" class="auth-submit auth-submit--login" [disabled]="loginForm.invalid">
          Login
        </button>
      </form>

      <div class="auth-footnote">
        <span>Don't have an account?</span>
        <a class="btn btn-ghost ml-[-14px] pt-[9px]" routerLink="/auth/signup">Signup Here</a>
      </div>
    </div>
  `,
})
export class Login {
  constructor(private readonly router: Router, private readonly auth: AuthService) {}

  model = { email: '', password: '' };
  error: string | null = null;

  async onSubmit(event: Event) {
    event.preventDefault();
    this.error = null;
    try {
      await this.auth.login(this.model.email, this.model.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err?.message ?? 'Login failed';
    }
  }
}
