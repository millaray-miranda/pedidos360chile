/** Un pedido, tal como lo devuelve el microservicio pedidos-service.
 *  Espeja el record Pedido de Spring Boot (mismos nombres de campo). */
export interface Pedido {
  id: number;
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  estado: string;
  fecha: string;
}
