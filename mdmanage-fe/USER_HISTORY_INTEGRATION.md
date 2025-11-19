# User History API Integration Documentation

## Overview

This document describes the complete integration of user activity history endpoints with the frontend MDManage application. The integration provides comprehensive user activity tracking with advanced filtering, pagination, and real-time updates.

## Backend API Endpoints

### Base URL
All endpoints are prefixed with `/admin/logs`

### Available Endpoints

#### 1. Get Recent User History
```
GET /admin/logs/user/{username}
```
- **Purpose**: Fetch recent user activity (limited to 50 items for performance)
- **Authorization**: Any authenticated user can view their own history
- **Response**: Array of UserHistoryItem objects

#### 2. Get Paginated User History
```
GET /admin/logs/user/{username}/paginated?page={page}&size={size}
```
- **Purpose**: Fetch paginated user activity history
- **Parameters**:
  - `page`: Page number (0-based, default: 0)
  - `size`: Page size (default: 20)
- **Authorization**: Any authenticated user
- **Response**: Paginated response with user history

#### 3. Get User Activity Count
```
GET /admin/logs/user/{username}/count
```
- **Purpose**: Get total number of activities for a user
- **Authorization**: Any authenticated user
- **Response**: Number (total count)

#### 4. Get User History by Date Range
```
GET /admin/logs/user/{username}/daterange?startDate={start}&endDate={end}
```
- **Purpose**: Fetch user activity within specified date range
- **Parameters**:
  - `startDate`: ISO datetime string
  - `endDate`: ISO datetime string
- **Authorization**: Any authenticated user
- **Response**: Array of UserHistoryItem objects

#### 5. Get Filtered User History
```
GET /admin/logs/filter?username={username}&actionType={type}&module={module}&status={status}&startDate={start}&endDate={end}&page={page}&size={size}
```
- **Purpose**: Advanced filtering with multiple criteria
- **Parameters**:
  - `username`: Target username
  - `actionType`: Filter by action type (optional)
  - `module`: Filter by module (optional)
  - `status`: Filter by status (SUCCESS/FAILED) (optional)
  - `startDate`: Start date filter (optional)
  - `endDate`: End date filter (optional)
  - `page`: Page number (default: 0)
  - `size`: Page size (default: 20)
- **Authorization**: SUPER_ADMIN or internal STAFF
- **Response**: Paginated response with filtered history

#### 6. Search Activities by Description
```
GET /admin/logs/search?query={searchTerm}
```
- **Purpose**: Search activities containing specific text
- **Authorization**: SUPER_ADMIN or internal STAFF
- **Response**: Array of matching UserHistoryItem objects

## Frontend Integration

### 1. API Utility (`src/lib/api/userHistory.ts`)

Provides type-safe API functions with proper error handling:

```typescript
import { getUserHistory, getUserHistoryPaginated, getUserActivityCount } from '../lib/api/userHistory';

// Get recent history
const history = await getUserHistory('username');

// Get paginated history
const paginatedHistory = await getUserHistoryPaginated('username', 0, 20);

// Get activity count
const count = await getUserActivityCount('username');
```

### 2. Custom Hook (`src/hooks/useUserHistory.ts`)

Provides state management and data fetching:

```typescript
import { useUserHistory } from '../hooks/useUserHistory';

const {
    history,
    loading,
    error,
    activityCount,
    pagination,
    refresh,
    fetchFilteredHistory,
    nextPage,
    previousPage,
} = useUserHistory({
    username: 'testuser',
    enablePagination: true,
    pageSize: 20,
});
```

### 3. Enhanced UserHistory Component

The UserHistory component now supports:

#### Basic Usage
```tsx
<UserHistory 
    userId="123" 
    username="testuser" 
/>
```

#### With Advanced Features
```tsx
<UserHistory 
    userId="123" 
    username="testuser"
    showFilters={true}
    enablePagination={true}
    maxHeight="max-h-[600px]"
/>
```

#### Props
- `userId`: User ID (required)
- `username`: Username for history lookup (required)
- `enablePagination`: Enable pagination controls (default: false)
- `showFilters`: Show filtering options (default: false)
- `maxHeight`: CSS class for maximum height (default: "max-h-96")

## Component Integration

### 1. ViewUser Component
```tsx
<UserHistory 
    userId={id} 
    username={user.username} 
    showFilters={true}
    maxHeight="max-h-[600px]"
/>
```
- Read-only view with filtering capabilities
- Displays comprehensive activity history
- Suitable for detailed user inspection

