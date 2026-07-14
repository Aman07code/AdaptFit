package com.adaptfit.service;

import com.adaptfit.dto.AuthResponse;
import com.adaptfit.dto.LoginRequest;
import com.adaptfit.dto.RegisterRequest;
import com.adaptfit.dto.UserResponse;
import com.adaptfit.entity.User;
import com.adaptfit.exception.BadRequestException;
import com.adaptfit.exception.UnauthorizedException;
import com.adaptfit.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        // Generate a random 6-digit verification code
        String otp = String.format("%06d", new Random().nextInt(1000000));

        User user = new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password())
        );
        user.setVerified(false);
        user.setVerificationCode(otp);

        User savedUser = userRepository.save(user);

        sendVerificationEmail(email, otp);

        return new AuthResponse(null, null, UserResponse.from(savedUser), true);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isVerified()) {
            throw new BadRequestException("Account is not verified. Please verify your email.");
        }

        return new AuthResponse(jwtService.generateToken(user), "Bearer", UserResponse.from(user), false);
    }

    @Transactional
    public AuthResponse verify(String email, String code) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.isVerified()) {
            return new AuthResponse(jwtService.generateToken(user), "Bearer", UserResponse.from(user), false);
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code.trim())) {
            throw new BadRequestException("Invalid verification code");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        User savedUser = userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(savedUser), "Bearer", UserResponse.from(savedUser), false);
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.isVerified()) {
            throw new BadRequestException("Account is already verified");
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setVerificationCode(otp);
        userRepository.save(user);

        sendVerificationEmail(email, otp);
    }

    @Transactional
    public AuthResponse authenticateGoogle(String credential) {
        if (credential == null || credential.trim().isEmpty()) {
            throw new BadRequestException("Google credential token is required");
        }

        try {
            // Lightweight offline JWT payload decoder using Base64 & Jackson ObjectMapper
            String[] parts = credential.split("\\.");
            if (parts.length < 2) {
                throw new BadRequestException("Invalid Google credential format");
            }

            byte[] decodedBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(decodedBytes, StandardCharsets.UTF_8);

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> payload = mapper.readValue(payloadJson, new TypeReference<>() {});

            String email = (String) payload.get("email");
            String name = (String) payload.get("name");

            if (email == null || email.trim().isEmpty()) {
                throw new BadRequestException("Invalid token: email claim is missing");
            }

            String normalizedEmail = normalizeEmail(email);
            User user = userRepository.findByEmail(normalizedEmail).orElse(null);

            if (user != null) {
                if (!user.isVerified()) {
                    user.setVerified(true);
                    user.setVerificationCode(null);
                    user = userRepository.save(user);
                }
            } else {
                // Auto-create a brand new verified account with a random secure password
                String randomPassword = UUID.randomUUID().toString();
                String displayName = (name != null && !name.trim().isEmpty()) ? name.trim() : email.split("@")[0];

                user = new User(
                        displayName,
                        normalizedEmail,
                        passwordEncoder.encode(randomPassword)
                );
                user.setVerified(true);
                user.setVerificationCode(null);
                user = userRepository.save(user);

                System.out.println("[GOOGLE SOCIAL SIGN-IN] Registered new verified user: " + normalizedEmail);
            }

            String token = jwtService.generateToken(user);
            return new AuthResponse(token, "Bearer", UserResponse.from(user), false);

        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Failed to decode Google identity token: " + ex.getMessage());
        }
    }

    private void sendVerificationEmail(String email, String otp) {
        if (mailSender == null) {
            System.out.println("==================================================");
            System.out.println("[EMAIL VERIFICATION OTP] Code for " + email + " is: " + otp);
            System.out.println("==================================================");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("AdaptFit <no-reply@adaptfit.com>");
            message.setTo(email);
            message.setSubject("Verify Your AdaptFit Account");
            message.setText("Welcome to AdaptFit!\n\nYour email verification code is: " + otp + "\n\nUse this code to verify your identity and finalize your registration.");
            mailSender.send(message);
            System.out.println("[EMAIL SENT] Verification code successfully sent to " + email);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Failed to send verification email to " + email + ": " + e.getMessage());
            System.out.println("[EMAIL FALLBACK] OTP Code is: " + otp);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
