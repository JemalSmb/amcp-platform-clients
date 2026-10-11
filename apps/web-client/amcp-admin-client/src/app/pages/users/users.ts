import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AdminUser, CreateUserRequest, UserRole } from '../../core/models/admin.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private readonly api = inject(AdminApiService);

  users: AdminUser[] = [];
  roles: UserRole[] = ['admin', 'analyst', 'viewer'];
  showForm = false;
  saving = false;
  error: string | null = null;
  form: CreateUserRequest = this.emptyForm();

  constructor() {
    this.api.getUsers().subscribe((users) => (this.users = users));
  }

  toggleSuspend(user: AdminUser): void {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    this.api.setUserStatus(user.id, nextStatus).subscribe((updated) => {
      user.status = updated.status;
    });
  }

  openForm(): void {
    this.form = this.emptyForm();
    this.error = null;
    this.showForm = true;
  }

  createUser(): void {
    this.saving = true;
    this.error = null;
    this.api.createUser(this.form).subscribe({
      next: (user) => {
        this.users = [...this.users, user];
        this.showForm = false;
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.detail ?? 'Could not create user';
        this.saving = false;
      },
    });
  }

  private emptyForm(): CreateUserRequest {
    return { name: '', email: '', password: '', role: 'viewer' };
  }
}
