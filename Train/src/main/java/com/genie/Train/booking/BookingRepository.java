package com.genie.Train.booking;

import com.genie.Train.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByPnr(String pnr);

    boolean existsByPnr(String pnr);

    List<Booking> findAllByOrderByBookingDateDesc();

    List<Booking> findByUserOrderByBookingDateDesc(User user);
}