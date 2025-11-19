# Sample Backend Implementation Files

## 1. PDF Generation Request DTOs

### PdfGenerationRequest.java
```java
package com.mdmanage.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class PdfGenerationRequest {
    @JsonProperty("templateId")
    private String templateId;
    
    @JsonProperty("formData")
    private Map<String, Object> formData;
    
    @JsonProperty("practiceInfo")
    private PracticeInfo practiceInfo;
}
```

### PdfGenerationByNameRequest.java
```java
package com.mdmanage.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class PdfGenerationByNameRequest {
    @JsonProperty("templateName")
    private String templateName;
    
    @JsonProperty("formData")
    private Map<String, Object> formData;
    
    @JsonProperty("practiceInfo")
    private PracticeInfo practiceInfo;
}
```

### PracticeInfo.java
```java
package com.mdmanage.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PracticeInfo {
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("address")
    private String address;
    
    @JsonProperty("city")
    private String city;
    
    @JsonProperty("state")
    private String state;
    
    @JsonProperty("zip")
    private String zip;
    
    @JsonProperty("phone")
    private String phone;
    
    @JsonProperty("fax")
    private String fax;
    
    @JsonProperty("header")
    private String header;
    
    @JsonProperty("footer")
    private String footer;
}
```

## 2. PDF Generation Controller

### LetterTemplatePdfController.java
```java
package com.mdmanage.api.controller;

import com.mdmanage.api.dto.PdfGenerationRequest;
import com.mdmanage.api.dto.PdfGenerationByNameRequest;
import com.mdmanage.api.service.LetterTemplatePdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/letter-templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LetterTemplatePdfController {

    private final LetterTemplatePdfService letterTemplatePdfService;

    @PostMapping("/generate-pdf")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STAFF', 'TEAM_LEAD')")
    public ResponseEntity<byte[]> generatePdf(@RequestBody PdfGenerationRequest request) {
        try {
            // Generate PDF
            byte[] pdfBytes = letterTemplatePdfService.generatePdfById(
                request.getTemplateId(),
                request.getFormData(),
                request.getPracticeInfo()
            );

            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"letter.pdf\"");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @PostMapping("/generate-pdf-by-name")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STAFF', 'TEAM_LEAD')")
    public ResponseEntity<byte[]> generatePdfByName(@RequestBody PdfGenerationByNameRequest request) {
        try {
            // Generate PDF by template name
            byte[] pdfBytes = letterTemplatePdfService.generatePdfByName(
                request.getTemplateName(),
                request.getFormData(),
                request.getPracticeInfo()
            );

            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + sanitizeFilename(request.getTemplateName()) + ".pdf\"");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @PostMapping("/generate-word")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STAFF', 'TEAM_LEAD')")
    public ResponseEntity<byte[]> generateWordDocument(@RequestBody PdfGenerationRequest request) {
        try {
            // Generate Word document
            byte[] wordBytes = letterTemplatePdfService.generateWordDocument(
                request.getTemplateId(),
                request.getFormData(),
                request.getPracticeInfo()
            );

            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"letter.docx\"");
            headers.setContentLength(wordBytes.length);

            return ResponseEntity.ok()
                .headers(headers)
                .body(wordBytes);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9\\-_\\.]", "_");
    }
}
```

## 3. PDF Generation Service

### LetterTemplatePdfService.java
```java
package com.mdmanage.api.service;

import com.mdmanage.api.dto.PracticeInfo;
import java.util.Map;

public interface LetterTemplatePdfService {
    byte[] generatePdfById(String templateId, Map<String, Object> formData, PracticeInfo practiceInfo);
    byte[] generatePdfByName(String templateName, Map<String, Object> formData, PracticeInfo practiceInfo);
    byte[] generateWordDocument(String templateId, Map<String, Object> formData, PracticeInfo practiceInfo);
}
```

