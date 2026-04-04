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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ClientService {

    private final BookingRepository bookingRepo;
    private final ArtistServiceRepository serviceRepo;
    private final SupabaseService supabaseService;

    public BookingResponse createBooking(User client, Long serviceId, String details, MultipartFile file) throws Exception {
        ArtistServiceEntity service = serviceRepo.findById(serviceId).orElseThrow();

        Booking booking = new Booking();
        booking.setClient(client);
        booking.setService(service);
        booking.setDetails(details);
        booking.setStatus(Booking.BookingStatus.PENDING);

        if (file != null && !file.isEmpty()) {
            String url = supabaseService.uploadFile(file);
            booking.setReferenceImageUrl(url);
        }

        return toBookingResponse(bookingRepo.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(User client) {
        return bookingRepo.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setClientName(b.getClient().getUsername());
        r.setClientEmail(b.getClient().getEmail());

        // Mapping Service Info
        r.setServiceName(b.getService().getName());
        r.setServiceId(b.getService().getId()); // ── MAP THIS ──
        r.setPrice(b.getService().getPrice());

        // Mapping Artist Info
        r.setArtistName(b.getService().getArtist().getUsername()); // ── MAP THIS ──
        r.setArtistId(b.getService().getArtist().getId());         // ── MAP THIS ──

        if (b.getService().getSamples() != null && !b.getService().getSamples().isEmpty()) {
            r.setServiceSample(b.getService().getSamples().get(0));
        }

        r.setStatus(b.getStatus().name());
        r.setCreatedAt(b.getCreatedAt());
        r.setDetails(b.getDetails());
        r.setReferenceImageUrl(b.getReferenceImageUrl());

        return r;
    }
}