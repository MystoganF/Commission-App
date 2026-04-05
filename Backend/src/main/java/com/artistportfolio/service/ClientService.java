package com.artistportfolio.service;

import com.artistportfolio.dto.BookingDtos.BookingResponse;
import com.artistportfolio.dto.ProfileDtos.ProfileResponse;
import com.artistportfolio.dto.ProfileDtos.ProfileUpdateRequest;
import com.artistportfolio.entity.*;
import com.artistportfolio.repository.*;
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
    private final ReviewRepository reviewRepo;
    private final NotificationRepository notificationRepo;

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

        Notification n = new Notification();
        n.setMessage("New commission request: " + service.getName() + " from " + client.getUsername());
        n.setLink("/admin/bookings/" + savedBooking.getId()); // Points directly to the admin booking detail page
        n.setRecipient(service.getArtist());
        notificationRepo.save(n);

        return toBookingResponse(savedBooking);
    }

    // Add this method to your ClientService.java
    @Transactional
    public BookingResponse addPayment(User client, Long bookingId, String refId, MultipartFile file) throws Exception {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Security Check: Only the owner can add payments
        if (!booking.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        // 1. Upload proof to Supabase
        String imageUrl = supabaseService.uploadFile(file);

        // 2. Create and Save the Payment Entity
        Payment payment = new Payment();
        payment.setReferenceId(refId);
        payment.setProofImageUrl(imageUrl);
        payment.setBooking(booking);
        paymentRepo.save(payment);

        // 3. Optional: Auto-update status to PARTIALLY_PAID if it was UNPAID
        if (booking.getPaymentStatus() == Booking.PaymentStatus.UNPAID) {
            booking.setPaymentStatus(Booking.PaymentStatus.PARTIALLY_PAID);
        }

        // 4. Return the updated booking details
        return toBookingResponse(bookingRepo.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(User client) {
        return bookingRepo.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingDetails(User client, Long id) {
        Booking booking = bookingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        return toBookingResponse(booking);
    }

    // ── UPDATED MAPPING HELPER ──
    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setServiceName(b.getService().getName());
        r.setServiceId(b.getService().getId());
        r.setPrice(b.getService().getPrice());
        r.setStatus(b.getStatus().name());
        r.setPaymentStatus(b.getPaymentStatus() != null ? b.getPaymentStatus().name() : "UNPAID");

        // 1. MAP SERVICE PICTURE
        if (b.getService().getSamples() != null && !b.getService().getSamples().isEmpty()) {
            r.setServiceSample(b.getService().getSamples().get(0));
        }

        // 2. MAP ARTIST INFO + PAYMENT CHANNELS
        User artist = b.getService().getArtist();
        r.setArtistName(artist.getUsername());
        r.setArtistId(artist.getId());
        r.setGcashName(artist.getGcashName());
        r.setGcashNumber(artist.getGcashNumber());
        r.setPaymayaName(artist.getPaymayaName());
        r.setPaymayaNumber(artist.getPaymayaNumber());

        // 3. MAP INSTRUCTIONS & DATES
        r.setDetails(b.getDetails());
        r.setReferenceImageUrl(b.getReferenceImageUrl());
        r.setCreatedAt(b.getCreatedAt());

        // 4. MAP PAYMENT HISTORY
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

        // 5. MAP RATING DATA
        reviewRepo.findByBookingId(b.getId()).ifPresent(rev -> {
            r.setRated(true);
            r.setUserRating(rev.getRating());
            r.setUserComment(rev.getComment());
            r.setReviewDate(rev.getCreatedAt());
        });

        return r;
    }

    @Transactional
    public void rateBooking(User client, Long bookingId, com.artistportfolio.dto.BookingDtos.RatingRequest req) {
        Booking booking = bookingRepo.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getClient().getId().equals(client.getId())) throw new RuntimeException("Unauthorized");
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) throw new RuntimeException("Cannot rate incomplete work");
        if (reviewRepo.existsByClientIdAndBookingId(client.getId(), bookingId)) throw new RuntimeException("Already rated");

        Review review = new Review();
        review.setRating(req.rating);
        review.setComment(req.comment);
        review.setClient(client);
        review.setArtist(booking.getService().getArtist());
        review.setService(booking.getService());
        review.setBooking(booking);

        // ── FIX: Use the correct Rating Notification message and variables ──
        Notification rn = new Notification();
        rn.setMessage(client.getUsername() + " left a " + req.rating + "-star rating on " + booking.getService().getName());
        rn.setLink("/admin/services/" + booking.getService().getId());
        rn.setRecipient(booking.getService().getArtist());

        notificationRepo.save(rn);
        reviewRepo.save(review);
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
}