package com.management.studyhub.dto;

import lombok.Data;

@Data
public class GoogleLoginRequestDTO {
    private String credential;
    private String role;
}
