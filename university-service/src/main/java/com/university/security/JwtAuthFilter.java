package com.university.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Component // to declare it as spring bean
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Check if Authorization header exists in the incoming request & starts with Bearer
            String headerValue = request.getHeader("Authorization");
            if (headerValue != null && headerValue.startsWith("Bearer ")) {
                // => 2. Extract JWT & validate it using JwtUtils & get claims
                String jwt = headerValue.substring(7);
                
                String username = jwtUtils.extractUsername(jwt);
                
                /*
                 * 3. Create Authentication object
                 */
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtUtils.isTokenValid(jwt, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        /*
                         * 5. Add authentication object under - Spring security context holder - so that
                         * next filters can get auth details directly
                         */
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } else {
                log.info("******NO JWT *********");
            }
            // in case of no exceptions -> continue to the next Filter
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            /* -> invalid jwt -> abort further request processing
             * clear sec ctx holder
             * send error resp (SC 401) to the client
             */
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("Invalid JWT - Authentication Failed!!!!!");
            return;
        }
    }
}