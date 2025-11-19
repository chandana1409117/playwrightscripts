# Frontend User History Integration

## Overview

This document describes the complete frontend integration for the user history and audit system. The frontend now supports both high-level activity logs and detailed field-level change tracking through a comprehensive set of components and hooks.

## New Components Architecture

### 1. API Layer (`src/lib/api/userHistory.ts`)

**Enhanced with New Audit Endpoints:**

#### Existing Action Logs API
```typescript
// Original activity logs (high-level actions)
getUserHistory(username: string): Promise<UserHistoryItem[]>
getUserHistoryPaginated(username: string, page: number, size: number): Promise<PaginatedResponse<UserHistoryItem>>
getUserActivityCount(username: string): Promise<number>
getFilteredUserHistory(username: string, filters: UserHistoryFilters, page: number, size: number): Promise<PaginatedResponse<UserHistoryItem>>
```

#### New Audit Logs API
```typescript
// Detailed field-level changes
getUserAuditHistory(userId: string): Promise<UserAuditLog[]>
getUserAuditHistoryPaginated(userId: string, page: number, size: number): Promise<PaginatedResponse<UserAuditLog>>
getUserFieldHistory(userId: string, fieldName: string): Promise<UserAuditLog[]>
```

#### Types
```typescript
// Action logs (existing)
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

// Audit logs (new)
interface UserAuditLog {
    id: number;
    userId: string;
    modifiedBy: string;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    modifiedAt: string;
    ipAddress?: string;
    actionType: string; // CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, UNLOCK, CHANGE_PASSWORD
}
```

### 2. Custom Hooks

#### Original Hook (`src/hooks/useUserHistory.ts`)
- Manages action logs (high-level activities)
- Supports pagination and filtering
- Username-based lookup

#### New Hook (`src/hooks/useUserAudit.ts`)
- Manages audit logs (field-level changes)
- User ID-based lookup
- Enhanced filtering by field and action type
- Grouping utilities

```typescript
const {
    auditLogs,
    loading,
    error,
    pagination,
    refresh,
    fetchFieldHistory,
    groupedByField,
    availableFields,
    availableActionTypes,
} = useUserAudit({
    userId: 'user-id',
    enablePagination: true,
    pageSize: 20,
});
```

### 3. Components

#### A. UserHistory (Enhanced Existing)
- **Purpose**: High-level activity tracking
- **Data Source**: Action logs via action log endpoints
- **Features**: 
  - Activity filtering
  - Pagination support
  - Date range filtering
  - Module/status filtering

```tsx
<UserHistory 
    userId={userId} 
    username={username}
    enablePagination={true}
    showFilters={true}
    maxHeight="max-h-96"
/>
```

#### B. UserAuditHistory (New)
- **Purpose**: Detailed field-level change tracking
- **Data Source**: Audit logs via user audit endpoints
- **Features**:
  - Field-specific filtering
  - Before/after value display
  - Action type filtering
  - Enhanced visual indicators

```tsx
<UserAuditHistory
    userId={userId}
    enablePagination={true}
    showFieldFilter={true}
    maxHeight="max-h-96"
    title="User Change History"
/>
```

#### C. UserHistoryTabs (New Comprehensive)
- **Purpose**: Combined view of both activity and audit logs
- **Features**:
  - Tabbed interface
  - Switches between "Activity Logs" and "Field Changes"
  - Configurable default tab
  - Unified styling

```tsx
<UserHistoryTabs
    userId={userId}
    username={username}
    enablePagination={true}
    maxHeight="max-h-[600px]"
    defaultTab="changes"
/>
```

## Integration Points

### 1. ViewUser Page
**Location**: `src/pages/Users/ViewUser/index.tsx`

**Configuration**:
```tsx
<UserHistoryTabs 
    userId={id} 
    username={user.username} 
    enablePagination={false}
    maxHeight="max-h-[600px]"
    defaultTab="changes"
/>
```

**Features**:
- Read-only comprehensive history view
- Emphasis on field changes for inspection
- Compact display suitable for sidebar

### 2. EditUser Page
**Location**: `src/pages/Users/EditUser/index.tsx`

**Configuration**:
```tsx
<UserHistoryTabs 
    userId={id} 
    username={user.username} 
    enablePagination={true}
    maxHeight="max-h-[700px]"
    defaultTab="changes"
/>
```

**Features**:
- Full pagination for detailed editing sessions
- Real-time updates as user makes changes
- Taller display for extended editing sessions

## Visual Design

### Field Change Display
Each audit log entry shows:
- **Field Name**: Human-readable field names (e.g., "Email Address", "User Type")
- **Action Icon**: Visual indicators for different action types
- **Before/After Values**: Color-coded value changes (red → green)
- **Action Type Badge**: Labeled action type (CREATE, UPDATE, etc.)
- **Metadata**: Changed by, IP address, timestamp

