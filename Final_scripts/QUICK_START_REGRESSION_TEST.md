# Quick Start Guide - Full Regression Test

## Quick Overview

This test script (`Full_Regression_Flow.spec.ts`) automates the complete workflow from patient creation to report verification, covering:
- ✅ Admin login
- ✅ Patient creation (with all mandatory fields)
- ✅ DMS document upload
- ✅ Document verification
- ✅ DOS assignment to lawyer
- ✅ Lawyer login and processing
- ✅ AAA ID entry
- ✅ Reports verification

## Run the Test

### Quick Run (Default Settings)

```bash
cd "Final_scripts"
npx playwright test Full_Regression_Flow.spec.ts
```

### Run with UI Mode (Recommended for First Run)

```bash
npx playwright test Full_Regression_Flow.spec.ts --ui
```

### Custom Credentials

```bash
# Linux/Mac
ADMIN_USERNAME=admin ADMIN_PASSWORD=pass LAWYER_USERNAME=lawyer LAWYER_PASSWORD=pass npx playwright test Full_Regression_Flow.spec.ts

# Windows (PowerShell)
$env:ADMIN_USERNAME="admin"; $env:ADMIN_PASSWORD="pass"; npx playwright test Full_Regression_Flow.spec.ts
```

## Test Flow Summary

```
1. Login as Admin → ✓
2. Create Patient (fname, lname, DOB, phone, email) → ✓
3. Upload DMS Document → ✓
4. Verify Document Visibility → ✓
5. Assign DOS to Lawyer → ✓
6. Logout & Login as Lawyer → ✓
7. Verify in "New Records" → ✓
8. Enter AAA ID → ✓
9. Verify in "Processed Records" → ✓
10. Verify in Reports with Processed Status → ✓
```

## Output

- ✅ 16 screenshots in `test-results/`
- ✅ Console logs for each step
- ✅ Full trace for debugging

## Time Requirements

- **Execution Time**: 5-10 minutes
- **Timeout**: 5 minutes total
- **Screenshots**: 16 per run

## Troubleshooting

### Login Fails
```bash
# Check your credentials
ADMIN_USERNAME=your_admin ADMIN_PASSWORD=your_pass npx playwright test Full_Regression_Flow.spec.ts
```

### Element Not Found
- The test uses flexible selectors
- Check screenshots in `test-results/` for manual verification
- Adjust selectors in the test file if needed

### Timeout Issues
```bash
# Increase timeout
npx playwright test Full_Regression_Flow.spec.ts --timeout=600000
```

## Code Highlights

### TestHelper Class

```typescript
testHelper.login(username, password)      // Login with credentials
testHelper.logout()                       // Logout
testHelper.takeScreenshot(name)          // Capture screenshots
testHelper.waitForNotification()         // Wait for toasts/alerts
testHelper.fillField(selector, value)    // Fill form fields
```

### Test Structure

- ✅ Separate test steps with clear comments
- ✅ Console logging at each step
- ✅ Screenshot capture for verification
- ✅ Error handling with try-catch
- ✅ Unique test data per run

## Important Notes

1. **Test File**: Ensure `files/test-document.pdf` exists or the test will create one
2. **Unique Data**: Each run uses timestamp-based unique IDs to avoid conflicts
3. **Screenshots**: All 16 screenshots are saved for manual review
4. **Flexible**: Works with different UI implementations via flexible selectors

## Next Steps

1. Review the test file: `Full_Regression_Flow.spec.ts`
2. Run with UI mode to watch execution: `--ui`
3. Check screenshots in `test-results/` directory
4. Adjust selectors if needed for your application
5. Integrate into your CI/CD pipeline

## Need Help?

- Check `README_REGRESSION_TEST.md` for detailed documentation
- Review screenshots in `test-results/` for visual verification
- Use `--ui` mode for interactive debugging
- Check console logs for step-by-step progress

Happy Testing! 🚀


