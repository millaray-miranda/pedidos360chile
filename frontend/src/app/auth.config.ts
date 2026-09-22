import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { environment } from '../environments/environment';

/** Scopes que se piden al iniciar sesión: el de NUESTRA API, no el de Microsoft Graph. */
export const loginRequest = { scopes: [environment.apiScope] };

/**
 * Cliente MSAL. Usa el flujo OIDC Authorization Code + PKCE (es el único que
 * MSAL Browser implementa para SPA: genera code_verifier/code_challenge, state y nonce).
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.spaClientId,
      authority: `https://login.microsoftonline.com/${environment.tenantId}`,
      // Sin "/" final: debe coincidir EXACTO con la redirect URI tipo SPA registrada.
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
        loggerCallback: (_level, message) => console.log('[MSAL]', message)
      }
    }
  });
}

/**
 * MsalInterceptor: adjunta "Authorization: Bearer <access token>" a toda llamada
 * que calce con esta ruta. Si la URL no calza, NO se adjunta token (y el backend responde 401).
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(`${environment.apiBaseUrl}/api/*`, [environment.apiScope]);
  return { interactionType: InteractionType.Redirect, protectedResourceMap };
}

/** MsalGuard: si alguien entra a una ruta protegida sin sesión, lo manda a iniciar sesión. */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest,
    loginFailedRoute: '/'
  };
}
