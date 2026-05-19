package com.brt.auth;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.brt.security.JwtPrincipal;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/signup")
  public AuthDtos.AuthResponse signup(@Valid @RequestBody AuthDtos.SignupRequest req) {
    return authService.signup(req);
  }

  @PostMapping("/signin")
  public AuthDtos.AuthResponse signin(@Valid @RequestBody AuthDtos.SigninRequest req) {
    return authService.signin(req);
  }

  @GetMapping("/me")
  public AuthDtos.AuthResponse me(@AuthenticationPrincipal JwtPrincipal principal) {
    return authService.me(principal);
  }
}
