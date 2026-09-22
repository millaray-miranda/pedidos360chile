import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { loginRequest } from './auth.config';

/**
 * Cascarón de la app: cabecera con inicio/cierre de sesión y el <router-outlet>.
 * Procesa la respuesta del login (redirect) y muestra roles y scopes leídos del access token.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App implements OnInit, OnDestroy {
  private readonly msal = inject(MsalService);
  private readonly broadcast = inject(MsalBroadcastService);
  private readonly destroy$ = new Subject<void>();

  protected readonly usuario = signal<string | null>(null);
  protected readonly roles = signal<string[]>([]);
  protected readonly scopes = signal<string[]>([]);

  ngOnInit(): void {
    // Procesa el ?code=... que vuelve de Azure AD tras el login (Auth Code + PKCE).
    this.msal.handleRedirectObservable().pipe(takeUntil(this.destroy$)).subscribe();

    // Cuando MSAL termina cualquier interacción, se refresca el estado de la sesión.
    this.broadcast.inProgress$
      .pipe(
        filter((estado) => estado === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.actualizarSesion());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected iniciarSesion(): void {
    this.msal.loginRedirect({ ...loginRequest, redirectStartPage: '/panel' });
  }

  protected cerrarSesion(): void {
    this.msal.logoutRedirect();
  }

  private actualizarSesion(): void {
    const instancia = this.msal.instance;
    let cuenta = instancia.getActiveAccount();
    if (!cuenta && instancia.getAllAccounts().length > 0) {
      cuenta = instancia.getAllAccounts()[0];
      instancia.setActiveAccount(cuenta);
    }

    this.usuario.set(cuenta ? cuenta.name ?? cuenta.username : null);
    if (cuenta) {
      this.leerClaimsDelAccessToken();
    } else {
      this.roles.set([]);
      this.scopes.set([]);
    }
  }

  /**
   * Lee "roles" y "scp" del access token de la API. Es solo para MOSTRARLOS en pantalla:
   * la validación real (firma, issuer, audience, expiración) la hacen API Gateway y el backend.
   */
  private leerClaimsDelAccessToken(): void {
    this.msal.acquireTokenSilent(loginRequest).subscribe({
      next: (resultado) => {
        const claims = decodificarPayload(resultado.accessToken);
        this.roles.set(Array.isArray(claims['roles']) ? claims['roles'] : []);
        this.scopes.set(String(claims['scp'] ?? '').split(' ').filter(Boolean));
      },
      error: (e) => console.warn('No se pudo obtener el access token en silencio', e)
    });
  }
}

function decodificarPayload(jwt: string): Record<string, unknown> {
  const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
