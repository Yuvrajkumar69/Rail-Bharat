package com.genie.Train.booking;

import com.genie.Train.entity.TrainSchedule;
import com.genie.Train.payment.PaymentVerificationRequest;
import com.genie.Train.repo.TrainScheduleRepository;
import com.genie.Train.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {
        "http://localhost:63342",
        "http://127.0.0.1:63342",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final TrainScheduleRepository trainScheduleRepository;

    public BookingController(
            BookingService bookingService,
            BookingRepository bookingRepository,
            TrainScheduleRepository trainScheduleRepository
    ) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.trainScheduleRepository = trainScheduleRepository;
    }

    // ==================================================
    // CREATE BOOKING AFTER VERIFIED PAYMENT
    // ==================================================

    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmBookingAfterPayment(
            @RequestBody PaidBookingRequest request
    ) {

        try {

            if (request == null
                    || request.getBooking() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ErrorResponse(
                                        "Booking details are required."
                                )
                        );
            }

            if (request.getPayment() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ErrorResponse(
                                        "Payment verification details are required."
                                )
                        );
            }

            BookingResponse response =
                    bookingService.createBookingAfterPayment(
                            request.getBooking(),
                            request.getPayment()
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


    // ==================================================
    // GET MY BOOKINGS
    // ==================================================

    @GetMapping
    public ResponseEntity<?> getMyBookings() {

        try {

            User currentUser =
                    getAuthenticatedUser();

            return ResponseEntity.ok(
                    bookingRepository
                            .findByUserOrderByBookingDateDesc(
                                    currentUser
                            )
            );

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


    // ==================================================
    // GET BOOKING BY PNR
    // ==================================================

    @GetMapping("/{pnr}")
    public ResponseEntity<?> getBookingByPnr(
            @PathVariable String pnr
    ) {

        if (pnr == null
                || pnr.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    "PNR is required."
                            )
                    );
        }

        return bookingRepository
                .findByPnr(pnr.trim())
                .<ResponseEntity<?>>map(booking -> {

                    TrainSchedule schedule =
                            trainScheduleRepository
                                    .findById(
                                            booking.getScheduleId()
                                    )
                                    .orElse(null);

                    BookingResponse response =
                            new BookingResponse(
                                    booking.getPnr(),
                                    booking.getScheduleId(),
                                    booking.getPassengerName(),
                                    booking.getPassengerCount(),
                                    booking.getSeatClass(),
                                    booking.getAmount(),
                                    booking.getPaymentStatus(),
                                    booking.getBookingStatus()
                            );

                    if (schedule != null) {

                        if (schedule.getTrain() != null) {

                            response.setTrainName(
                                    schedule.getTrain()
                                            .getTrainName()
                            );

                            response.setTrainNumber(
                                    String.valueOf(
                                            schedule.getTrain()
                                                    .getTrainNumber()
                                    )
                            );
                        }

                        if (schedule.getSource() != null) {

                            response.setSourceCode(
                                    schedule.getSource()
                                            .getStationCode()
                            );
                        }

                        if (schedule.getDestination() != null) {

                            response.setDestinationCode(
                                    schedule.getDestination()
                                            .getStationCode()
                            );
                        }

                        if (schedule.getDepartureTime() != null) {

                            response.setDepartureTime(
                                    schedule.getDepartureTime()
                                            .toString()
                            );
                        }

                        if (schedule.getArrivalTime() != null) {

                            response.setArrivalTime(
                                    schedule.getArrivalTime()
                                            .toString()
                            );
                        }
                    }

                    return ResponseEntity.ok(response);

                })
                .orElseGet(() ->
                        ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(
                                        new ErrorResponse(
                                                "PNR not found. Please check the number."
                                        )
                                )
                );
    }


    // ==================================================
    // CANCEL BOOKING
    // ==================================================

    @PutMapping("/{pnr}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable String pnr
    ) {

        if (pnr == null
                || pnr.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    "PNR is required."
                            )
                    );
        }

        try {

            User currentUser =
                    getAuthenticatedUser();

            Booking booking =
                    bookingRepository
                            .findByPnr(
                                    pnr.trim()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "PNR not found. Please check the number."
                                    )
                            );

            // --------------------------------------------------
            // SECURITY CHECK
            // --------------------------------------------------

            if (booking.getUser() == null
                    || !booking.getUser()
                    .getId()
                    .equals(currentUser.getId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ErrorResponse(
                                        "You are not authorized to cancel this booking."
                                )
                        );
            }

            BookingResponse response =
                    bookingService.cancelBooking(
                            pnr
                    );

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
    // AUTHENTICATED USER
    // ==================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Please login to access your bookings."
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof User)) {

            throw new RuntimeException(
                    "Unable to identify the logged-in user."
            );
        }

        return (User) principal;
    }


    // ==================================================
    // PAID BOOKING REQUEST
    // ==================================================

    public static class PaidBookingRequest {

        private BookingRequest booking;
        private PaymentVerificationRequest payment;

        public PaidBookingRequest() {
        }

        public BookingRequest getBooking() {
            return booking;
        }

        public void setBooking(
                BookingRequest booking
        ) {
            this.booking = booking;
        }

        public PaymentVerificationRequest getPayment() {
            return payment;
        }

        public void setPayment(
                PaymentVerificationRequest payment
        ) {
            this.payment = payment;
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
}