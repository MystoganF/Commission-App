package com.artistportfolio.repository;

import com.artistportfolio.entity.ArtistServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArtistServiceRepository extends JpaRepository<ArtistServiceEntity, Long> {
    List<ArtistServiceEntity> findByArtistId(Long artistId);
    long countByArtistId(Long artistId);
}
