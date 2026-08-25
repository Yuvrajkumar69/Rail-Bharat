package com.genie.Train.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(
            CorsRegistry registry
    ) {

        registry
                .addMapping("/api/**")

                .allowedOrigins(
                        "http://localhost:63342",
                        "http://127.0.0.1:63342",
                        "http://localhost:5500",
                        "http://127.0.0.1:5500",
                        "https://rail-bharat.vercel.app"
                )

                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )

                .allowedHeaders("*")

                .allowCredentials(false);
    }
}
