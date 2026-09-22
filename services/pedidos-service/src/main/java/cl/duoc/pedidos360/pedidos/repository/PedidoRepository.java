package cl.duoc.pedidos360.pedidos.repository;

import cl.duoc.pedidos360.pedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio de pedidos. Spring Data JPA genera la implementación en tiempo
 * de ejecución: hereda findAll(), findById(), save(), count(), etc., sin
 * escribir SQL.
 */
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}
