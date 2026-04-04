package com.artistportfolio.service;

import com.artistportfolio.dto.BookingDtos.BookingRequest;
import com.artistportfolio.dto.BookingDtos.BookingResponse;
import com.artistportfolio.entity.ArtistServiceEntity;
import com.artistportfolio.entity.Booking;
import com.artistportfolio.entity.User;
import com.artistportfolio.repository.ArtistServiceRepository;
import com.artistportfolio.repository.BookingRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ClientService {

    private final BookingRepository bookingRepo;
    private final ArtistServiceRepository serviceRepo;

    @Transactional
    public BookingResponse createBooking(User client, BookingRequest req) {
        // FIXED: Using standard .getServiceId() instead of .serviceId
        ArtistServiceEntity service = serviceRepo.findById(req.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // 2. Create the new booking
        Booking booking = new Booking();
        booking.setClient(client);
        booking.setService(service);

        // FIXED: Using standard .getDetails() instead of .details
        // Ensure your Booking.java entity has 'private String details;' for this to work!
        booking.setDetails(req.getDetails());

        booking.setStatus(Booking.BookingStatus.PENDING);

        // 3. Save to database
        booking = bookingRepo.save(booking);

        return toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(User client) {
        return bookingRepo.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    // Helper to map entity to DTO
    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setClientName(b.getClient().getUsername());
        r.setClientEmail(b.getClient().getEmail());
        r.setServiceName(b.getService().getName());
        r.setPrice(b.getService().getPrice());
        r.setStatus(b.getStatus().name());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}