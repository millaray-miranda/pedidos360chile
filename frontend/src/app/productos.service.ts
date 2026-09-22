import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Producto } from './producto';

/**
 * Cliente HTTP hacia el microservicio de productos. Igual que PedidosService,
 * llama a una ruta relativa (/api/productos); el proxy (o el API Manager en la
 * nube) la reenvía al backend correcto según el path.
 */
@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  // '' en local (proxy) · URL de API Gateway en la nube (ver environment.ts)
  private readonly baseUrl = `${environment.apiBaseUrl}/api/productos`;

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }
}
