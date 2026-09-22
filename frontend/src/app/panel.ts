import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Pedido } from './pedido';
import { Producto } from './producto';
import { PedidosService } from './pedidos.service';
import { ProductosService } from './productos.service';

type Vista = 'pedidos' | 'productos';

/**
 * Vista protegida (MsalGuard). Solo se crea con sesión iniciada, así las llamadas
 * al backend ya salen con el JWT que adjunta MsalInterceptor.
 */
@Component({
  selector: 'app-panel',
  imports: [CommonModule],
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

  ngOnInit(): void {
    this.pedidosService.listar().subscribe({
      next: (data) => this.pedidos.set(data),
      error: (e: HttpErrorResponse) =>
        this.error.set(`No se pudo cargar la lista de pedidos (HTTP ${e.status}).`)
    });
    this.productosService.listar().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(`No se pudo cargar el catálogo de productos (HTTP ${e.status}).`);
        this.cargando.set(false);
      }
    });
  }

  protected cambiarVista(v: Vista): void {
    this.vista.set(v);
  }
}
