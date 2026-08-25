package com.genie.Train.payment;

import com.genie.Train.entity.TrainSchedule;
import com.genie.Train.repo.TrainScheduleRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class PaymentService {

    private final TrainScheduleRepository trainScheduleRepository;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    public PaymentService(
            TrainScheduleRepository trainScheduleRepository
    ) {
        this.trainScheduleRepository =
                trainScheduleRepository;
    }

    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

    public PaymentResponse createPayment(
            PaymentRequest request
    ) {

        validateRequest(request);

        TrainSchedule schedule =
                trainScheduleRepository
                        .findById(request.getScheduleId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Train schedule not found."
                                )
                        );

        int availableSeats =
                schedule.getAvailableSeats() == null
                        ? 0
                        : schedule.getAvailableSeats();

        int passengerCount =
                request.getPassengerCount();

        if (availableSeats < passengerCount) {

            throw new RuntimeException(
                    "Only " +
                            availableSeats +
                            " seats are available."
            );
        }

        double baseFare =
                schedule.getFare() == null
                        ? 0.0
                        : schedule.getFare();

        double multiplier =
                getClassMultiplier(
                        request.getSeatClass()
                );

        double amount =
                Math.round(
                        baseFare
                                * multiplier
                                * passengerCount
                                * 100.0
                ) / 100.0;

        if (amount <= 0) {

            throw new RuntimeException(
                    "Invalid payment amount."
            );
        }

        if (razorpayKeyId == null
                || razorpayKeyId.isBlank()
                || razorpayKeySecret == null
                || razorpayKeySecret.isBlank()) {

            throw new RuntimeException(
                    "Razorpay API keys are not configured."
            );
        }

        try {

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );

            long amountInPaise =
                    Math.round(amount * 100);

            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    "INR"
            );

            orderRequest.put(
                    "receipt",
                    "RB_" +
                            System.currentTimeMillis()
            );

            orderRequest.put(
                    "payment_capture",
                    1
            );

            Order order =
                    razorpayClient.orders.create(
                            orderRequest
                    );

            return new PaymentResponse(
                    order.get("id"),
                    razorpayKeyId,
                    amount,
                    "INR",
                    "Payment order created successfully."
            );

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to create Razorpay payment order.",
                    ex
            );
        }
    }

    // ==================================================
    // VERIFY RAZORPAY PAYMENT
    // ==================================================

    public boolean verifyPayment(
            PaymentVerificationRequest request
    ) {

        if (request == null
                || request.getRazorpayOrderId() == null
                || request.getRazorpayOrderId().isBlank()
                || request.getRazorpayPaymentId() == null
                || request.getRazorpayPaymentId().isBlank()
                || request.getRazorpaySignature() == null
                || request.getRazorpaySignature().isBlank()) {

            throw new RuntimeException(
                    "Payment verification details are incomplete."
            );
        }

        if (razorpayKeySecret == null
                || razorpayKeySecret.isBlank()) {

            throw new RuntimeException(
                    "Razorpay secret key is not configured."
            );
        }

        try {

            String payload =
                    request.getRazorpayOrderId()
                            + "|"
                            + request.getRazorpayPaymentId();

            String generatedSignature =
                    hmacSha256(
                            payload,
                            razorpayKeySecret
                    );

            return generatedSignature.equals(
                    request.getRazorpaySignature()
            );

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to verify Razorpay payment.",
                    ex
            );
        }
    }

    // ==================================================
    // HMAC SHA256
    // ==================================================

    private String hmacSha256(
            String data,
            String secret
    ) throws Exception {

        Mac mac =
                Mac.getInstance("HmacSHA256");

        SecretKeySpec secretKey =
                new SecretKeySpec(
                        secret.getBytes(
                                StandardCharsets.UTF_8
                        ),
                        "HmacSHA256"
                );

        mac.init(secretKey);

        byte[] hash =
                mac.doFinal(
                        data.getBytes(
                                StandardCharsets.UTF_8
                        )
                );

        StringBuilder result =
                new StringBuilder();

        for (byte b : hash) {

            result.append(
                    String.format(
                            "%02x",
                            b
                    )
            );
        }

        return result.toString();
    }

    // ==================================================
    // VALIDATE PAYMENT REQUEST
    // ==================================================

    private void validateRequest(
            PaymentRequest request
    ) {

        if (request == null) {

            throw new RuntimeException(
                    "Payment request cannot be empty."
            );
        }

        if (request.getScheduleId() == null) {

            throw new RuntimeException(
                    "Schedule ID is required."
            );
        }

        if (request.getPassengerCount() == null
                || request.getPassengerCount() < 1
                || request.getPassengerCount() > 6) {

            throw new RuntimeException(
                    "Passenger count must be between 1 and 6."
            );
        }

        if (request.getSeatClass() == null
                || request.getSeatClass()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Seat class is required."
            );
        }
    }

    // ==================================================
    // CLASS FARE MULTIPLIER
    // ==================================================

    private double getClassMultiplier(
            String seatClass
    ) {

        String normalized =
                seatClass
                        .trim()
                        .toLowerCase();

        return switch (normalized) {

            case "sleeper" ->
                    1.00;

            case "ac 3 tier",
                 "ac3",
                 "3a" ->
                    1.40;

            case "ac 2 tier",
                 "ac2",
                 "2a" ->
                    1.80;

            case "ac first class",
                 "ac first",
                 "1a" ->
                    2.50;

            default ->
                    throw new RuntimeException(
                            "Invalid seat class."
                    );
        };
    }
}