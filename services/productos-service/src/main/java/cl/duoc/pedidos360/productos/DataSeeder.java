package cl.duoc.pedidos360.productos;

import cl.duoc.pedidos360.productos.model.Producto;
import cl.duoc.pedidos360.productos.repository.ProductoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Carga productos de ejemplo al arrancar, solo si la tabla está vacía. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductoRepository repository;

    public DataSeeder(ProductoRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        repository.saveAll(List.of(
                new Producto("NB-14", "Notebook 14\"", new BigDecimal("499000"), 40),
                new Producto("MON-27", "Monitor 27\"", new BigDecimal("149000"), 85),
                new Producto("TEC-MEC", "Teclado mecánico", new BigDecimal("29990"), 200)));
    }
}
