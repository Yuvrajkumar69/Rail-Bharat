package com.genie.Train.controller;

import com.genie.Train.entity.ContactMessage;
import com.genie.Train.repo.ContactRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {
        "http://localhost:63342",
        "http://127.0.0.1:63342",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class ContactController {

    private final ContactRepository contactRepository;

    public ContactController(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitContact(
            @RequestBody ContactMessage contactMessage
    ) {

        if (contactMessage.getName() == null
                || contactMessage.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name is required."));
        }

        if (contactMessage.getEmail() == null
                || contactMessage.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required."));
        }

        if (contactMessage.getSubject() == null
                || contactMessage.getSubject().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Subject is required."));
        }

        if (contactMessage.getMessage() == null
                || contactMessage.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Message is required."));
        }

        contactMessage.setName(contactMessage.getName().trim());
        contactMessage.setEmail(contactMessage.getEmail().trim());
        contactMessage.setSubject(contactMessage.getSubject().trim());
        contactMessage.setMessage(contactMessage.getMessage().trim());
        contactMessage.setCreatedAt(LocalDateTime.now());

        contactRepository.save(contactMessage);

        return ResponseEntity.ok(
                Map.of("message", "Message sent successfully.")
        );
    }
}