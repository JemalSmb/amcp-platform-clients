import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { authGuard, guestGuard } from './core/auth.guard';
import { Login } from './auth/login';
import { DrawerNav } from './drawer-nav/drawer-nav';
import { Control } from './pages/control/control';
import { Domains } from './pages/domains/domains';
import { Models } from './pages/models/models';
import { Policies } from './pages/policies/policies';
import { Messaging } from './pages/messaging/messaging';
import { Automation } from './pages/automation/automation';
import { Integrations } from './pages/integrations/integrations';
import { Data } from './pages/data/data';
import { Users } from './pages/users/users';
import { Security } from './pages/security/security';
import { Observability } from './pages/observability/observability';
import { Deployments } from './pages/deployments/deployments';
import { Audit } from './pages/audit/audit';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
	{ path: '', redirectTo: 'auth/login', pathMatch: 'full' },
	{
		path: 'auth',
		component: Auth,
		canActivate: [guestGuard],
		children: [
			{ path: 'login', component: Login },
			{ path: '', redirectTo: 'login', pathMatch: 'full' }
		]
	},
	{
		path: '',
		component: DrawerNav,
		canActivate: [authGuard],
		children: [
			{ path: 'dashboard', component: Control, data: { title: 'Control' } },
			{ path: 'domains', component: Domains, data: { title: 'Domains' } },
			{ path: 'models', component: Models, data: { title: 'Models' } },
			{ path: 'policies', component: Policies, data: { title: 'Policies' } },
			{ path: 'messaging', component: Messaging, data: { title: 'Messaging' } },
			{ path: 'automation', component: Automation, data: { title: 'Automation' } },
			{ path: 'integrations', component: Integrations, data: { title: 'Integrations' } },
			{ path: 'data', component: Data, data: { title: 'Data' } },
			{ path: 'users', component: Users, data: { title: 'Users' } },
			{ path: 'security', component: Security, data: { title: 'Security' } },
			{ path: 'observability', component: Observability, data: { title: 'Observability' } },
			{ path: 'deployments', component: Deployments, data: { title: 'Deployments' } },
			{ path: 'audit', component: Audit, data: { title: 'Audit' } },
			{ path: 'settings', component: Settings, data: { title: 'Settings' } },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	}
];
