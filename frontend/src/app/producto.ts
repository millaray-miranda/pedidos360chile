/** Un producto, tal como lo devuelve el microservicio productos-service. */
export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
}
