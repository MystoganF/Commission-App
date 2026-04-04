package com.artistportfolio.repository;

import com.artistportfolio.entity.Booking;
import com.artistportfolio.entity.PortfolioWork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

    public interface BookingRepository extends JpaRepository<Booking, Long> {
        List<Booking> findByServiceArtistIdOrderByCreatedAtDesc(Long artistId);
        long countByServiceArtistId(Long artistId);
        long countByServiceArtistIdAndStatus(Long artistId, Booking.BookingStatus status);

}
