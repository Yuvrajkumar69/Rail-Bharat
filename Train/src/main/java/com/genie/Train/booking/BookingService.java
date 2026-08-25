package com.genie.Train.booking;

import com.genie.Train.entity.TrainSchedule;
import com.genie.Train.payment.PaymentService;
import com.genie.Train.payment.PaymentVerificationRequest;
import com.genie.Train.repo.TrainScheduleRepository;
import com.genie.Train.service.EmailService;
import com.genie.Train.user.User;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final PaymentService paymentService;
    private final EmailService emailService;

    public BookingService(
            BookingRepository bookingRepository,
            TrainScheduleRepository trainScheduleRepository,
            PaymentService paymentService,
            EmailService emailService
    ) {
        this.bookingRepository = bookingRepository;
        this.trainScheduleRepository = trainScheduleRepository;
        this.paymentService = paymentService;
        this.emailService = emailService;
    }

    @Transactional
    public BookingResponse createBookingAfterPayment(
            BookingRequest request,
            PaymentVerificationRequest paymentRequest
    ) {

        validateRequest(request);

        boolean verified =
                paymentService.verifyPayment(paymentRequest);

        if (!verified) {
            throw new RuntimeException(
                    "Payment verification failed."
            );
        }

        User currentUser =
                getAuthenticatedUser();

        TrainSchedule schedule =
                trainScheduleRepository
                        .findById(request.getScheduleId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Train schedule not found."
                                )
                        );

        int passengerCount =
                request.getPassengerCount();

        int availableSeats =
                schedule.getAvailableSeats() == null
                        ? 0
                        : schedule.getAvailableSeats();

        if (availableSeats < passengerCount) {
            throw new RuntimeException(
                    "Only " + availableSeats + " seats are available."
            );
        }

        String seatClass =
                normalizeClass(request.getSeatClass());

        double baseFare =
                schedule.getFare() == null
                        ? 0.0
                        : schedule.getFare();

        double amount =
                Math.round(
                        baseFare
                                * getClassMultiplier(seatClass)
                                * passengerCount
                                * 100.0
                ) / 100.0;

        String pnr =
                generateUniquePnr();

        // Deduct seats only after verified payment
        schedule.setAvailableSeats(
                availableSeats - passengerCount
        );

        trainScheduleRepository.save(schedule);

        Booking booking =
                new Booking();

        booking.setPnr(pnr);
        booking.setScheduleId(schedule.getId());
        booking.setPassengerName(
                request.getPassengerName().trim()
        );
        booking.setPassengerPhone(
                request.getPassengerPhone().trim()
        );
        booking.setPassengerCount(passengerCount);
        booking.setSeatClass(seatClass);
        booking.setAmount(amount);
        booking.setUser(currentUser);
        booking.setPaymentStatus("SUCCESS");
        booking.setBookingStatus("CONFIRMED");
        booking.setBookingDate(LocalDateTime.now());

        bookingRepository.save(booking);

        // Send confirmation email
        try {

            String trainName =
                    schedule.getTrain() != null
                            ? schedule.getTrain().getTrainName()
                            : "Train";

            String trainNumber =
                    schedule.getTrain() != null
                            ? String.valueOf(
                            schedule.getTrain().getTrainNumber()
                    )
                            : "";

            String source =
                    schedule.getSource() != null
                            ? schedule.getSource().getStationCode()
                            : "";

            String destination =
                    schedule.getDestination() != null
                            ? schedule.getDestination().getStationCode()
                            : "";

            emailService.sendBookingConfirmation(
                    currentUser.getEmail(),
                    booking.getPassengerName(),
                    booking.getPnr(),
                    trainName,
                    trainNumber,
                    source,
                    destination,
                    booking.getSeatClass(),
                    booking.getPassengerCount(),
                    booking.getAmount()
            );

        } catch (Exception ex) {

            // Booking remains successful even if email fails
            System.err.println(
                    "Booking created but email could not be sent: "
                            + ex.getMessage()
            );
        }

        return new BookingResponse(
                booking.getPnr(),
                booking.getScheduleId(),
                booking.getPassengerName(),
                booking.getPassengerCount(),
                booking.getSeatClass(),
                booking.getAmount(),
                booking.getPaymentStatus(),
                booking.getBookingStatus()
        );
    }

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new RuntimeException(
                    "Please login before booking a train."
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

    private void validateRequest(
            BookingRequest request
    ) {

        if (request == null) {
            throw new RuntimeException(
                    "Booking request cannot be empty."
            );
        }

        if (request.getScheduleId() == null) {
            throw new RuntimeException(
                    "Schedule ID is required."
            );
        }

        if (request.getPassengerName() == null
                || request.getPassengerName().trim().isEmpty()) {
            throw new RuntimeException(
                    "Passenger name is required."
            );
        }

        String phone =
                request.getPassengerPhone() == null
                        ? ""
                        : request.getPassengerPhone().trim();

        if (!phone.matches("[6-9]\\d{9}")) {
            throw new RuntimeException(
                    "Please enter a valid 10-digit Indian mobile number."
            );
        }

        if (request.getPassengerCount() == null
                || request.getPassengerCount() < 1
                || request.getPassengerCount() > 6) {
            throw new RuntimeException(
                    "Passenger count must be between 1 and 6."
            );
        }

        normalizeClass(request.getSeatClass());
    }

    private String normalizeClass(
            String seatClass
    ) {

        String value =
                seatClass.trim().toLowerCase();

        return switch (value) {
            case "sleeper" -> "Sleeper";
            case "ac 3 tier", "ac3", "3a" -> "AC 3 Tier";
            case "ac 2 tier", "ac2", "2a" -> "AC 2 Tier";
            case "ac first class", "ac first", "1a" -> "AC First Class";
            default -> throw new RuntimeException(
                    "Invalid seat class."
            );
        };
    }

    private double getClassMultiplier(
            String seatClass
    ) {

        return switch (seatClass) {
            case "Sleeper" -> 1.00;
            case "AC 3 Tier" -> 1.40;
            case "AC 2 Tier" -> 1.80;
            case "AC First Class" -> 2.50;
            default -> throw new RuntimeException(
                    "Invalid seat class."
            );
        };
    }

    private String generateUniquePnr() {

        String pnr;

        do {
            pnr =
                    String.valueOf(
                            ThreadLocalRandom.current()
                                    .nextLong(
                                            1_000_000_000L,
                                            10_000_000_000L
                                    )
                    );
        } while (
                bookingRepository.existsByPnr(pnr)
        );

        return pnr;
    }
// ==================================================
// CANCEL BOOKING
// ==================================================

    @Transactional
    public BookingResponse cancelBooking(
            String pnr
    ) {

        if (pnr == null
                || pnr.trim().isEmpty()) {

            throw new RuntimeException(
                    "PNR is required."
            );
        }

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

        if ("CANCELLED".equalsIgnoreCase(
                booking.getBookingStatus()
        )) {

            throw new RuntimeException(
                    "This booking is already cancelled."
            );
        }

        if (!"CONFIRMED".equalsIgnoreCase(
                booking.getBookingStatus()
        )) {

            throw new RuntimeException(
                    "Only confirmed bookings can be cancelled."
            );
        }

        TrainSchedule schedule =
                trainScheduleRepository
                        .findById(
                                booking.getScheduleId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Train schedule not found."
                                )
                        );

        int currentAvailableSeats =
                schedule.getAvailableSeats() == null
                        ? 0
                        : schedule.getAvailableSeats();

        int passengerCount =
                booking.getPassengerCount();

        int totalSeats =
                schedule.getTotalSeats() == null
                        ? 72
                        : schedule.getTotalSeats();

        schedule.setAvailableSeats(
                Math.min(
                        currentAvailableSeats
                                + passengerCount,
                        totalSeats
                )
        );

        trainScheduleRepository.save(
                schedule
        );

        booking.setBookingStatus(
                "CANCELLED"
        );

        bookingRepository.save(
                booking
        );

        return new BookingResponse(
                booking.getPnr(),
                booking.getScheduleId(),
                booking.getPassengerName(),
                booking.getPassengerCount(),
                booking.getSeatClass(),
                booking.getAmount(),
                booking.getPaymentStatus(),
                booking.getBookingStatus()
        );
    }}