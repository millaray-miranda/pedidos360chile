# Pedidos360

Sistema de gestión de pedidos — evaluación **DSY1107 Desarrollo Cloud Native I** (Duoc).

Arquitectura cloud-native: frontend Angular con autenticación **Azure AD (MSAL)**,
backend en **microservicios Spring Boot** desplegados en **EC2**, expuestos a través de
un **API Manager (AWS API Gateway)** que valida el **JWT** antes de reenviar al backend.

```
Navegador ──> Angular (MSAL, OIDC Auth Code + PKCE)
                 │  JWT en el header Authorization
                 ▼
           API Manager (AWS API Gateway)   ← valida issuer, audience, firma, expiración
                 │  reenvía solo si el token es válido
                 ▼
           Microservicios Spring Boot (EC2)  ← revalidan el JWT (defensa en profundidad)
                 │
                 ▼
           Base de datos cloud
```

## Estructura

```
pedidos360/
├─ frontend/                 # Angular 20 (app "Pedidos360")
│  ├─ src/app/pedido.ts          # modelo
│  ├─ src/app/pedidos.service.ts # cliente HTTP a /api/pedidos
│  └─ proxy.conf.json            # dev: enruta /api/pedidos->8080 y /api/productos->8082 (en la nube: API Manager)
└─ services/
   ├─ pedidos-service/       # microservicio Spring Boot (Java 21) · puerto 8080
   │  └─ .../web/PedidoController.java     # GET /api/pedidos, GET /api/pedidos/{id}
   └─ productos-service/     # microservicio Spring Boot (Java 21) · puerto 8082
      └─ .../web/ProductoController.java   # GET /api/productos, GET /api/productos/{id}
```

## Cómo correrlo en local

**1. Base de datos** (Docker):

```bash
docker compose up -d            # PostgreSQL en localhost:5434 (db "pedidos360")
```

**2. Backend** (necesita Java 21; usa el wrapper `mvnw`, no requiere Maven instalado).
Cada microservicio en su propia terminal:

```bash
cd services/pedidos-service   && ./mvnw spring-boot:run   # http://localhost:8080
cd services/productos-service && ./mvnw spring-boot:run   # http://localhost:8082
```

Al arrancar, cada servicio crea su tabla y siembra datos de ejemplo (solo si está vacía).
Prueba: `curl http://localhost:8080/api/pedidos` · `curl http://localhost:8082/api/productos`

**3. Frontend** (necesita Node 22.12+):

```bash
cd frontend
npx ng serve                    # queda en http://localhost:4200
```

El frontend llama a rutas relativas (`/api/...`); el proxy de desarrollo las reenvía al
microservicio correcto según el path. En la nube ese rol lo cumple el API Manager.

### Conexión a la base de datos

Las credenciales se leen de variables de entorno con valores por defecto para local
(`DB_URL`, `DB_USER`, `DB_PASSWORD`). Para apuntar a una base cloud (AWS RDS / Azure
Database for PostgreSQL) se cambian solo esas variables; el código no cambia.

## Estado

- [x] Esqueleto: microservicios que responden JSON + frontend que los consume vía proxy.
- [x] Varios microservicios (pedidos + productos) con enrutamiento por path.
- [x] Persistencia en base de datos (PostgreSQL + JPA: entidades, repositorios, seed).
- [x] Frontend con dos vistas (pedidos y productos), cada una desde su microservicio.
- [ ] Tenant de Azure AD + registro de la aplicación (acción en el portal de Azure).
- [ ] Login con MSAL en Angular (OIDC Authorization Code + PKCE).
- [ ] Validación de JWT en el backend (issuer, audience, firma, expiración).
- [ ] Despliegue: EC2 + API Gateway (rutas, CORS, validación JWT).
