import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  encapsulation: ViewEncapsulation.None
})
export class Auth {}
