package com.genie.Train.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:63342",
        "http://127.0.0.1:63342",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        try {

            User user =
                    authService.register(request);

            AuthResponse response =
                    new AuthResponse(
                            user.getId(),
                            user.getFullName(),
                            user.getEmail(),
                            user.getPhone(),
                            user.getRole(),
                            null,
                            "Registration successful."
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    ex.getMessage()
                            )
                    );
        }
    }

    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            AuthResponse response =
                    authService.login(request);

            return ResponseEntity
                    .ok(response);

        } catch (RuntimeException ex) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new ErrorResponse(
                                    ex.getMessage()
                            )
                    );
        }
    }

    // --------------------------------------------------
    // FORGOT PASSWORD
    // --------------------------------------------------

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {

        try {

            String message =
                    authService.forgotPassword(
                            request.getEmail()
                    );

            return ResponseEntity
                    .ok(
                            new MessageResponse(
                                    message
                            )
                    );

        } catch (RuntimeException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    ex.getMessage()
                            )
                    );
        }
    }

    // --------------------------------------------------
    // RESET PASSWORD
    // --------------------------------------------------

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {

        try {

            String message =
                    authService.resetPassword(
                            request.getEmail(),
                            request.getNewPassword()
                    );

            return ResponseEntity
                    .ok(
                            new MessageResponse(
                                    message
                            )
                    );

        } catch (RuntimeException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    ex.getMessage()
                            )
                    );
        }
    }

    // --------------------------------------------------
    // ERROR RESPONSE
    // --------------------------------------------------

    private static class ErrorResponse {

        private final String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }

    // --------------------------------------------------
    // MESSAGE RESPONSE
    // --------------------------------------------------

    private static class MessageResponse {

        private final String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}