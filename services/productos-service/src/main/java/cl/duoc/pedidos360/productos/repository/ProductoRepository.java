package cl.duoc.pedidos360.productos.repository;

import cl.duoc.pedidos360.productos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repositorio de productos. Spring Data JPA implementa los métodos CRUD. */
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
