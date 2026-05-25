package com.adaptfit.controller;

import com.adaptfit.dto.AuthResponse;
import com.adaptfit.dto.LoginRequest;
import com.adaptfit.dto.RegisterRequest;
import com.adaptfit.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/verify")
    public AuthResponse verify(@Valid @RequestBody VerifyRequest request) {
        return authService.verify(request.email(), request.code());
    }

    @PostMapping("/resend-otp")
    @ResponseStatus(HttpStatus.OK)
    public void resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request.email());
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.authenticateGoogle(request.credential());
    }
}

record VerifyRequest(
        @NotBlank(message = "Email is required") String email,
        @NotBlank(message = "Verification code is required") String code
) {}

record ResendOtpRequest(
        @NotBlank(message = "Email is required") String email
) {}

record GoogleLoginRequest(
        @NotBlank(message = "Google credential token is required") String credential
) {}
