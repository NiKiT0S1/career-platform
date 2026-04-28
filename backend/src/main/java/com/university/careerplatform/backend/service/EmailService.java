/**
 * ================================
 * EmailService
 * ================================
 * Service for sending platform emails.
 *
 * Responsibilities:
 * - Sends password reset codes
 *
 * Notes:
 * - Uses Spring JavaMailSender
 * - SMTP configuration must be provided in application properties
 * ================================
 */

package com.university.careerplatform.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Digital Career Platform Password Reset Code");
        message.setText(
                "Your password reset code is: " + code + "\n\n" +
                "This code is valid for 10 minutes.\n" +
                "If you did not request a password reset, please ignore this email."
        );

        mailSender.send(message);
    }

//    public void sendPasswordResetCode(String to, String code) {
//        System.out.println("Password reset code for " + to + ": " + code);
//    }
}
