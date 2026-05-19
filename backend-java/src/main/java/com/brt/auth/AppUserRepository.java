package com.brt.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  Optional<AppUser> findByFirmIdAndUserCodeIgnoreCase(String firmId, String userCode);
  boolean existsByFirmIdAndUserCodeIgnoreCase(String firmId, String userCode);
}
