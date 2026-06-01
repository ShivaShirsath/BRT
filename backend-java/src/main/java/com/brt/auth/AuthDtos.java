package com.brt.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class AuthDtos {
  public record SignupRequest(
    @NotBlank(message = "Firm is required") String firmCode,
    @NotBlank(message = "User code is required") String userCode,
    @NotBlank(message = "Password is required") String password,
    @NotBlank(message = "Full name is required") String fullName
  ) {}

  public record SigninRequest(
    @NotBlank(message = "User code is required") String userCode,
    @NotBlank(message = "Password is required") String password
  ) {}

  public record SelectFirmRequest(
    @NotBlank(message = "Firm code is required") String firmCode
  ) {}


  public record UserCreateRequest(
    @NotEmpty(message = "At least one firm is required") List<String> firmCodes,
    @NotBlank(message = "User code is required") String userCode,
    @NotBlank(message = "Password is required") String password,
    @NotBlank(message = "Full name is required") String fullName,
    @NotBlank(message = "Role is required") String roleCode
  ) {}


  public record AuthResponse(String token, String userCode, String fullName, String roleCode, String firmCode) {}

}
