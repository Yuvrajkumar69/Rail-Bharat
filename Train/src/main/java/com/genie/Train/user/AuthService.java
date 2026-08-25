package com.genie.Train.user;

import com.genie.Train.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------

    public User register(RegisterRequest request) {

        validateRegistration(request);

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        String phone =
                request.getPhone()
                        .trim();

        if (userRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "An account with this email already exists."
            );
        }

        if (userRepository.existsByPhone(phone)) {

            throw new RuntimeException(
                    "An account with this phone number already exists."
            );
        }

        User user = new User();

        user.setFullName(
                request.getFullName()
                        .trim()
        );

        user.setEmail(email);

        user.setPhone(phone);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole("USER");

        return userRepository.save(user);
    }

    // --------------------------------------------------
    // LOGIN + JWT
    // --------------------------------------------------

    public AuthResponse login(
            LoginRequest request
    ) {

        if (request == null) {

            throw new RuntimeException(
                    "Login request cannot be empty."
            );
        }

        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail()
                        .trim()
                        .toLowerCase();

        String password =
                request.getPassword() == null
                        ? ""
                        : request.getPassword();

        if (email.isEmpty()) {

            throw new RuntimeException(
                    "Email is required."
            );
        }

        if (password.isEmpty()) {

            throw new RuntimeException(
                    "Password is required."
            );
        }

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password."
                                )
                        );

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Invalid email or password."
            );
        }

        String token =
                jwtService.generateToken(
                        user.getId(),
                        user.getEmail()
                );

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                token,
                "Login successful."
        );
    }

    // --------------------------------------------------
    // FORGOT PASSWORD
    // --------------------------------------------------

    public String forgotPassword(
            String email
    ) {

        if (email == null
                || email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No account found with this email address."
                                )
                        );

        /*
         * Demo project behaviour:
         * The account is verified by email existence.
         * Actual email delivery will be added separately.
         */
        return "Account found. You can now reset your password.";
    }

    // --------------------------------------------------
    // RESET PASSWORD
    // --------------------------------------------------

    public String resetPassword(
            String email,
            String newPassword
    ) {

        if (email == null
                || email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required."
            );
        }

        if (newPassword == null
                || newPassword.isEmpty()) {

            throw new RuntimeException(
                    "New password is required."
            );
        }

        if (newPassword.length() < 8) {

            throw new RuntimeException(
                    "Password must contain at least 8 characters."
            );
        }

        if (newPassword.length() > 100) {

            throw new RuntimeException(
                    "Password cannot exceed 100 characters."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No account found with this email address."
                                )
                        );

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        userRepository.save(user);

        return "Password reset successful. Please login with your new password.";
    }

    // --------------------------------------------------
    // REGISTRATION VALIDATION
    // --------------------------------------------------

    private void validateRegistration(
            RegisterRequest request
    ) {

        if (request == null) {

            throw new RuntimeException(
                    "Registration request cannot be empty."
            );
        }

        String name =
                request.getFullName() == null
                        ? ""
                        : request.getFullName()
                        .trim();

        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail()
                        .trim();

        String phone =
                request.getPhone() == null
                        ? ""
                        : request.getPhone()
                        .trim();

        String password =
                request.getPassword() == null
                        ? ""
                        : request.getPassword();

        if (name.isEmpty()) {

            throw new RuntimeException(
                    "Full name is required."
            );
        }

        if (name.length() > 100) {

            throw new RuntimeException(
                    "Full name cannot exceed 100 characters."
            );
        }

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
        )) {

            throw new RuntimeException(
                    "Please enter a valid email address."
            );
        }

        if (!phone.matches(
                "[6-9]\\d{9}"
        )) {

            throw new RuntimeException(
                    "Please enter a valid 10-digit Indian mobile number."
            );
        }

        if (password.length() < 8) {

            throw new RuntimeException(
                    "Password must contain at least 8 characters."
            );
        }

        if (password.length() > 100) {

            throw new RuntimeException(
                    "Password cannot exceed 100 characters."
            );
        }
    }
}