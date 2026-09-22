import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Pantalla pública. "Entrar al panel" pasa por MsalGuard: sin sesión, redirige al login. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  template: `
    <section class="bienvenida">
      <h2 class="bienvenida__titulo">Gestión de pedidos y productos</h2>
      <p class="bienvenida__texto">
        Inicia sesión con tu cuenta de la organización para acceder al panel.
        El acceso se valida mediante OAuth 2.0 con OpenID Connect y tu sesión
        queda protegida con un token firmado.
      </p>
      <a class="boton" routerLink="/panel">Entrar al panel</a>

      <div class="bienvenida__datos">
        <div class="dato">
          <h3 class="dato__titulo">Autenticación federada</h3>
          <p class="dato__texto">La identidad la administra el proveedor corporativo; la aplicación no almacena contraseñas.</p>
        </div>
        <div class="dato">
          <h3 class="dato__titulo">Acceso por roles</h3>
          <p class="dato__texto">Cada usuario ve solo lo que su rol permite, según los claims del token.</p>
        </div>
        <div class="dato">
          <h3 class="dato__titulo">Arquitectura de microservicios</h3>
          <p class="dato__texto">Pedidos y productos son servicios independientes detrás de un mismo API Manager.</p>
        </div>
      </div>
    </section>
  `
})
export class Inicio {}
