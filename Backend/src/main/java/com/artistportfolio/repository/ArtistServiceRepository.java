package com.artistportfolio.repository;

import com.artistportfolio.entity.ArtistServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArtistServiceRepository extends JpaRepository<ArtistServiceEntity, Long> {
    // For Admin: Only show their active services
    List<ArtistServiceEntity> findByArtistIdAndActiveTrue(Long artistId);

    // For Public: Show all active services in marketplace
    List<ArtistServiceEntity> findByActiveTrue();

    // For Stats: Count only active services
    long countByArtistIdAndActiveTrue(Long artistId);

    List<ArtistServiceEntity> findByArtistId(Long artistId);
}