### LetterTemplatePdfServiceImpl.java
```java
package com.mdmanage.api.service.impl;

import com.itextpdf.html2pdf.HtmlConverter;
import com.mdmanage.api.dto.PracticeInfo;
import com.mdmanage.api.entity.LetterTemplate;
import com.mdmanage.api.repository.LetterTemplateRepository;
import com.mdmanage.api.service.LetterTemplatePdfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LetterTemplatePdfServiceImpl implements LetterTemplatePdfService {

    private final LetterTemplateRepository letterTemplateRepository;
    private final TemplateEngine templateEngine;

    @Override
    public byte[] generatePdfById(String templateId, Map<String, Object> formData, PracticeInfo practiceInfo) {
        try {
            // Convert string ID to UUID
            UUID uuid = UUID.fromString(templateId);
            byte[] uuidBytes = convertUUIDToBytes(uuid);
            
            // Find template
            Optional<LetterTemplate> templateOpt = letterTemplateRepository.findById(uuidBytes);
            if (!templateOpt.isPresent()) {
                throw new RuntimeException("Template not found: " + templateId);
            }

            LetterTemplate template = templateOpt.get();
            
            // Generate PDF
            return generatePdfFromTemplate(template, formData, practiceInfo);
            
        } catch (Exception e) {
            log.error("Error generating PDF by ID: {}", templateId, e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    @Override
    public byte[] generatePdfByName(String templateName, Map<String, Object> formData, PracticeInfo practiceInfo) {
        try {
            // Find template by name
            Optional<LetterTemplate> templateOpt = letterTemplateRepository.findByTemplateNameAndIsActiveTrue(templateName);
            if (!templateOpt.isPresent()) {
                throw new RuntimeException("Template not found: " + templateName);
            }

            LetterTemplate template = templateOpt.get();
            
            // Generate PDF
            return generatePdfFromTemplate(template, formData, practiceInfo);
            
        } catch (Exception e) {
            log.error("Error generating PDF by name: {}", templateName, e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    @Override
    public byte[] generateWordDocument(String templateId, Map<String, Object> formData, PracticeInfo practiceInfo) {
        try {
            // Convert string ID to UUID
            UUID uuid = UUID.fromString(templateId);
            byte[] uuidBytes = convertUUIDToBytes(uuid);
            
            // Find template
            Optional<LetterTemplate> templateOpt = letterTemplateRepository.findById(uuidBytes);
            if (!templateOpt.isPresent()) {
                throw new RuntimeException("Template not found: " + templateId);
            }

            LetterTemplate template = templateOpt.get();
            
            // Generate Word document
            return generateWordFromTemplate(template, formData, practiceInfo);
            
        } catch (Exception e) {
            log.error("Error generating Word document: {}", templateId, e);
            throw new RuntimeException("Failed to generate Word document", e);
        }
    }

    private byte[] generatePdfFromTemplate(LetterTemplate template, Map<String, Object> formData, PracticeInfo practiceInfo) {
        try {
            // Create context for template processing
            Context context = new Context();
            
            // Add all form data
            if (formData != null) {
                formData.forEach(context::setVariable);
            }
            
            // Add practice info
            if (practiceInfo != null) {
                context.setVariable("practiceName", practiceInfo.getName());
                context.setVariable("practiceAddress", practiceInfo.getAddress());
                context.setVariable("practiceCity", practiceInfo.getCity());
                context.setVariable("practiceState", practiceInfo.getState());
                context.setVariable("practiceZip", practiceInfo.getZip());
                context.setVariable("practicePhone", practiceInfo.getPhone());
                context.setVariable("practiceFax", practiceInfo.getFax());
            }
            
            // Add current date
            context.setVariable("currentDate", LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
            
            // Process template content
            String processedContent = processTemplateContent(template.getTemplateContent(), context);
            
            // Wrap in HTML structure
            String htmlContent = wrapInHtmlStructure(processedContent, practiceInfo);
            
            // Convert HTML to PDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            HtmlConverter.convertToPdf(htmlContent, outputStream);
            
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            log.error("Error generating PDF from template", e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private byte[] generateWordFromTemplate(LetterTemplate template, Map<String, Object> formData, PracticeInfo practiceInfo) {
        try {
            // Create new Word document
            XWPFDocument document = new XWPFDocument();
            
            // Create context for template processing
            Context context = new Context();
            
            // Add all form data
            if (formData != null) {
                formData.forEach(context::setVariable);
            }
            
            // Add practice info
            if (practiceInfo != null) {
                context.setVariable("practiceName", practiceInfo.getName());
                context.setVariable("practiceAddress", practiceInfo.getAddress());
                context.setVariable("practiceCity", practiceInfo.getCity());
                context.setVariable("practiceState", practiceInfo.getState());
                context.setVariable("practiceZip", practiceInfo.getZip());
                context.setVariable("practicePhone", practiceInfo.getPhone());
                context.setVariable("practiceFax", practiceInfo.getFax());
            }
            
            // Add current date
            context.setVariable("currentDate", LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
            
            // Process template content
            String processedContent = processTemplateContent(template.getTemplateContent(), context);
            
            // Add content to Word document
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText(processedContent);
            
            // Convert to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.write(outputStream);
            document.close();
            
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            log.error("Error generating Word document from template", e);
            throw new RuntimeException("Failed to generate Word document", e);
        }
    }

    private String processTemplateContent(String templateContent, Context context) {
        // Simple variable replacement - can be enhanced with Thymeleaf
        String processed = templateContent;
        
        // Replace variables in the format {variableName}
        for (String variableName : context.getVariableNames()) {
            Object value = context.getVariable(variableName);
            if (value != null) {
                processed = processed.replace("{" + variableName + "}", String.valueOf(value));
            }
        }
        
        return processed;
    }

    private String wrapInHtmlStructure(String content, PracticeInfo practiceInfo) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: 'Times New Roman', serif; padding: 20px; line-height: 1.6; }");
        html.append(".header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 30px; }");
        html.append(".date { text-align: right; margin-bottom: 30px; }");
        html.append(".content { margin-bottom: 30px; }");
        html.append(".signature { margin-top: 50px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        
        // Add practice header if available
        if (practiceInfo != null) {
            html.append("<div class='header'>");
            html.append("<h2>").append(practiceInfo.getName()).append("</h2>");
            html.append("<p>").append(practiceInfo.getAddress()).append("</p>");
            html.append("<p>").append(practiceInfo.getCity()).append(", ").append(practiceInfo.getState()).append(" ").append(practiceInfo.getZip()).append("</p>");
            html.append("<p>Phone: ").append(practiceInfo.getPhone()).append("</p>");
            if (practiceInfo.getFax() != null && !practiceInfo.getFax().isEmpty()) {
                html.append("<p>Fax: ").append(practiceInfo.getFax()).append("</p>");
            }
            html.append("</div>");
        }
        
        // Add content
        html.append("<div class='content'>");
        html.append(content);
        html.append("</div>");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    private byte[] convertUUIDToBytes(UUID uuid) {
        // Convert UUID to byte array for database lookup
        long mostSigBits = uuid.getMostSignificantBits();
        long leastSigBits = uuid.getLeastSignificantBits();
        
        byte[] bytes = new byte[16];
        for (int i = 0; i < 8; i++) {
            bytes[i] = (byte) (mostSigBits >>> (8 * (7 - i)));
        }
        for (int i = 8; i < 16; i++) {
            bytes[i] = (byte) (leastSigBits >>> (8 * (7 - (i - 8))));
        }
        
        return bytes;
    }
}
```

## 4. Required Dependencies (pom.xml)

```xml
<!-- PDF Generation -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>html2pdf</artifactId>
    <version>4.0.5</version>
</dependency>

<!-- Word Document Generation -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.4</version>
</dependency>

<!-- Template Processing -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

## 5. Configuration

### ThymeleafConfig.java
```java
package com.mdmanage.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

@Configuration
public class ThymeleafConfig {

    @Bean
    public TemplateEngine stringTemplateEngine() {
        TemplateEngine templateEngine = new TemplateEngine();
        templateEngine.addTemplateResolver(stringTemplateResolver());
        return templateEngine;
    }

    @Bean
    public StringTemplateResolver stringTemplateResolver() {
        StringTemplateResolver templateResolver = new StringTemplateResolver();
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCacheable(false);
        return templateResolver;
    }
}
```

This implementation provides:
- ✅ PDF generation using iText HTML to PDF
- ✅ Word document generation using Apache POI
- ✅ Template variable replacement
- ✅ Practice header information
- ✅ Proper error handling
- ✅ Security annotations
- ✅ File download headers
- ✅ UUID to byte array conversion for database queries 