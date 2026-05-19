package com.brt.auth;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
  public record SignupRequest(
    @NotBlank(message = "Firm is required") String firmCode,
    @NotBlank(message = "User code is required") String userCode,
    @NotBlank(message = "Password is required") String password,
    @NotBlank(message = "Full name is required") String fullName
  ) {}

  public record SigninRequest(
    @NotBlank(message = "Firm is required") String firmCode,
    @NotBlank(message = "User code is required") String userCode,
    @NotBlank(message = "Password is required") String password
  ) {}

  public record AuthResponse(String token, String userCode, String fullName, String roleCode, String firmCode) {}
}
