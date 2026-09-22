import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { Inicio } from './inicio';
import { Panel } from './panel';

export const routes: Routes = [
  // Pública: pantalla de bienvenida.
  { path: '', component: Inicio },
  // Protegida: solo con sesión iniciada. El guard dispara el login si no la hay.
  { path: 'panel', component: Panel, canActivate: [MsalGuard] },
  { path: '**', redirectTo: '' }
];
