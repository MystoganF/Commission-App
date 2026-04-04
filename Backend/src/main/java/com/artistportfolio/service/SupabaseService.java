package com.artistportfolio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadFile(MultipartFile file) throws IOException {
        // Clean the filename and create a unique path
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_") : "upload.jpg";
        String filename = UUID.randomUUID() + "_" + originalFilename;
        String bucketName = "portfolio"; // Make sure this bucket exists and is PUBLIC in Supabase

        // Supabase Storage REST API endpoint for uploading
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);
        headers.setContentType(MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        // Send the file to Supabase
        ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            // Return the public URL so we can save it in our database
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filename;
        } else {
            throw new RuntimeException("Failed to upload image to Supabase.");
        }
    }
}