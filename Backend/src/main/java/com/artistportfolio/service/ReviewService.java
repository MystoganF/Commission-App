package com.artistportfolio.service;

import com.artistportfolio.dto.ReviewDto;
import com.artistportfolio.repository.ReviewRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;

    @Transactional
    public List<ReviewDto> getReviewsByService(Long serviceId) {
        return reviewRepo.findByServiceId(serviceId).stream()
                .map(rev -> new ReviewDto(
                        rev.getRating(),
                        rev.getComment(),
                        rev.getClient() != null ? rev.getClient().getUsername() : "Anonymous"
                ))
                .collect(Collectors.toList());
    }
}