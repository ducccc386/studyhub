package com.management.studyhub.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClassSyllabusDTO {
    private String syllabusType; // STANDARD, CUSTOM
    private String syllabusStatus; // DRAFT, SUBMITTED, APPROVED
    private List<SyllabusSessionDTO> sessions;
}