### 2. EditUser Component
```tsx
<UserHistory 
    userId={id} 
    username={user.username} 
    showFilters={true}
    enablePagination={true}
    maxHeight="max-h-[700px]"
/>
```
- Full-featured history with pagination
- Ideal for detailed editing sessions
- Real-time activity tracking during edits

## Features

### 1. Real-time Updates
- Automatic refresh on data changes
- Manual refresh capability
- Error handling with user feedback

### 2. Advanced Filtering
- Filter by action type (CREATE_USER, UPDATE_USER, etc.)
- Filter by module (USER_MANAGEMENT, AUTHENTICATION, etc.)
- Filter by status (SUCCESS, FAILED)
- Date range filtering
- Combinable filters for precise queries

### 3. Pagination Support
- Configurable page sizes
- Navigation controls (previous/next)
- Total count display
- Performance optimization for large datasets

### 4. Error Handling
- Toast notifications for API errors
- Graceful degradation on failures
- User-friendly error messages
- Retry mechanisms

### 5. Performance Optimization
- Lazy loading of history data
- Efficient API calls
- Database indexes for fast queries
- Caching strategies

## Data Types

### UserHistoryItem
```typescript
interface UserHistoryItem {
    id: number;
    actionType: string;
    description: string;
    username: string;
    timestamp: string;
    status: string;
    module: string;
    ipAddress?: string;
    traceId?: string;
}
```

### UserHistoryFilters
```typescript
interface UserHistoryFilters {
    actionType?: string;
    module?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}
```

### PaginatedResponse
```typescript
interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}
```

## Security

### Authorization Levels
1. **User History**: Any authenticated user can view their own history
2. **Admin Functions**: SUPER_ADMIN or internal STAFF for advanced features
3. **Filtering & Search**: Enhanced permissions for comprehensive queries

### Data Protection
- Password fields are automatically masked in logs
- Sensitive information filtering
- IP address tracking for security auditing
- Secure API endpoints with proper authentication

## Testing

### Test Component (`src/components/UserHistoryTest.tsx`)
A comprehensive test component for administrators to verify API integration:

- Test all endpoint types
- Interactive filtering
- Date range testing
- Pagination verification
- Real-time error handling

### Usage
Access the test component through your admin panel to verify:
1. API connectivity
2. Data formatting
3. Error handling
4. Performance under load

## Performance Considerations

### Database Optimization
- Composite indexes on frequently queried columns
- Optimized query patterns
- Pagination for large datasets
- Efficient date range queries

### Frontend Optimization
- Lazy loading of components
- Efficient state management
- Minimal re-renders
- Optimized API calls

### Caching Strategy
- Browser-level caching for static data
- API response caching where appropriate
- Intelligent refresh strategies

## Migration Notes

### Backend Changes Required
1. Ensure all new endpoints are deployed
2. Database indexes are created
3. Security configurations are updated
4. Logging aspect enhancements are active

### Frontend Dependencies
1. Update to latest API utilities
2. Import new custom hooks
3. Update component props where needed
4. Test integration thoroughly

## Troubleshooting

### Common Issues

#### 1. API Connection Errors
- Verify backend endpoints are accessible
- Check authentication tokens
- Validate CORS settings

#### 2. Empty History Data
- Confirm user has activity logs
- Check date range filters
- Verify username is correct

#### 3. Performance Issues
- Check database indexes
- Monitor API response times
- Optimize filter queries

#### 4. Permission Errors
- Verify user roles and permissions
- Check security configurations
- Validate authorization headers

## Example Implementation

### Complete Integration Example
```tsx
import React from 'react';
import { useUserHistory } from '../hooks/useUserHistory';
import UserHistory from '../components/UserHistory';

const UserManagementPage = ({ userId, username }) => {
    return (
        <div className="flex gap-6">
            <div className="flex-1">
                {/* Main user management content */}
            </div>
            <div className="w-96">
                <UserHistory 
                    userId={userId}
                    username={username}
                    showFilters={true}
                    enablePagination={true}
                    maxHeight="max-h-[500px]"
                />
            </div>
        </div>
    );
};
```

## Support

For issues or questions regarding user history integration:
1. Check this documentation first
2. Test with the provided test component
3. Verify backend API responses
4. Check browser console for errors
5. Contact the development team with specific error details

---

*Last Updated: Current Date*
*Version: 1.0* 