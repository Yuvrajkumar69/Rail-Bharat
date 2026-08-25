package com.genie.Train.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public EmailService(
            JavaMailSender mailSender
    ) {
        this.mailSender = mailSender;
    }

    // ==================================================
    // BOOKING CONFIRMATION EMAIL
    // ==================================================

    public void sendBookingConfirmation(
            String recipientEmail,
            String passengerName,
            String pnr,
            String trainName,
            String trainNumber,
            String source,
            String destination,
            String seatClass,
            int passengerCount,
            double amount
    ) {

        if (recipientEmail == null
                || recipientEmail.isBlank()) {

            throw new RuntimeException(
                    "Passenger email address is required."
            );
        }

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);

        message.setTo(
                recipientEmail
        );

        message.setSubject(
                "Rail Bharat - Booking Confirmed | PNR "
                        + pnr
        );

        message.setText(
                buildBookingEmail(
                        passengerName,
                        pnr,
                        trainName,
                        trainNumber,
                        source,
                        destination,
                        seatClass,
                        passengerCount,
                        amount
                )
        );

        mailSender.send(message);
    }


    // ==================================================
    // EMAIL CONTENT
    // ==================================================

    private String buildBookingEmail(
            String passengerName,
            String pnr,
            String trainName,
            String trainNumber,
            String source,
            String destination,
            String seatClass,
            int passengerCount,
            double amount
    ) {

        return """
                Dear %s,

                Your Rail Bharat train booking has been confirmed successfully.

                ----------------------------------------
                BOOKING DETAILS
                ----------------------------------------

                PNR              : %s
                Train            : %s
                Train Number     : %s
                From             : %s
                To               : %s
                Class            : %s
                Passengers       : %d
                Amount Paid      : ₹%.2f
                Payment Status   : SUCCESS
                Booking Status   : CONFIRMED

                ----------------------------------------

                Your payment has been verified successfully
                and your railway reservation is confirmed.

                Please keep your PNR safe for future reference.

                Thank you for choosing Rail Bharat.

                Have a safe and pleasant journey! 🚆

                Regards,
                Rail Bharat Team
                """.formatted(
                passengerName,
                pnr,
                trainName,
                trainNumber,
                source,
                destination,
                seatClass,
                passengerCount,
                amount
        );
    }
}