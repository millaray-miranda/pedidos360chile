package cl.duoc.pedidos360.productos.web;

import cl.duoc.pedidos360.productos.model.Producto;
import cl.duoc.pedidos360.productos.repository.ProductoRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints REST del microservicio de productos. Segundo microservicio del
 * sistema: el API Manager enruta /api/productos aquí y /api/pedidos al otro
 * backend. Los datos vienen de la base de datos vía repositorio JPA.
 */
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository repository;

    public ProductoController(ProductoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Producto> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
