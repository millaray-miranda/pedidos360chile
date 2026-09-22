import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Pedido } from './pedido';
import { Producto } from './producto';
import { PedidosService } from './pedidos.service';
import { ProductosService } from './productos.service';
import { environment } from '../environments/environment';

type Vista = 'pedidos' | 'productos';

/**
 * Vista protegida por MsalGuard. Solo se crea con sesión iniciada, así que
 * las llamadas al backend ya salen con el JWT que adjunta MsalInterceptor.
 */
@Component({
  selector: 'app-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './panel.html'
})
export class Panel implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly productosService = inject(ProductosService);

  protected readonly vista = signal<Vista>('pedidos');
  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');
  protected readonly ultimaCarga = signal<Date | null>(null);

  /** Origen real de los datos: en la nube es la URL del API Manager. */
  protected readonly origen = environment.apiBaseUrl || 'proxy local (localhost)';

  // --- Indicadores de la cabecera ---
  protected readonly totalPedidos = computed(() => this.pedidos().length);
  protected readonly montoTotal = computed(() =>
    this.pedidos().reduce((suma, p) => suma + (p.total ?? 0), 0)
  );
  protected readonly totalProductos = computed(() => this.productos().length);
  protected readonly stockBajo = computed(() =>
    this.productos().filter((p) => p.stock <= 5).length
  );

  // --- Filtrado por texto ---
  protected readonly pedidosFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.pedidos();
    return this.pedidos().filter((p) =>
      [p.cliente, p.producto, p.estado].some((c) => (c ?? '').toLowerCase().includes(q))
    );
  });

  protected readonly productosFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.productos();
    return this.productos().filter((p) =>
      [p.nombre, p.sku].some((c) => (c ?? '').toLowerCase().includes(q))
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    let pendientes = 2;
    const terminar = () => {
      if (--pendientes === 0) {
        this.cargando.set(false);
        this.ultimaCarga.set(new Date());
      }
    };

    this.pedidosService.listar().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        terminar();
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(this.mensajeDeError('pedidos', e));
        terminar();
      }
    });

    this.productosService.listar().subscribe({
      next: (data) => {
        this.productos.set(data);
        terminar();
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(this.mensajeDeError('productos', e));
        terminar();
      }
    });
  }

  protected cambiarVista(v: Vista): void {
    this.vista.set(v);
    this.busqueda.set('');
  }

  /** Clase del chip según el estado del pedido. */
  protected claseEstado(estado: string): string {
    const e = (estado ?? '').toLowerCase();
    if (e.includes('entreg') || e.includes('complet')) return 'chip chip--ok';
    if (e.includes('pend') || e.includes('proces')) return 'chip chip--espera';
    if (e.includes('cancel') || e.includes('rechaz')) return 'chip chip--alerta';
    return 'chip';
  }

  /** Traduce el código HTTP a algo entendible: sirve para demostrar 401 y 403. */
  private mensajeDeError(recurso: string, e: HttpErrorResponse): string {
    if (e.status === 401) {
      return `Sesión no válida o expirada al consultar ${recurso} (HTTP 401). El token fue rechazado.`;
    }
    if (e.status === 403) {
      return `Tu usuario no tiene el rol necesario para ver ${recurso} (HTTP 403).`;
    }
    if (e.status === 0) {
      return `No se pudo contactar el servicio de ${recurso}. Revisa que el backend esté disponible.`;
    }
    return `No se pudo cargar ${recurso} (HTTP ${e.status}).`;
  }
}
