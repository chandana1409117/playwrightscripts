# Backend Integration Setup Guide

## Overview

The frontend has been successfully updated to use the backend Letter Template APIs instead of hardcoded configurations. This document provides setup instructions and usage guidelines.

## Environment Configuration

Create a `.env.development` file in the frontend root directory:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:9094/mdm-portal-service

# Environment Settings  
VITE_ENV=development

# Enable CORS for development
VITE_ENABLE_CORS=true

# Debug settings
VITE_DEBUG_MODE=true
```

For production, create `.env.production`:

```bash
# Backend API Configuration
VITE_API_BASE_URL=https://your-production-api-url.com/mdm-portal-service

# Environment Settings
VITE_ENV=production

# Disable debug in production
VITE_DEBUG_MODE=false
```

**Note**: This project uses Vite, so environment variables must be prefixed with `VITE_` to be accessible in the browser. The variables are accessed using `import.meta.env.VITE_VARIABLE_NAME` instead of `process.env.REACT_APP_VARIABLE_NAME`.

## Backend Setup Required

1. **Start the Backend Server**:
   - Navigate to the backend directory: `/Users/smarni/MDManage/mdm-portal-service`
   - Run: `mvn spring-boot:run`
   - Ensure the server is running on `http://localhost:9094/mdm-portal-service`

2. **Database Migration**:
   - The backend includes Flyway migrations that will automatically create the letter templates table
   - Migrations include pre-populated templates from the frontend configurations

## Features Integrated

### 1. Letter Template Management
- **API Integration**: Frontend now calls backend REST APIs for all template operations
- **Fallback Support**: If backend is unavailable, automatically falls back to hardcoded templates
- **Real-time Loading**: Templates are loaded dynamically from the database

### 2. Letter Configuration Component
- **Full CRUD Operations**: Create, Read, Update, Delete templates
- **Template Migration**: Migrate existing frontend templates to backend database
- **Category Management**: Filter and organize templates by category
- **Field Configuration**: Dynamic field setup with custom labels

### 3. Letter Generation Component
- **Backend Template Selection**: Load templates from database
- **Dynamic Field Rendering**: Fields rendered based on backend template configuration
- **Template Processing**: Content processing with variable substitution
- **Export Functions**: PDF, Word, and Print functionality maintained

## API Endpoints Used

### Letter Templates
- `GET /api/v1/letter-templates` - Get all templates with pagination/filtering
- `GET /api/v1/letter-templates/category/{category}` - Get templates by category
- `GET /api/v1/letter-templates/{id}` - Get specific template
- `POST /api/v1/letter-templates` - Create new template
- `PUT /api/v1/letter-templates/{id}` - Update template
- `DELETE /api/v1/letter-templates/{id}` - Delete template
- `PATCH /api/v1/letter-templates/{id}/set-default` - Set as default template

### Migration Endpoints
- `POST /api/v1/letter-templates/migration/bulk` - Migrate all frontend templates
- `POST /api/v1/letter-templates/migration/single` - Migrate single template
- `POST /api/v1/letter-templates/migration/validate` - Validate template configuration

## Usage Instructions

### 1. Initial Setup
1. Start the backend server
2. Open the frontend application
3. Navigate to Letters page
4. Click "Configure Templates" to access template management

### 2. Migrating Existing Templates
1. In the template configuration dialog, click "Migrate Frontend Templates"
2. This will transfer all hardcoded templates to the database
3. Templates will be available for editing and customization

### 3. Creating New Templates
1. In template configuration, click "Create New Template"
2. Fill in template details:
   - Template name and description
   - Category (Insurance, Patient, Practice)
   - Required fields
   - Template content with variables
3. Save the template

### 4. Using Templates
1. On the Letters page, select a category filter
2. Choose a template from the dropdown (loaded from backend)
3. Fill in the required fields
4. Generate letter preview
5. Export to PDF, Word, or print

## Troubleshooting

### Backend Connection Issues
- **Error**: "Failed to load templates from backend"
- **Solution**: Ensure backend server is running on correct port
- **Fallback**: System will automatically use hardcoded templates

### Template Loading Issues
- **Error**: "No templates found in backend"
- **Solution**: Use the migration feature to populate templates from frontend
- **Alternative**: Create templates manually in the configuration interface

### CORS Issues
- **Error**: Cross-origin request blocked
- **Solution**: Ensure backend CORS configuration allows frontend origin
- **Development**: Backend should allow `http://localhost:3000` and the frontend should connect to `http://localhost:9094/mdm-portal-service`

## Data Structure

### Template Storage Format
Templates are stored with the following structure:
```json
{
  "id": "uuid",
  "templateName": "Template Name",
  "templateDescription": "Description",
  "templateContent": "HTML content with {variables}",
  "category": "Insurance|Patient|Practise",
  "fields": ["#cmbInsRow", "#claimLabel", "#Amount"],
  "dynamicLabels": {
    "amount": "Outstanding Balance",
    "dos1": "Date of Service"
  },
  "isActive": true,
  "isDefault": false
}
```

### Field Configuration
Fields are still configured in `src/constants/LetterConfigurations.ts` for form rendering, but templates and their field associations are now stored in the backend.

## Security Considerations

1. **Authentication**: API calls include authentication tokens
2. **Authorization**: Role-based access control implemented
3. **Data Validation**: Both frontend and backend validation
4. **SQL Injection Prevention**: Prepared statements used in backend

## Performance Optimizations

1. **Caching**: Templates cached in frontend state
2. **Pagination**: Large template lists paginated
3. **Lazy Loading**: Templates loaded on demand
4. **Error Handling**: Graceful fallback to hardcoded templates

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live template updates
2. **Version Control**: Template versioning and history
3. **Template Sharing**: Share templates between practices
4. **Advanced Variables**: More sophisticated variable substitution
5. **Template Analytics**: Usage tracking and analytics

## Support

For issues with the backend integration:
1. Check backend server logs
2. Verify API endpoints are accessible
3. Ensure database migrations have run successfully
4. Check browser console for frontend errors

The system is designed to be resilient - if backend is unavailable, the frontend will continue to work with the original hardcoded templates. 