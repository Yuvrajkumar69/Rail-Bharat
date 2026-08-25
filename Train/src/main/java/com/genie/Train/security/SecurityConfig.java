package com.genie.Train.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {
                })

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Authentication
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // Public train search
                        .requestMatchers(
                                "/api/search/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/trains/**"
                        ).permitAll()

                        // --------------------------------------------------
                        // BOOKING SECURITY
                        // --------------------------------------------------

                        // Create booking → login required
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/bookings"
                        ).authenticated()

                        // My Bookings → login required
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/bookings"
                        ).authenticated()

                        // Cancel booking → login required
                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/bookings/*/cancel"
                        ).authenticated()

                        // PNR lookup remains public
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/bookings/*"
                        ).permitAll()

                        // Contact
                        .requestMatchers(
                                "/api/contact/**"
                        ).permitAll()

                        // Everything else
                        .anyRequest().permitAll()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}