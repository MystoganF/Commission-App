package com.artistportfolio.repository;

import com.artistportfolio.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Find all payment proofs for a specific booking to show history
    List<Payment> findByBookingIdOrderBySubmittedAtDesc(Long bookingId);
}