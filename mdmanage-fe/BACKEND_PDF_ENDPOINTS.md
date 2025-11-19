# Backend PDF Generation Endpoints

## Overview

The frontend now uses backend APIs for PDF and Word document generation instead of client-side libraries. This provides better quality, consistency, and server-side template processing.

## Required Backend Endpoints

### 1. Generate PDF by Template ID
```
POST /api/v1/letter-templates/generate-pdf
```

**Request Body:**
```json
{
  "templateId": "uuid",
  "formData": {
    "patientId": "12345",
    "dos": "2024-01-15",
    "amount": "150.00",
    "insuranceCompany": "Geico",
    "claim": "CLM-123456",
    "signed": "Dr. Smith",
    "phoneNumber": "732-248-7700",
    "ext": "101",
    "currentDate": "January 15, 2024",
    "patientLastName": "Johnson",
    // ... other form fields
  },
  "practiceInfo": {
    "name": "Surgicore Medical Center",
    "address": "123 Medical Drive",
    "city": "New Brunswick",
    "state": "NJ",
    "zip": "08901",
    "phone": "732-248-7700",
    "fax": "732-248-7701",
    "header": "Practice Header Text - Custom header content for letterhead",
    "footer": "Practice Footer Text - Custom footer content for documents"
  }
}
```

**Response:**
- Content-Type: `application/pdf`
- Binary PDF data
- Headers should include: `Content-Disposition: attachment; filename="letter.pdf"`

### Important: Practice Header and Footer

The `practiceInfo.header` and `practiceInfo.footer` fields contain custom content that should be used to generate proper headers and footers in the PDF. These fields are stored in the Practice entity and are essential for proper document formatting.

**Backend Implementation Notes:**
- Use `practiceInfo.header` for the document header/letterhead
- Use `practiceInfo.footer` for the document footer
- If header/footer are empty, fall back to basic practice information
- Ensure headers and footers appear on all pages of multi-page documents

### 2. Generate PDF by Template Name (for hardcoded templates)
```
POST /api/v1/letter-templates/generate-pdf-by-name
```

**Request Body:**
```json
{
  "templateName": "Appeal Letter for CPT codes 80307 to 80104[Insurance]",
  "formData": { /* same as above */ },
  "practiceInfo": { /* same as above */ }
}
```

**Response:** Same as above

### 3. Generate Word Document
```
POST /api/v1/letter-templates/generate-word
```

**Request Body:** Same as PDF endpoint

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Binary Word document data
- Headers should include: `Content-Disposition: attachment; filename="letter.docx"`

## Backend Implementation Requirements

### 1. Template Processing
- Replace variables in template content with form data
- Handle dynamic labels from template configuration
- Process HTML content and convert to PDF/Word

### 2. Variable Replacement
The backend should replace variables in the template content:
```html
<!-- Template content example -->
<p>Dear {patientLastName},</p>
<p>Your claim {claim} for DOS {dos} in the amount of ${amount} has been processed.</p>
<p>Practice: {practiceName}</p>
<p>Date: {currentDate}</p>
```

### 3. Expected Variables
The backend should handle these common variables:
- **Form Data**: All fields from the frontend form
- **Practice Info**: Name, address, phone, fax, etc.
- **Computed Fields**: 
  - `currentDate`: Current date formatted
  - `patientLastName`: Patient's last name
  - Dynamic fields based on template configuration

### 4. PDF Generation Libraries (Recommendations)
For Spring Boot backend, consider:
- **iText 7**: Professional PDF generation
- **Flying Saucer**: HTML to PDF conversion
- **Apache PDFBox**: PDF manipulation
- **Thymeleaf**: Template processing

### 5. Word Document Generation
For Word documents:
- **Apache POI**: Java library for Office documents
- **docx4j**: Advanced Word document processing

## Sample Backend Controller

```java
@RestController
@RequestMapping("/api/v1/letter-templates")
public class LetterTemplatePdfController {
    
    @PostMapping("/generate-pdf")
    public ResponseEntity<byte[]> generatePdf(@RequestBody PdfGenerationRequest request) {
        try {
            // 1. Get template by ID
            LetterTemplate template = letterTemplateService.findById(request.getTemplateId());
            
            // 2. Process template with form data
            String processedContent = templateProcessor.processTemplate(
                template.getTemplateContent(), 
                request.getFormData(), 
                request.getPracticeInfo()
            );
            
            // 3. Generate PDF
            byte[] pdfBytes = pdfGenerator.generatePdf(processedContent);
            
            // 4. Return PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                .filename(template.getTemplateName() + ".pdf").build());
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/generate-pdf-by-name")
    public ResponseEntity<byte[]> generatePdfByName(@RequestBody PdfGenerationByNameRequest request) {
        // Similar implementation but find template by name
    }
    
    @PostMapping("/generate-word")
    public ResponseEntity<byte[]> generateWordDocument(@RequestBody PdfGenerationRequest request) {
        // Similar implementation but generate Word document
    }
}
```

## Sample Request DTOs

```java
public class PdfGenerationRequest {
    private String templateId;
    private Map<String, Object> formData;
    private PracticeInfo practiceInfo;
    // getters and setters
}

public class PdfGenerationByNameRequest {
    private String templateName;
    private Map<String, Object> formData;
    private PracticeInfo practiceInfo;
    // getters and setters
}

public class PracticeInfo {
    private String name;
    private String address;
    private String city;
    private String state;
    private String zip;
    private String phone;
    private String fax;
    // getters and setters
}
```

## Error Handling

The backend should return appropriate HTTP status codes:
- **200 OK**: PDF generated successfully
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Template not found
- **500 Internal Server Error**: PDF generation failed

## Security Considerations

- Ensure proper authentication for PDF generation endpoints
- Validate template access permissions
- Sanitize form data to prevent injection attacks
- Limit PDF generation rate to prevent abuse

## Testing

Test endpoints using:
```bash
# Test PDF generation
curl -X POST "http://localhost:9094/mdm-portal-service/api/v1/letter-templates/generate-pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"templateId":"uuid","formData":{"patientId":"123"},"practiceInfo":{"name":"Test Practice"}}' \
  --output letter.pdf

# Test Word generation
curl -X POST "http://localhost:9094/mdm-portal-service/api/v1/letter-templates/generate-word" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"templateId":"uuid","formData":{"patientId":"123"},"practiceInfo":{"name":"Test Practice"}}' \
  --output letter.docx
```

## Migration Benefits

Using backend PDF generation provides:
- ✅ **Better Quality**: Professional PDF rendering
- ✅ **Consistency**: Same output across all browsers/devices  
- ✅ **Performance**: Server-side processing is faster
- ✅ **Features**: Advanced PDF features (headers, footers, page numbers)
- ✅ **Security**: Sensitive data processed server-side only
- ✅ **Scalability**: Better resource management on server
- ✅ **Maintenance**: Centralized template processing logic 