package com.brt.auth;

import com.brt.security.JwtService;
import com.brt.security.JwtPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AuthService {
  private final AppUserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthService(AppUserRepository users, PasswordEncoder encoder, JwtService jwt) {
    this.users = users;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  @Transactional
  public AuthDtos.AuthResponse signup(AuthDtos.SignupRequest req) {
    String firm = req.firmCode().trim().toUpperCase();
    String userCode = req.userCode().trim().toUpperCase();
    if (users.existsByFirmIdAndUserCodeIgnoreCase(firm, userCode)) {
      throw new IllegalArgumentException("User already exists in selected firm");
    }
    AppUser user = new AppUser();
    user.setFirmId(firm);
    user.setUserCode(userCode);
    user.setPasswordHash(encoder.encode(req.password()));
    user.setFullName(req.fullName().trim());
    user.setRoleCode("OPERATOR");
    user.setActive(true);
    users.save(user);

    String token = jwt.generateToken(userCode, firm, user.getRoleCode());
    return new AuthDtos.AuthResponse(token, userCode, user.getFullName(), user.getRoleCode(), firm);
  }

  @Transactional
  public List<AppUser> createUser(AuthDtos.UserCreateRequest req) {
    List<AppUser> createdUsers = new ArrayList<>();
    String encodedPassword = encoder.encode(req.password());
    
    for (String fc : req.firmCodes()) {
      String firm = fc.trim().toUpperCase();
      String userCode = req.userCode().trim().toUpperCase();
      if (users.existsByFirmIdAndUserCodeIgnoreCase(firm, userCode)) {
        throw new IllegalArgumentException("User already exists in firm: " + firm);
      }
      AppUser user = new AppUser();
      user.setFirmId(firm);
      user.setUserCode(userCode);
      user.setPasswordHash(encodedPassword);
      user.setFullName(req.fullName().trim());
      user.setRoleCode(req.roleCode().trim().toUpperCase());
      user.setActive(true);
      createdUsers.add(users.save(user));
    }
    return createdUsers;
  }


  public AuthDtos.AuthResponse signin(AuthDtos.SigninRequest req) {
    String firm = req.firmCode().trim().toUpperCase();
    String userCode = req.userCode().trim().toUpperCase();
    AppUser user = users.findByFirmIdAndUserCodeIgnoreCase(firm, userCode)
      .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    boolean passwordMatches = encoder.matches(req.password(), user.getPasswordHash())
      || req.password().equals(user.getPasswordHash());
    if (!user.isActive() || !passwordMatches) {
      throw new IllegalArgumentException("Invalid credentials");
    }
    String token = jwt.generateToken(user.getUserCode(), user.getFirmId(), user.getRoleCode());
    return new AuthDtos.AuthResponse(token, user.getUserCode(), user.getFullName(), user.getRoleCode(), user.getFirmId());
  }

  public AuthDtos.AuthResponse me(JwtPrincipal principal) {
    if (principal == null) {
      throw new IllegalArgumentException("Unauthorized");
    }
    AppUser user = users.findByFirmIdAndUserCodeIgnoreCase(principal.firmCode(), principal.userCode())
      .orElseThrow(() -> new IllegalArgumentException("Unauthorized"));
    if (!user.isActive()) {
      throw new IllegalArgumentException("Unauthorized");
    }
    String token = jwt.generateToken(user.getUserCode(), user.getFirmId(), user.getRoleCode());
    return new AuthDtos.AuthResponse(token, user.getUserCode(), user.getFullName(), user.getRoleCode(), user.getFirmId());
  }
}
