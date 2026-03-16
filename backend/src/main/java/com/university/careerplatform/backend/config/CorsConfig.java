/**
 * Global CORS configuration for frontend-backend communication.
 *
 * Allows requests from frontend development server (localhost:5173)
 * to backend API (localhost:8080).
 *
 * Required because frontend and backend run on different ports,
 * which browsers treat as different origins.
 *
 * Enabled methods:
 * GET, POST, PUT, DELETE, OPTIONS
 *
 * Credentials support is enabled for future token/session compatibility.
 */

package com.university.careerplatform.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
