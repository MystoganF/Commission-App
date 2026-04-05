package com.artistportfolio.service;

import com.artistportfolio.dto.BookingDtos.BookingResponse;
import com.artistportfolio.entity.ArtistServiceEntity;
import com.artistportfolio.entity.Booking;
import com.artistportfolio.entity.Payment;
import com.artistportfolio.entity.User;
import com.artistportfolio.repository.ArtistServiceRepository;
import com.artistportfolio.repository.BookingRepository;
import com.artistportfolio.repository.PaymentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ClientService {

    private final BookingRepository bookingRepo;
    private final ArtistServiceRepository serviceRepo;
    private final SupabaseService supabaseService;
    private final PaymentRepository paymentRepo;

    /**
     * Creates a new booking with optional project references and optional initial payment proof.
     */
    @Transactional
    public BookingResponse createBooking(User client, Long serviceId, String details,
                                         MultipartFile referenceFile,
                                         String paymentRef, MultipartFile paymentFile) throws Exception {

        ArtistServiceEntity service = serviceRepo.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Booking booking = new Booking();
        booking.setClient(client);
        booking.setService(service);
        booking.setDetails(details);
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setPaymentStatus(Booking.PaymentStatus.UNPAID); // Default state

        // 1. Handle Project Reference Image (The one for the instructions)
        if (referenceFile != null && !referenceFile.isEmpty()) {
            String url = supabaseService.uploadFile(referenceFile);
            booking.setReferenceImageUrl(url);
        }

        // Save booking first so we have an ID for the payment link
        Booking savedBooking = bookingRepo.save(booking);

        // 2. Handle Initial Payment Proof (The optional 30% downpayment)
        if (paymentFile != null && !paymentFile.isEmpty()) {
            Payment payment = new Payment();
            payment.setReferenceId(paymentRef);
            payment.setProofImageUrl(supabaseService.uploadFile(paymentFile));
            payment.setBooking(savedBooking);
            paymentRepo.save(payment);

            // If they sent a proof, mark as Partially Paid automatically
            savedBooking.setPaymentStatus(Booking.PaymentStatus.PARTIALLY_PAID);
            bookingRepo.save(savedBooking);
        }

        return toBookingResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(User client) {
        return bookingRepo.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Handles "Further Payments" submitted from the Booking Details page.
     */
    @Transactional
    public void addPaymentProof(Long bookingId, String referenceId, MultipartFile file) throws Exception {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = new Payment();
        payment.setReferenceId(referenceId);
        payment.setBooking(booking);

        if (file != null && !file.isEmpty()) {
            payment.setProofImageUrl(supabaseService.uploadFile(file));
        }

        paymentRepo.save(payment);
    }

    /**
     * Maps the Booking entity to a detailed DTO for the frontend.
     */
    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setClientName(b.getClient().getUsername());
        r.setClientEmail(b.getClient().getEmail());

        // --- Service Info ---
        r.setServiceName(b.getService().getName());
        r.setServiceId(b.getService().getId());
        r.setPrice(b.getService().getPrice());

        // Sidebar Sample Image
        if (b.getService().getSamples() != null && !b.getService().getSamples().isEmpty()) {
            r.setServiceSample(b.getService().getSamples().get(0));
        }

        // --- Artist Info & Payment Channels ---
        User artist = b.getService().getArtist();
        r.setArtistName(artist.getUsername());
        r.setArtistId(artist.getId());
        r.setGcashName(artist.getGcashName());
        r.setGcashNumber(artist.getGcashNumber());
        r.setPaymayaName(artist.getPaymayaName());
        r.setPaymayaNumber(artist.getPaymayaNumber());

        // --- Booking Status & Details ---
        r.setStatus(b.getStatus().name());
        r.setPaymentStatus(b.getPaymentStatus().name());
        r.setCreatedAt(b.getCreatedAt());
        r.setDetails(b.getDetails());
        r.setReferenceImageUrl(b.getReferenceImageUrl());

        // --- Payment Proof History ---
        if (b.getPayments() != null) {
            r.setPaymentHistory(b.getPayments().stream().map(p -> {
                BookingResponse.PaymentDto pdto = new BookingResponse.PaymentDto();
                pdto.setReferenceId(p.getReferenceId());
                pdto.setProofImageUrl(p.getProofImageUrl());
                pdto.setSubmittedAt(p.getSubmittedAt());
                return pdto;
            }).collect(Collectors.toList()));
        } else {
            r.setPaymentHistory(new ArrayList<>());
        }

        return r;
    }
}