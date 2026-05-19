package com.brt.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMinutes;

  public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMinutes = expirationMinutes;
  }

  public String generateToken(String username, String firmCode, String roleCode) {
    Instant now = Instant.now();
    return Jwts.builder()
      .subject(username)
      .claim("firmCode", firmCode)
      .claim("roleCode", roleCode)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
      .signWith(key)
      .compact();
  }

  public JwtPrincipal parse(String token) {
    var claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    return new JwtPrincipal(
      claims.getSubject(),
      String.valueOf(claims.get("firmCode")),
      String.valueOf(claims.get("roleCode"))
    );
  }
}
