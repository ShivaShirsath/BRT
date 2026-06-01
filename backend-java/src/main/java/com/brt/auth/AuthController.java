package com.brt.auth;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.brt.security.JwtPrincipal;
import java.util.List;

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

  @PostMapping("/users")
  public List<AppUser> createUser(@Valid @RequestBody AuthDtos.UserCreateRequest req) {
    return authService.createUser(req);
  }


  @PostMapping("/signin")
  public AuthDtos.AuthResponse signin(@Valid @RequestBody AuthDtos.SigninRequest req) {
    return authService.signin(req);
  }

  @PostMapping("/select-firm")
  public AuthDtos.AuthResponse selectFirm(@AuthenticationPrincipal JwtPrincipal principal, @Valid @RequestBody AuthDtos.SelectFirmRequest req) {
    return authService.selectFirm(principal, req);
  }


  @GetMapping("/me")
  public AuthDtos.AuthResponse me(@AuthenticationPrincipal JwtPrincipal principal) {
    return authService.me(principal);
  }
}
