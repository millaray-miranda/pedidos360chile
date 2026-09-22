package cl.duoc.pedidos360.pedidos.web;

import cl.duoc.pedidos360.pedidos.model.Pedido;
import cl.duoc.pedidos360.pedidos.repository.PedidoRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints REST del microservicio de pedidos.
 *
 * <p>Los datos ahora vienen de la base de datos vía el repositorio JPA (antes
 * era una lista en memoria). Se consume SIEMPRE a través del API Manager, que
 * valida el JWT antes de reenviar aquí.
 */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository repository;

    public PedidoController(PedidoRepository repository) {
        this.repository = repository;
    }

    /** Lista todos los pedidos. Responde 200 con un arreglo JSON. */
    @GetMapping
    public List<Pedido> listar() {
        return repository.findAll();
    }

    /** Devuelve un pedido por id, o 404 si no existe. */
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtener(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
