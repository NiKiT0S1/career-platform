package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkUpdatePracticeRequest extends UpdatePracticeRequest {

    private List<Long> studentIds;

    private Boolean assignSequentialContractNumbers;
}
