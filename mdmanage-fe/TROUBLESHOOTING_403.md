# 🔒 Troubleshooting 403 "Access Denied" Error

## Quick Diagnosis

You're getting a **403 Forbidden** error when accessing:
```
http://localhost:9094/mdm-portal-service/api/v1/letter-templates?isActive=true&size=100
```

This means the backend understands your request but is refusing to authorize it.

## 🔍 Step 1: Check Authentication Status

Open your browser's developer console and run:
```javascript
debugAuth()
```

This will show you:
- What authentication tokens are stored
- Where they're stored (localStorage/sessionStorage)
- Token formats and lengths

## 🛠️ Common Solutions

### Solution 1: Login First
If no tokens are found, you need to log in:
1. Navigate to your login page
2. Complete the login process
3. Verify the token is stored correctly
4. Try accessing the letters page again

### Solution 2: Check Token Storage Key
The API expects a token stored as `authToken` in localStorage. If your token is stored differently:

**Option A: Update the API (recommended)**
```typescript
// In src/lib/letterTemplateApi.ts, line ~55
const token = localStorage.getItem('yourTokenKey'); // Change 'authToken' to your key
```

**Option B: Store token as expected**
```javascript
// In your login process
localStorage.setItem('authToken', yourTokenValue);
```

### Solution 3: Verify Token Format
The API sends: `Authorization: Bearer <token>`

Check if your backend expects:
- Different header format
- API key instead of Bearer token
- Additional headers

### Solution 4: Make Endpoint Public (Temporary Testing)
For immediate testing, you can make the endpoint public in your Spring Boot backend:

**In your SecurityConfig.java:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/letter-templates/**").permitAll() // Add this line
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

### Solution 5: Check User Permissions
If you have a token but still get 403, check if your user has the required role:

**Required roles for letter templates:**
- `SUPER_ADMIN` - Full access
- `STAFF` - Read access
- `TEAM_LEAD` - Read/write access

## 🔧 Backend Configuration Check

### CORS Configuration
Ensure your backend allows requests from your frontend:

```java
@CrossOrigin(origins = "http://localhost:3000") // Or your frontend port
@RestController
@RequestMapping("/api/v1/letter-templates")
public class LetterTemplateController {
    // ...
}
```

### Security Configuration
Check your `@PreAuthorize` annotations:

```java
@GetMapping
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STAFF', 'TEAM_LEAD')") // Check this
public ResponseEntity<Page<LetterTemplateDTO>> getAllTemplates(...) {
    // ...
}
```

## 📋 Debugging Checklist

- [ ] Run `debugAuth()` in browser console
- [ ] Check if user is logged in
- [ ] Verify token exists in localStorage as 'authToken'
- [ ] Check token format (should be JWT or similar)
- [ ] Verify backend is running on correct port (9094)
- [ ] Check backend logs for detailed error
- [ ] Test with Postman/curl to isolate frontend vs backend issue
- [ ] Verify user has required permissions
- [ ] Check CORS configuration

## 🧪 Manual Testing

Test the endpoint directly with curl:

```bash
# Without authentication
curl -X GET "http://localhost:9094/mdm-portal-service/api/v1/letter-templates?isActive=true&size=100"

# With authentication (replace YOUR_TOKEN)
curl -X GET "http://localhost:9094/mdm-portal-service/api/v1/letter-templates?isActive=true&size=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Quick Fixes for Development

### Option 1: Bypass Authentication Temporarily
```typescript
// In src/lib/letterTemplateApi.ts - TEMPORARY ONLY
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`;
  // const token = localStorage.getItem('authToken'); // Comment out for testing
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // ...(token && { Authorization: `Bearer ${token}` }), // Comment out for testing
      ...options.headers,
    },
  });
  // ... rest of the method
}
```

### Option 2: Use Mock Token
```javascript
// In browser console - for testing only
localStorage.setItem('authToken', 'mock-token-for-testing');
```

## 🆘 Still Having Issues?

1. **Check backend logs** for detailed error messages
2. **Use browser Network tab** to see exact request/response
3. **Test login flow** to ensure token is generated correctly
4. **Verify database** has users with proper roles
5. **Check JWT token validity** if using JWT

The system will automatically fall back to hardcoded templates if the backend is inaccessible, so you can continue working while fixing the authentication issue. 