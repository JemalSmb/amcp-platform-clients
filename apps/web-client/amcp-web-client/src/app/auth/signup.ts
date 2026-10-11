import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-form-panel auth-form-panel--signup">
      <form (ngSubmit)="onSignup($event)" #signupForm="ngForm" class="auth-form auth-form--signup">
        <div class="auth-field">
          <input id="signup-name" name="name" type="text" required [(ngModel)]="model.name" class="auth-input auth-input--name" placeholder="Full Name" aria-label="Full Name" />
          <span class="auth-underline auth-underline--name" aria-hidden="true"></span>
        </div>

        <div class="auth-field">
          <input id="signup-email" name="email" type="email" required [(ngModel)]="model.email" class="auth-input auth-input--email" placeholder="Email" aria-label="Email" />
          <span class="auth-underline auth-underline--email" aria-hidden="true"></span>
        </div>

        <div class="auth-field">
          <input id="signup-password" name="password" type="password" required [(ngModel)]="model.password" class="auth-input auth-input--password" placeholder="Password" aria-label="Password" />
          <span class="auth-underline auth-underline--password" aria-hidden="true"></span>
        </div>

        <p *ngIf="error" class="auth-error" role="alert">{{ error }}</p>

        <button type="submit" class="auth-submit auth-submit--signup" [disabled]="signupForm.invalid">
          Create Account
        </button>
      </form>

      <div class="auth-footnote">
        <span>Already have an account?</span>
        <a class="btn btn-ghost ml-[-14px] pt-[9px]" routerLink="/auth/login">Login</a>
      </div>
    </div>
  `,
})
export class Signup {
  constructor(private readonly router: Router, private readonly auth: AuthService) {}

  model = { name: '', email: '', password: '' };
  error: string | null = null;

  async onSignup(event: Event) {
    event.preventDefault();
    this.error = null;
    try {
      await this.auth.signUp(this.model.email, this.model.password, this.model.name);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err?.message ?? 'Signup failed';
    }
  }
}
