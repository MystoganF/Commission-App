package com.artistportfolio.service;

import com.artistportfolio.dto.BookingDtos.*;
import com.artistportfolio.dto.PortfolioDtos.*;
import com.artistportfolio.dto.ProfileDtos.*;
import com.artistportfolio.dto.ServiceDtos.*;
import com.artistportfolio.dto.StatsDtos.*;
import com.artistportfolio.entity.*;
import com.artistportfolio.entity.Booking.BookingStatus;
import com.artistportfolio.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.artistportfolio.entity.ArtistServiceEntity;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository         userRepo;
    private final PortfolioWorkRepository workRepo;
    private final ArtistServiceRepository serviceRepo;
    private final BookingRepository bookingRepo;

    // Folder where uploaded images will be stored (serve via static resources or CDN)
    private static final String UPLOAD_DIR = "uploads/portfolio/";

    public AdminService(UserRepository userRepo,
                        PortfolioWorkRepository workRepo,
                        ArtistServiceRepository serviceRepo,
                        BookingRepository bookingRepo) {
        this.userRepo    = userRepo;
        this.workRepo    = workRepo;
        this.serviceRepo = serviceRepo;
        this.bookingRepo = bookingRepo;
    }

    // ── Stats ───────────────────────────────────────────────

    public StatsResponse getStats(User artist) {
        StatsResponse res = new StatsResponse();
        res.totalWorks    = workRepo.countByArtistId(artist.getId());
        res.totalServices = serviceRepo.countByArtistId(artist.getId());
        res.totalBookings = bookingRepo.countByServiceArtistId(artist.getId());
        res.pendingCount  = bookingRepo.countByServiceArtistIdAndStatus(
                artist.getId(), BookingStatus.PENDING);
        return res;
    }

    // ── Portfolio ───────────────────────────────────────────

    public List<WorkResponse> getPortfolio(User artist) {
        return workRepo.findByArtistIdOrderByCreatedAtDesc(artist.getId())
                .stream().map(this::toWorkResponse)
                .collect(Collectors.toList());
    }

    public WorkResponse addWork(User artist, String title, String category,
                                String year, MultipartFile file) throws IOException {
        String imageUrl = saveFile(file);

        PortfolioWork work = new PortfolioWork();
        work.setTitle(title);
        work.setCategory(category);
        work.setYear(year);
        work.setImageUrl(imageUrl);
        work.setArtist(artist);

        return toWorkResponse(workRepo.save(work));
    }

    public void deleteWork(User artist, Long workId) {
        PortfolioWork work = workRepo.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found."));
        if (!work.getArtist().getId().equals(artist.getId())) {
            throw new RuntimeException("Unauthorized.");
        }
        workRepo.delete(work);
    }

    // ── Services ────────────────────────────────────────────

    public List<ServiceResponse> getServices(User artist) {
        return serviceRepo.findByArtistId(artist.getId())
                .stream().map(this::toServiceResponse)
                .collect(Collectors.toList());
    }

    public ServiceResponse createService(User artist, ServiceRequest req) {
        ArtistServiceEntity s = new ArtistServiceEntity();
        s.setName(req.name);
        s.setPrice(req.price);
        s.setTurnaround(req.turnaround);
        s.setDescription(req.description);
        s.setSamples(req.samples);
        s.setArtist(artist);
        return toServiceResponse(serviceRepo.save(s));
    }

    public ServiceResponse updateService(User artist, Long id, ServiceRequest req) {
        ArtistServiceEntity s = serviceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found."));
        if (!s.getArtist().getId().equals(artist.getId())) {
            throw new RuntimeException("Unauthorized.");
        }
        s.setName(req.name);
        s.setPrice(req.price);
        s.setTurnaround(req.turnaround);
        s.setDescription(req.description);
        s.setSamples(req.samples);
        return toServiceResponse(serviceRepo.save(s));
    }

    public void deleteService(User artist, Long id) {
        ArtistServiceEntity s = serviceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found."));
        if (!s.getArtist().getId().equals(artist.getId())) {
            throw new RuntimeException("Unauthorized.");
        }
        serviceRepo.delete(s);
    }

    // ── Bookings ────────────────────────────────────────────

    public List<BookingResponse> getBookings(User artist) {
        return bookingRepo.findByServiceArtistIdOrderByCreatedAtDesc(artist.getId())
                .stream().map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse updateBookingStatus(User artist, Long bookingId,
                                               StatusUpdateRequest req) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));
        if (!booking.getService().getArtist().getId().equals(artist.getId())) {
            throw new RuntimeException("Unauthorized.");
        }
        booking.setStatus(req.status);
        return toBookingResponse(bookingRepo.save(booking));
    }

    // ── Profile ─────────────────────────────────────────────

    public ProfileResponse getProfile(User artist) {
        ProfileResponse res = new ProfileResponse();
        res.username    = artist.getUsername();
        res.phoneNumber = artist.getPhoneNumber();
        res.bio         = artist.getBio();
        res.facebook    = artist.getFacebook();
        res.instagram   = artist.getInstagram();
        res.twitter     = artist.getTwitter();
        return res;
    }

    public ProfileResponse updateProfile(User artist, ProfileUpdateRequest req) {
        artist.setUsername(req.username);
        artist.setPhoneNumber(req.phoneNumber);
        artist.setBio(req.bio);
        artist.setFacebook(req.facebook);
        artist.setInstagram(req.instagram);
        artist.setTwitter(req.twitter);
        return getProfile(userRepo.save(artist));
    }

    // ── Helpers ─────────────────────────────────────────────

    private WorkResponse toWorkResponse(PortfolioWork w) {
        WorkResponse r = new WorkResponse();
        r.id        = w.getId();
        r.title     = w.getTitle();
        r.category  = w.getCategory();
        r.year      = w.getYear();
        r.imageUrl  = w.getImageUrl();
        r.createdAt = w.getCreatedAt();
        return r;
    }

    private ServiceResponse toServiceResponse(ArtistServiceEntity s) {
        ServiceResponse r = new ServiceResponse();
        r.id          = s.getId();
        r.name        = s.getName();
        r.price       = s.getPrice();
        r.turnaround  = s.getTurnaround();
        r.description = s.getDescription();
        r.samples     = s.getSamples();
        return r;
    }

    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.id          = b.getId();
        r.clientName  = b.getClient().getUsername();
        r.clientEmail = b.getClient().getEmail();
        r.serviceName = b.getService().getName();
        r.price       = b.getService().getPrice();
        r.status      = b.getStatus().name();
        r.createdAt   = b.getCreatedAt();
        return r;
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                StandardCopyOption.REPLACE_EXISTING);

        return "/" + UPLOAD_DIR + filename;
    }
}