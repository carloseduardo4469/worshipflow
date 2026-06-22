package br.com.worshipflow.config;

import br.com.worshipflow.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private final AuthService authService;

    public CorsConfig(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toArray(String[]::new);

        registry.addMapping("/api/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
                    @Override
                    public boolean preHandle(HttpServletRequest request,
                                             HttpServletResponse response,
                                             Object handler) {
                        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
                            return true;
                        }

                        authService.getAuthenticatedUser(request);
                        return true;
                    }
                })
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/cadastro",
                        "/api/auth/login",
                        "/api/auth/esqueci-senha",
                        "/api/auth/redefinir-senha"
                );
    }
}
