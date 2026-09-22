package cl.duoc.pedidos360.pedidos.security;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;

/**
 * El microservicio actúa como Resource Server OAuth 2.0: cada petición debe traer
 * "Authorization: Bearer &lt;JWT&gt;" emitido por Azure AD. Se valida:
 *  - firma      → con las llaves públicas (JWKS) del tenant
 *  - vigencia   → exp / nbf
 *  - issuer     → que lo emitió NUESTRO tenant
 *  - audience   → que el token es para ESTA API y no para otra aplicación
 *  - rol        → claim "roles" (Admin / Cliente) para autorizar
 *
 * Respuestas: 401 si el token falta o es inválido, 403 si es válido pero sin el rol.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.security.issuer}")
    private String issuer;

    @Value("${app.security.jwk-set-uri}")
    private String jwkSetUri;

    @Value("${app.security.audience}")
    private String audience;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        BearerTokenAuthenticationEntryPoint entryPoint401 = new BearerTokenAuthenticationEntryPoint();
        BearerTokenAccessDeniedHandler handler403 = new BearerTokenAccessDeniedHandler();

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Lectura: cualquier usuario con rol asignado en la aplicación.
                .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("Admin", "Cliente")
                // Escritura (POST/PUT/DELETE): solo administradores.
                .requestMatchers("/api/**").hasRole("Admin")
                .anyRequest().denyAll())
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt.jwtAuthenticationConverter(convertidorDeRoles()))
                .authenticationEntryPoint((req, res, ex) -> {
                    entryPoint401.commence(req, res, ex); // 401 + header WWW-Authenticate
                    escribirJson(res, 401, "unauthorized", "Token ausente, inválido o expirado");
                }))
            .exceptionHandling(e -> e.accessDeniedHandler((req, res, ex) -> {
                handler403.handle(req, res, ex); // 403 + header WWW-Authenticate
                escribirJson(res, 403, "forbidden", "El token es válido pero no tiene el rol requerido");
            }));

        return http.build();
    }

    /** Decodifica y valida el JWT: firma (JWKS) + vigencia + issuer + audience. */
    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        // Incluye validación de exp/nbf (vigencia) y del issuer.
        OAuth2TokenValidator<Jwt> vigenciaEIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        // Spring NO valida audience por defecto: sin esto, un token de otra app del mismo
        // tenant sería aceptado. Se acepta el clientId y su forma api://clientId.
        List<String> audienciasValidas = List.of(audience, "api://" + audience);
        OAuth2TokenValidator<Jwt> validadorAudience = jwt ->
            jwt.getAudience().stream().anyMatch(audienciasValidas::contains)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "El token no está dirigido a esta API (audience)", null));

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(vigenciaEIssuer, validadorAudience));
        return decoder;
    }

    /** Convierte el claim "roles" del token en autoridades ROLE_Admin / ROLE_Cliente. */
    private JwtAuthenticationConverter convertidorDeRoles() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return converter;
    }

    private static void escribirJson(HttpServletResponse res, int status, String error, String mensaje)
            throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write(
            "{\"status\":" + status + ",\"error\":\"" + error + "\",\"mensaje\":\"" + mensaje + "\"}");
    }
}
