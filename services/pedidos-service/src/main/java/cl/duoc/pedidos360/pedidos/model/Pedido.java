package cl.duoc.pedidos360.pedidos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entidad JPA de un pedido: cada instancia es una fila de la tabla "pedidos".
 *
 * <p>Antes era un {@code record} inmutable; JPA necesita una clase mutable con
 * constructor sin argumentos, por eso el cambio. La forma del JSON no cambia:
 * Spring serializa a partir de los getters.
 */
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cliente;

    @Column(nullable = false)
    private String producto;

    @Column(nullable = false)
    private int cantidad;

    @Column(nullable = false)
    private BigDecimal total;

    @Column(nullable = false)
    private String estado;

    @Column(nullable = false)
    private LocalDate fecha;

    protected Pedido() {
        // Requerido por JPA.
    }

    public Pedido(String cliente, String producto, int cantidad, BigDecimal total,
                  String estado, LocalDate fecha) {
        this.cliente = cliente;
        this.producto = producto;
        this.cantidad = cantidad;
        this.total = total;
        this.estado = estado;
        this.fecha = fecha;
    }

    public Long getId() {
        return id;
    }

    public String getCliente() {
        return cliente;
    }

    public String getProducto() {
        return producto;
    }

    public int getCantidad() {
        return cantidad;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public String getEstado() {
        return estado;
    }

    public LocalDate getFecha() {
        return fecha;
    }
}
