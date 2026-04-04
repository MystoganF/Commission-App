package com.artistportfolio.repository;
import com.artistportfolio.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByArtistIdOrderByEndYearDesc(Long artistId);
}