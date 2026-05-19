package com.brt.security;

public record JwtPrincipal(String userCode, String firmCode, String roleCode) {}
