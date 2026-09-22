import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Pantalla pública. "Ir al panel" pasa por MsalGuard: sin sesión, redirige al login. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  template: `
    <section class="bienvenida">
      <p>Inicia sesión con tu cuenta de la organización para ver pedidos y productos.</p>
      <a class="boton" routerLink="/panel">Ir al panel</a>
    </section>
  `
})
export class Inicio {}
