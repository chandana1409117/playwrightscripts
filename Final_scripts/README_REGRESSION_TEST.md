# Full Regression Test Flow

## Overview

This comprehensive Playwright test script covers the complete workflow from patient creation through document management, lawyer assignment, processing, and report verification.

## Test Flow

The test (`Full_Regression_Flow.spec.ts`) executes the following steps in sequence:

### 1. Admin Login
- Logs in as an admin user (default: kumar/Test@123)
- Navigates to the dashboard

### 2. Patient Creation
- Creates a new patient with mandatory details:
  - First Name
  - Last Name
  - Date of Birth (DOB)
  - Phone number
  - Email
  - Patient ID
- Also fills optional fields for completeness (address, city, state, zip, sex)

### 3. DMS Document Upload
- Navigates to DMS (Document Management System)
- Selects practice and patient
- Uploads a PDF document
- Selects document type (ARB)
- Enters From Date and To Date
- Saves the document

### 4. Document Visibility Verification
- Navigates to patient documents page
- Verifies that the uploaded document is visible
- Checks for document type (ARB) in the document list

### 5. DOS Assignment to Lawyer
- Selects the uploaded document
- Assigns it to a lawyer
- Fills required assignment details
- Saves the assignment

### 6. Logout and Lawyer Login
- Logs out as admin
- Logs in as lawyer (default: lawyer/Test@123)

### 7. New Records Verification
- Navigates to "New Records" section
- Searches for the assigned patient
- Verifies patient appears in "New Records"

### 8. AAA ID Entry and Processing
- Opens the patient record
- Enters AAA ID
- Saves the record
- Verifies the record moves from "New Records" to "Processed Records"

### 9. Reports Section Verification
- Navigates to Reports section
- Searches for the patient
- Verifies patient appears with "Processed" status
- Confirms AAA ID is visible

## Configuration

### Environment Variables

You can customize the test behavior using the following environment variables:

```bash
# Base URL (default: http://mdmw.unisoftllc.com)
BASE_URL=http://mdmw.unisoftllc.com

# Admin credentials
ADMIN_USERNAME=kumar
ADMIN_PASSWORD=Test@123

# Lawyer credentials
LAWYER_USERNAME=lawyer
LAWYER_PASSWORD=Test@123
```

### Test Data

The test generates unique test data for each run:
- **Patient**: Auto-generated based on timestamp
- **Patient ID**: `PAT{timestamp}`
- **Email**: `testpatient{timestamp}@test.com`
- **AAA ID**: `AAA{timestamp}`

## Running the Test

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run the Test

```bash
# Run the specific test file
npx playwright test Full_Regression_Flow.spec.ts

# Run with UI mode for debugging
npx playwright test Full_Regression_Flow.spec.ts --ui

# Run with headed browser
npx playwright test Full_Regression_Flow.spec.ts --headed

# Run with specific browsers
npx playwright test Full_Regression_Flow.spec.ts --project=chromium

# Run with custom timeout
npx playwright test Full_Regression_Flow.spec.ts --timeout=300000
```

### Run with Custom Environment Variables

```bash
# Linux/Mac
BASE_URL=https://your-domain.com ADMIN_USERNAME=admin ADMIN_PASSWORD=password npx playwright test Full_Regression_Flow.spec.ts

# Windows
set BASE_URL=https://your-domain.com
set ADMIN_USERNAME=admin
set ADMIN_PASSWORD=password
npx playwright test Full_Regression_Flow.spec.ts
```

## Test Output

The test generates screenshots at each step:

1. `01-admin-login.png` - Admin login successful
2. `02-add-patient-form-initial.png` - Initial patient form
3. `03-add-patient-form-filled.png` - Filled patient form
4. `04-patient-created.png` - Patient creation confirmation
5. `05-dms-document-uploaded.png` - Document upload success
6. `06-patient-documents-visible.png` - Document visibility
7. `07-dos-assigned-to-lawyer.png` - DOS assignment
8. `08-admin-logged-out.png` - Admin logout
9. `09-lawyer-logged-in.png` - Lawyer login
10. `10-new-records-page.png` - New records page
11. `11-patient-in-new-records.png` - Patient in new records
12. `12-aaa-id-entered.png` - AAA ID entry
13. `13-patient-in-processed-records.png` - Patient in processed records
14. `14-reports-page.png` - Reports page
15. `15-patient-in-reports.png` - Patient in reports
16. `16-final-verification.png` - Final verification

