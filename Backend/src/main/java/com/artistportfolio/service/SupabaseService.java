package com.artistportfolio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
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
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_") : "upload.jpg";
        String filename = UUID.randomUUID() + "_" + originalFilename;
        String bucketName = "portfolio"; // Make sure this bucket is created in Supabase!

        // Prevent trailing slash issues from your properties file
        String cleanUrl = supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
        String uploadUrl = cleanUrl + "/storage/v1/object/" + bucketName + "/" + filename;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);
        headers.setContentType(MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        try {
            // Send the file to Supabase
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);
            return cleanUrl + "/storage/v1/object/public/" + bucketName + "/" + filename;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            // THIS IS THE LIFESAVER: It prints the EXACT error from Supabase
            System.err.println("Supabase Upload Failed!");
            System.err.println("Status Code: " + e.getStatusCode());
            System.err.println("Response Body: " + e.getResponseBodyAsString());
            throw new RuntimeException("Failed to upload image to Supabase: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Unexpected error during upload: " + e.getMessage());
            throw new RuntimeException("Unexpected error during upload.", e);
        }
    }
}