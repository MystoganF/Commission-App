package com.artistportfolio.repository;

import com.artistportfolio.entity.Booking;
import com.artistportfolio.entity.PortfolioWork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Existing admin method:
    List<Booking> findByServiceArtistIdOrderByCreatedAtDesc(Long artistId);
    int countByServiceArtistId(Long artistId);
    int countByServiceArtistIdAndStatus(Long artistId, Booking.BookingStatus status);

    // ── NEW: Client method ──
    List<Booking> findByClientIdOrderByCreatedAtDesc(Long clientId);
}