### Action Types and Colors
- **CREATE**: Green (UserPlus icon, emerald background)
- **UPDATE**: Blue (Edit icon, blue background)
- **DELETE**: Red (Trash2 icon, red background)
- **ACTIVATE**: Green (ToggleRight icon, green background)
- **DEACTIVATE**: Orange (ToggleLeft icon, orange background)
- **UNLOCK**: Cyan (Unlock icon, cyan background)
- **CHANGE_PASSWORD**: Purple (Key icon, purple background)

### Filtering Options
- **Field Filter**: Dropdown of available fields with human-readable names
- **Action Filter**: Dropdown of available action types
- **Clear Filters**: One-click filter reset

## Usage Patterns

### 1. Basic Field History Tracking
```tsx
import { useUserAudit } from '../hooks/useUserAudit';

const UserComponent = ({ userId }) => {
    const { auditLogs, loading } = useUserAudit({ userId });
    
    return (
        <div>
            {auditLogs.map(log => (
                <div key={log.id}>
                    {log.fieldName}: {log.oldValue} → {log.newValue}
                </div>
            ))}
        </div>
    );
};
```

### 2. Field-Specific History
```tsx
const EmailHistory = ({ userId }) => {
    const { fetchFieldHistory, auditLogs, loading } = useUserAudit({ 
        userId, 
        autoFetch: false 
    });
    
    useEffect(() => {
        fetchFieldHistory('email');
    }, [userId]);
    
    return <div>{/* Email change history */}</div>;
};
```

### 3. Custom Integration
```tsx
const CustomUserHistory = ({ userId, username }) => {
    return (
        <div className="space-y-4">
            {/* Detailed field changes */}
            <UserAuditHistory 
                userId={userId}
                showFieldFilter={true}
                title="Recent Changes"
            />
            
            {/* High-level activities */}
            <UserHistory 
                userId={userId}
                username={username}
                showFilters={false}
                title="Recent Activities"
            />
        </div>
    );
};
```

## API Endpoints Summary

### Action Logs (Username-based)
```bash
GET /admin/logs/user/{username}                    # Recent activities
GET /admin/logs/user/{username}/paginated          # Paginated activities
GET /admin/logs/user/{username}/count              # Activity count
GET /admin/logs/user/{username}/daterange          # Date range activities
GET /admin/logs/filter                             # Filtered activities
GET /admin/logs/search                             # Search activities
```

### Audit Logs (User ID-based)
```bash
GET /admin/users/{userId}/audit-history            # All field changes
GET /admin/users/{userId}/audit-history/paged      # Paginated field changes
GET /admin/users/{userId}/audit-history/field/{fieldName}  # Field-specific changes
```

## Performance Considerations

### 1. Lazy Loading
- Components only fetch data when mounted
- Pagination reduces initial load time
- Field-specific queries minimize data transfer

### 2. Caching Strategy
- API responses are cached by the custom hooks
- Manual refresh available when needed
- Error states handled gracefully

### 3. Optimized Rendering
- Virtualization for large datasets (if needed)
- Efficient re-rendering with proper React keys
- Debounced filtering to prevent excessive API calls

## Error Handling

### 1. API Errors
- Toast notifications for user feedback
- Graceful degradation when endpoints fail
- Clear error messages with dismiss options

### 2. Missing Data
- Appropriate empty states
- Loading indicators during data fetching
- Fallback to existing action logs if audit logs fail

### 3. Permission Errors
- Proper handling of 403/401 responses
- Fallback to limited data when appropriate
- Clear messaging about access restrictions

## Migration Guide

### From Old UserHistory to New Components

#### Before (Old Implementation)
```tsx
<UserHistory 
    userId={id} 
    username={user.username}
    showFilters={true}
    maxHeight="max-h-[600px]"
/>
```

#### After (New Implementation)
```tsx
<UserHistoryTabs 
    userId={id} 
    username={user.username} 
    enablePagination={true}
    maxHeight="max-h-[600px]"
    defaultTab="changes"
/>
```

### Benefits of Migration
1. **Enhanced Detail**: Field-level change tracking
2. **Better UX**: Tabbed interface for different data types
3. **More Context**: Before/after values for all changes
4. **Better Filtering**: Field-specific and action-specific filters
5. **Visual Clarity**: Color-coded actions and clear value changes

## Testing Strategy

### 1. Component Testing
- Test individual components with mock data
- Verify proper error handling
- Test pagination and filtering functionality

### 2. Integration Testing
- Test with real API endpoints
- Verify data flow between components and hooks
- Test different user permission levels

### 3. User Testing
- Verify usability of tabbed interface
- Test filtering and search functionality
- Validate performance with large datasets

## Troubleshooting

### Common Issues

#### 1. Empty Audit Logs
- **Cause**: New feature, historical data may not exist
- **Solution**: Focus on "Activity Logs" tab for historical data

#### 2. Permission Errors
- **Cause**: User lacks access to audit endpoints
- **Solution**: Graceful fallback to action logs only

#### 3. Performance Issues
- **Cause**: Large datasets without pagination
- **Solution**: Enable pagination and reduce page size

#### 4. Type Errors
- **Cause**: Mismatch between UserHistoryItem and UserAuditLog types
- **Solution**: Ensure correct types are used for each component

---

*Updated: Current Date*
*Version: 1.0*
*Integration Complete* 