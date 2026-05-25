package com.adaptfit.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserResponse user,
        boolean requiresVerification
) {
    public AuthResponse(String token, String tokenType, UserResponse user) {
        this(token, tokenType, user, false);
    }
}
