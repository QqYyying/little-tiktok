package com.tiktok.config;

import com.tiktok.common.auth.AuthInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.handler.MappedInterceptor;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final String localPublicBaseUrl;
    private final String localBaseDir;

    public WebMvcConfig(AuthInterceptor authInterceptor,
                        @Value("${app.storage.local.base-dir:uploads}") String localBaseDir,
                        @Value("${app.storage.local.public-base-url:/uploads}") String localPublicBaseUrl) {
        this.authInterceptor = authInterceptor;
        this.localBaseDir = localBaseDir;
        this.localPublicBaseUrl = normalizePublicBaseUrl(localPublicBaseUrl);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/api/v1/auth/register",
                        "/api/v1/auth/login",
                        "/actuator/health",
                        "/actuator/info",
                        "/actuator/prometheus",
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/swagger-ui/index.html",
                        "/doc.html",
                        "/webjars/**",
                        "/uploads/**"
                );
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path rootDir = Paths.get(localBaseDir).toAbsolutePath().normalize();
        String pattern = localPublicBaseUrl + "/**";
        String location = "file:" + rootDir.toString().replace("\\", "/") + "/";
        registry.addResourceHandler(pattern).addResourceLocations(location);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public MappedInterceptor actuatorMetricsAuthInterceptor() {
        return new MappedInterceptor(new String[]{"/actuator/metrics", "/actuator/metrics/**"}, authInterceptor);
    }

    private String normalizePublicBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "/uploads";
        }
        String normalized = baseUrl.startsWith("/") ? baseUrl : "/" + baseUrl;
        return normalized.endsWith("/") ? normalized.substring(0, normalized.length() - 1) : normalized;
    }
}
