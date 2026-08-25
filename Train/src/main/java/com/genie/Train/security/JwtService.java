package com.genie.Train.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    /*
     * Keep this secret outside source code in a real production system.
     * For this local portfolio project, we keep it here for now.
     */
    private static final String SECRET =
            "RailBharatSecretKey2026SecureJwtTokenKeyForDemoProject";

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24;

    private final SecretKey key =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes(StandardCharsets.UTF_8)
            );

    public String generateToken(
            Long userId,
            String email
    ) {

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + EXPIRATION_TIME
                );

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(key)
                .compact();
    }

    public String extractEmail(
            String token
    ) {

        return extractAllClaims(token)
                .getSubject();
    }

    public Long extractUserId(
            String token
    ) {

        Number userId =
                extractAllClaims(token)
                        .get("userId", Number.class);

        return userId == null
                ? null
                : userId.longValue();
    }

    public boolean isTokenValid(
            String token
    ) {

        try {

            Claims claims =
                    extractAllClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    private Claims extractAllClaims(
            String token
    ) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}