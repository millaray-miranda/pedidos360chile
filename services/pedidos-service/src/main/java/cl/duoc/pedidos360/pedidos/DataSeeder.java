package cl.duoc.pedidos360.pedidos;

import cl.duoc.pedidos360.pedidos.model.Pedido;
import cl.duoc.pedidos360.pedidos.repository.PedidoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Carga datos de ejemplo al arrancar, SOLO si la tabla está vacía (idempotente:
 * reiniciar no duplica filas). Es data de demostración; en producción los datos
 * llegan por la API.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final PedidoRepository repository;

    public DataSeeder(PedidoRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        repository.saveAll(List.of(
                new Pedido("Comercial Andes Ltda.", "Notebook 14\"", 5,
                        new BigDecimal("2495000"), "PAGADO", LocalDate.of(2026, 9, 12)),
                new Pedido("Distribuidora Sur SpA", "Monitor 27\"", 12,
                        new BigDecimal("1788000"), "EN_PREPARACION", LocalDate.of(2026, 9, 15)),
                new Pedido("Servicios Norte EIRL", "Teclado mecánico", 30,
                        new BigDecimal("899700"), "DESPACHADO", LocalDate.of(2026, 9, 18))));
    }
}
