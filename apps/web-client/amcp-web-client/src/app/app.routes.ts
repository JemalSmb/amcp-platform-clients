import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Login } from './auth/login';
import { Signup } from './auth/signup';
import { guestGuard } from './core/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'auth/login', pathMatch: 'full' },
	{
		path: 'auth',
		component: Auth,
		canActivate: [guestGuard],
		children: [
			{ path: 'login', component: Login },
			{ path: 'signup', component: Signup },
			{ path: '', redirectTo: 'login', pathMatch: 'full' }
		]
	}
];