Screenshots are saved in the `test-results/` directory.

## Test Structure

### Helper Class: TestHelper

The `TestHelper` class provides reusable methods:

- `login()` - Login with credentials
- `logout()` - Logout from current session
- `waitForNotification()` - Wait for toast/alert messages
- `takeScreenshot()` - Take screenshots with descriptive names
- `selectDropdownOption()` - Select from dropdown
- `selectFirstOption()` - Select first option from dropdown
- `fillField()` - Fill form fields

### Test Configuration

- **Timeout**: 5 minutes (300000ms) for the complete flow
- **Retry**: Automatic retry on failure
- **Screenshots**: Captured at each step
- **Trace**: Enabled for failure analysis

## Error Handling

The test includes robust error handling:

1. **Try-catch blocks** for optional fields
2. **Conditional selectors** for flexibility
3. **Timeout configurations** for stability
4. **Descriptive console logs** for debugging

## Debugging

### View Test Execution

```bash
# Show test with UI
npx playwright test Full_Regression_Flow.spec.ts --ui

# Show trace viewer
npx playwright show-trace test-results/trace.zip
```

### Check Screenshots

All screenshots are saved in `test-results/` directory for manual verification.

### Console Output

The test logs progress at each step:
```
Step 1: Logging in as Admin...
✓ Admin login successful
Step 2: Creating new patient...
✓ Patient created: Test Patient
...
```

## Troubleshooting

### Common Issues

1. **Login fails**: Check credentials in environment variables
2. **Element not found**: Verify selectors match your application
3. **Timeout errors**: Increase timeout in test configuration
4. **Document upload fails**: Ensure test PDF file exists in `files/` directory

### Adjusting Selectors

If your application uses different selectors, update them in the test file:

```typescript
// Before
await page.locator("input[name='username']").fill(username);

// After (your application's selector)
await page.locator("#custom-username-id").fill(username);
```

### Test File Location

The test expects a PDF file for document upload:
- **Location**: `files/test-document.pdf`
- If file doesn't exist, the test will create a minimal PDF automatically

## Extending the Test

### Add New Test Steps

```typescript
// ==========================================
// NEW STEP: Custom Verification
// ==========================================
console.log('Step X: Custom step...');
// Your custom code here
await testHelper.takeScreenshot('XX-custom-step');
console.log('✓ Custom step completed');
```

### Add New Assertions

```typescript
// Add custom assertions
await expect(page.locator('.custom-element')).toBeVisible();
await expect(page.locator('.status')).toContainText('Expected Status');
```

### Add New Helper Methods

```typescript
async customMethod(selector: string): Promise<void> {
  // Your custom logic here
  await this.page.click(selector);
}
```

## Best Practices

1. **Unique Test Data**: Uses timestamps to avoid conflicts
2. **Explicit Waits**: Waits for elements before interaction
3. **Descriptive Logging**: Console logs for each step
4. **Error Recovery**: Try-catch blocks for optional operations
5. **Screenshots**: Captured at each critical step
6. **Clean Code**: Well-documented and structured

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Full Regression Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npx playwright test Full_Regression_Flow.spec.ts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Considerations

- Total execution time: ~5-10 minutes
- Screenshot capture: ~16 screenshots per run
- Network calls: ~15-20 API calls
- Database operations: 5-7 operations

## Support

For issues or questions:
1. Check the test output and screenshots
2. Review console logs for detailed progress
3. Use `--ui` mode for interactive debugging
4. Inspect trace files for failure analysis

## License

This test script is part of the MDManage project test suite.


