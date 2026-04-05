package com.artistportfolio.repository;

import com.artistportfolio.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ── ADD THIS LINE ──
    List<Review> findByServiceId(Long serviceId);

    // This allows your findByArtistId search too
    List<Review> findByArtistId(Long artistId);
    Optional<Review> findByBookingId(Long bookingId);
    // Check if client already rated a booking
    boolean existsByClientIdAndBookingId(Long clientId, Long bookingId);
}