import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Pedido } from './pedido';

/**
 * Cliente HTTP hacia el backend de pedidos.
 *
 * Llama a rutas relativas ("/api/pedidos"), nunca a "http://localhost:8080".
 * En desarrollo, el proxy de Angular (proxy.conf.json) reenvía "/api" al
 * microservicio. En la nube, ese mismo rol lo cumple el API Manager (AWS API
 * Gateway), que además valida el JWT antes de reenviar. El frontend no cambia:
 * siempre habla con una ruta relativa.
 */
@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  // '' en local (proxy) · URL de API Gateway en la nube (ver environment.ts)
  private readonly baseUrl = `${environment.apiBaseUrl}/api/pedidos`;

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/${id}`);
  }
}
