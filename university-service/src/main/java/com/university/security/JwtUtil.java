package com.university.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component // declares spring bean
@Slf4j
public class JwtUtil {

    /*
     * value based D.I - SC SC solves SpEL & extracts its value -> variable
     */
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}") // SpEl - Spring expression language
    private long expirationMs;

    private SecretKey secretKey;

    @PostConstruct
    public void myInit() {
        secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        log.info("****** in init ***** {} ", secretKey);
    }

    /*
     * Add a method to generate JWT
     */
    public String generateToken(String username, String role, Long userId) {
        Date createdAt = new Date();
        Date expAt = new Date(createdAt.getTime() + expirationMs);
        return Jwts.builder() //Creates JWT builder
                .subject(username) //setting subject - claim
                .issuedAt(createdAt) //iat - claim
                .expiration(expAt) //exp - claim
                .claims(java.util.Map.of("userId", userId, //for adding uid -> for extra validation
                        "role", role)) //to avois select query per request to get role
                .signWith(secretKey)
                .compact(); //Jackson serializes the signed JWT & rets to the caller
    }

    /*
     * Add a method
     * - to verify JWT
     * - return the payload (Claims - object)
     */
    public Claims verifyJwt(String jwt) {
        return Jwts.parser() //creates a parser to parse the token
                .verifyWith(secretKey) //using same secret key for verification
                .build() //builds JWT parser object
                .parseSignedClaims(jwt) //validating - jwt structure , exp time , tampering
                //=> valid JWT 
                .getPayload(); //extract the claims
    }

    public String extractUsername(String token) {
        return verifyJwt(token).getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        try {
            String extractedUsername = extractUsername(token);
            return extractedUsername.equals(username);
        } catch (Exception e) {
            return false;
        }
    }
}