package com.artistportfolio.repository;

import com.artistportfolio.entity.Booking;
import com.artistportfolio.entity.PortfolioWork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioWorkRepository extends JpaRepository<PortfolioWork, Long> {
    List<PortfolioWork> findByArtistIdOrderByCreatedAtDesc(Long artistId);
    long countByArtistId(Long artistId);


}
