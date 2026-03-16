/**
 * Utility class for generating BCrypt password hashes.
 * Used to prepare encoded passwords for initial database setup and testing.
 */

package com.university.careerplatform.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGeneration {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println(encoder.encode("1234"));
        System.out.println(encoder.encode("admin"));

    }
}
