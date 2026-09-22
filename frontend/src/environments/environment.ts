/**
 * Configuración del frontend. Todos los valores de Azure AD viven SOLO aquí:
 * para cambiar de tenant o apuntar a API Gateway se edita este archivo y nada más.
 *
 * Estos IDs no son secretos (una SPA es un cliente público), se pueden subir a GitHub.
 */
export const environment = {
  production: false,

  // Entra ID → Overview → Tenant ID (Directorio predeterminado)
   spaClientId:'ffbc10ce-8044-4cf0-ac84-e2ae533ded23',

  // App registrations → pedidos360-spa → Application (client) ID
  tenantId: 'bb5324af-c266-41ed-b36c-a971641c7af2',

  // Scope expuesto por pedidos360-api (Expose an API)
  apiScope: 'api://dfc2eb27-c1cb-4ba8-b865-13c5b0be371b/access_as_user',

  // Vacío en local: las llamadas van a /api/... y el proxy (proxy.conf.json) las reenvía.
  // En la nube: la URL de AWS API Gateway, ej. 'https://abc123.execute-api.us-east-1.amazonaws.com'
  apiBaseUrl: ''
};
