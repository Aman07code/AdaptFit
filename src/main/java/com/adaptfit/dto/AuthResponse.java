package com.adaptfit.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserResponse user
) {
}
