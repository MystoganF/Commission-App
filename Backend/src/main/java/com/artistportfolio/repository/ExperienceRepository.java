package com.artistportfolio.repository;
import com.artistportfolio.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByArtistIdOrderByStartDateDesc(Long artistId);
}