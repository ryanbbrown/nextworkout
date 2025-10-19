# Quick Start: E2E Testing

## First Time Setup (Do This Once)

### Configure Your Test Environment (Optional)

The `.env.test` file is already set up with defaults. You only need to edit it if you want to change the base URL:

```bash
# Only change this if your app runs on a different port
PLAYWRIGHT_BASE_URL=http://localhost:8080
```

**Note**: Test users are automatically created! Each test run signs up with a unique email like `test-1234567890@example.com`. No manual setup required! ✨

## Running Tests

### Interactive Mode (Recommended for First Time)

```bash
npm run test:e2e:ui
```

This opens the Playwright UI where you can:
- See all tests
- Run tests individually
- Watch tests run in real-time
- Time-travel through test steps
- See detailed traces

### Headless Mode (Default)

```bash
npm run test:e2e
```

Runs tests in the background, suitable for CI/CD.

### Headed Mode (See the Browser)

```bash
npm run test:e2e:headed
```

Watch the browser as tests run (good for debugging).

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

## What the Test Does

1. ✅ Signs up a new user with unique credentials (e.g., `test-1234567890@example.com`)
2. ✅ Creates a new workout group (with unique name)
3. ✅ Creates 3 exercises: Bench Press, Squats, Deadlift
4. ✅ Records a workout for 2 exercises (Bench Press, Squats)
5. ✅ Verifies Deadlift appears first on homepage (as unlogged)

## Troubleshooting

### "Test user signup failed"
- Check that Supabase email confirmation is disabled (or set to auto-confirm)
- Verify your Supabase instance is running and accessible
- Check that signup is enabled in Supabase Auth settings

### "Cannot find element"
- Try running in headed mode to see what's happening: `npm run test:e2e:headed`
- Check if your UI has changed - selectors might need updating

### "Port 5173 already in use"
- Stop your dev server if it's already running
- Playwright will start its own dev server

### View Test Report

After tests run:

```bash
npx playwright show-report
```

This opens an HTML report with:
- Test results
- Screenshots (if failures)
- Traces for debugging
- Timing information

## Next Steps

- Review `e2e/README.md` for detailed documentation
- Read `E2E_TESTING_SETUP.md` for complete setup guide
- Check the test file: `e2e/app.spec.ts`

## Important Notes

⚠️ **Test Data**: Tests create real data in your Supabase database. Each test run creates:
- 1 new test user account (e.g., `test-1234567890@example.com`)
- 1 new workout group (with timestamp in name)
- 3 new exercises
- 1 workout log

You may want to periodically clean up test users and data from your database.

🔒 **Auto-Signup**: The test automatically creates a new user each time, so no manual user setup needed!

🚀 **CI/CD**: GitHub Actions workflow is set up in `.github/workflows/e2e-tests.yml`.
