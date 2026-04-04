// src/main/java/com/artistportfolio/repository/ReviewRepository.java
package com.artistportfolio.repository;

import com.artistportfolio.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByArtistId(Long artistId);
    List<Review> findByServiceId(Long serviceId);
}