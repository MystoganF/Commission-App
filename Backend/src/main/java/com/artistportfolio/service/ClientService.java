package com.artistportfolio.service;

import com.artistportfolio.dto.BookingDtos.BookingResponse;
import com.artistportfolio.dto.ProfileDtos.ProfileResponse;
import com.artistportfolio.dto.ProfileDtos.ProfileUpdateRequest;
import com.artistportfolio.entity.ArtistServiceEntity;
import com.artistportfolio.entity.Booking;
import com.artistportfolio.entity.Payment;
import com.artistportfolio.entity.User;
import com.artistportfolio.repository.ArtistServiceRepository;
import com.artistportfolio.repository.BookingRepository;
import com.artistportfolio.repository.PaymentRepository;
import com.artistportfolio.repository.UserRepository;
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
    private final UserRepository userRepo;

    // ── BOOKING MANAGEMENT ──

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
        booking.setPaymentStatus(Booking.PaymentStatus.UNPAID);

        if (referenceFile != null && !referenceFile.isEmpty()) {
            booking.setReferenceImageUrl(supabaseService.uploadFile(referenceFile));
        }

        Booking savedBooking = bookingRepo.save(booking);

        if (paymentFile != null && !paymentFile.isEmpty()) {
            Payment payment = new Payment();
            payment.setReferenceId(paymentRef);
            payment.setProofImageUrl(supabaseService.uploadFile(paymentFile));
            payment.setBooking(savedBooking);
            paymentRepo.save(payment);

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

    // ── PROFILE MANAGEMENT ──

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(User client) {
        ProfileResponse res = new ProfileResponse();
        res.username = client.getUsername();
        res.phoneNumber = client.getPhoneNumber();
        res.profilePictureUrl = client.getProfilePictureUrl();
        res.bio = client.getBio();
        res.facebook = client.getFacebook();
        res.instagram = client.getInstagram();
        res.twitter = client.getTwitter();
        res.gcashName = client.getGcashName();
        res.gcashNumber = client.getGcashNumber();
        res.paymayaName = client.getPaymayaName();
        res.paymayaNumber = client.getPaymayaNumber();
        return res;
    }

    @Transactional
    public ProfileResponse updateProfile(User client, ProfileUpdateRequest req) {
        client.setUsername(req.username);
        client.setPhoneNumber(req.phoneNumber);
        client.setBio(req.bio);
        client.setFacebook(req.facebook);
        client.setInstagram(req.instagram);
        client.setTwitter(req.twitter);
        client.setGcashName(req.gcashName);
        client.setGcashNumber(req.gcashNumber);
        client.setPaymayaName(req.paymayaName);
        client.setPaymayaNumber(req.paymayaNumber);

        return getProfile(userRepo.save(client));
    }

    @Transactional
    public ProfileResponse updateProfilePicture(User client, MultipartFile file) throws Exception {
        String imageUrl = supabaseService.uploadFile(file);
        client.setProfilePictureUrl(imageUrl);
        return getProfile(userRepo.save(client));
    }

    // ── MAPPING HELPERS ──

    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setClientName(b.getClient().getUsername());
        r.setClientEmail(b.getClient().getEmail());
        r.setServiceName(b.getService().getName());
        r.setServiceId(b.getService().getId());
        r.setPrice(b.getService().getPrice());

        if (b.getService().getSamples() != null && !b.getService().getSamples().isEmpty()) {
            r.setServiceSample(b.getService().getSamples().get(0));
        }

        User artist = b.getService().getArtist();
        r.setArtistName(artist.getUsername());
        r.setArtistId(artist.getId());
        r.setGcashName(artist.getGcashName());
        r.setGcashNumber(artist.getGcashNumber());
        r.setPaymayaName(artist.getPaymayaName());
        r.setPaymayaNumber(artist.getPaymayaNumber());

        r.setStatus(b.getStatus().name());
        r.setPaymentStatus(b.getPaymentStatus().name());
        r.setCreatedAt(b.getCreatedAt());
        r.setDetails(b.getDetails());
        r.setReferenceImageUrl(b.getReferenceImageUrl());

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