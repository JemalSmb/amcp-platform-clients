import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { authGuard, guestGuard } from './core/auth.guard';
import { Login } from './auth/login';
import { Signup } from './auth/signup';
import { DrawerNav } from './drawer-nav/drawer-nav';
import { Home } from './pages/home/home';
import { Alerts } from './pages/alerts/alerts';
import { Incidents } from './pages/incidents/incidents';
import { Detections } from './pages/detections/detections';
import { Predictions } from './pages/predictions/predictions';
import { Investigations } from './pages/investigations/investigations';
import { Assets } from './pages/assets/assets';
import { Automation } from './pages/automation/automation';
import { Reports } from './pages/reports/reports';
import { Notifications } from './pages/notifications/notifications';
import { Profile } from './pages/profile/profile';
import { HelpDocs } from './pages/help-docs/help-docs';
import { Settings } from './pages/settings/settings';

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
	},
	{
		path: '',
		component: DrawerNav,
		canActivate: [authGuard],
		children: [
			{ path: 'dashboard', component: Home, data: { title: 'Home' } },
			{ path: 'alerts', component: Alerts, data: { title: 'Alerts' } },
			{ path: 'incidents', component: Incidents, data: { title: 'Incidents' } },
			{ path: 'detections', component: Detections, data: { title: 'Detections' } },
			{ path: 'predictions', component: Predictions, data: { title: 'Predictions' } },
			{ path: 'investigations', component: Investigations, data: { title: 'Investigations' } },
			{ path: 'assets', component: Assets, data: { title: 'Assets' } },
			{ path: 'automation', component: Automation, data: { title: 'Automation' } },
			{ path: 'reports', component: Reports, data: { title: 'Reports' } },
			{ path: 'notifications', component: Notifications, data: { title: 'Notifications' } },
			{ path: 'profile', component: Profile, data: { title: 'Profile' } },
			{ path: 'help-docs', component: HelpDocs, data: { title: 'Help Docs' } },
			{ path: 'settings', component: Settings, data: { title: 'Settings' } },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	}
];
