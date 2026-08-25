package com.genie.Train.payment;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {
        "http://localhost:63342",
        "http://127.0.0.1:63342",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody PaymentRequest request
    ) {

        try {

            PaymentResponse response =
                    paymentService.createPayment(request);

            return ResponseEntity.ok(response);

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


    // ==================================================
    // VERIFY RAZORPAY PAYMENT
    // ==================================================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationRequest request
    ) {

        try {

            boolean verified =
                    paymentService.verifyPayment(
                            request
                    );

            if (!verified) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ErrorResponse(
                                        "Payment verification failed."
                                )
                        );
            }

            return ResponseEntity.ok(
                    new VerificationResponse(
                            true,
                            "Payment verified successfully."
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


    // ==================================================
    // ERROR RESPONSE
    // ==================================================

    private static class ErrorResponse {

        private final String message;

        public ErrorResponse(
                String message
        ) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }


    // ==================================================
    // PAYMENT VERIFICATION RESPONSE
    // ==================================================

    private static class VerificationResponse {

        private final boolean verified;
        private final String message;

        public VerificationResponse(
                boolean verified,
                String message
        ) {
            this.verified = verified;
            this.message = message;
        }

        public boolean isVerified() {
            return verified;
        }

        public String getMessage() {
            return message;
        }
    }
}