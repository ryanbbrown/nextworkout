# E2E Testing with Playwright

This directory contains end-to-end tests for the NextWorkout application using Playwright.

## Setup

### 1. Install Dependencies

Dependencies should already be installed, but if needed:

```bash
npm install
```

### 2. Configure Test Environment (Optional)

The `.env.test` file is already set up with defaults. You only need to change it if your app runs on a different port:

```bash
# .env.test (already exists)
PLAYWRIGHT_BASE_URL=http://localhost:8080
```

**Note**: Test users are automatically created! Each test run signs up with a unique email like `test-1234567890@example.com`.

### 3. Configure Supabase for Auto-Signup

To allow automated user creation, ensure email confirmation is disabled in your Supabase instance:

1. Go to your Supabase dashboard
2. Navigate to Authentication → Email Templates
3. Under "Confirm signup", set to auto-confirm or disable email confirmation

This allows the test to create users without manual email verification.

## Running Tests

### Run all tests (headless mode)

```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Debug tests

```bash
npm run test:e2e:debug
```

## Test Flow

The main test (`app.spec.ts`) performs the following actions:

1. **Sign Up**: Automatically creates a new user with unique credentials (e.g., `test-1234567890@example.com`)
2. **Create Workout Group**: Creates a new workout group with a unique name
3. **Create Workouts**: Creates 3 exercises in the group:
   - Bench Press
   - Squats
   - Deadlift
4. **Log Workout**: Creates a workout log for 2 of the 3 exercises (Bench Press and Squats)
5. **Verify Order**: Confirms that the unlogged exercise (Deadlift) appears first on the homepage

## Supabase Testing Strategy

This test suite uses your actual Supabase instance with automatically created test users. Here are the key points:

### Approach

- **Real Database**: Tests run against your actual Supabase database
- **Auto-Generated Users**: Each test run creates a new user (e.g., `test-1234567890@example.com`)
- **Data Cleanup**: Test data is created with unique names (timestamps) to avoid conflicts
- **No Mocking**: Full integration testing with real authentication and database operations

### Alternative Approaches (Not Implemented)

If you need more isolation, consider:

1. **Supabase Local Development**: Use `supabase start` to run a local Supabase instance
2. **Test Database**: Create a separate Supabase project for testing
3. **Database Seeding**: Reset test user data before each test run

## Troubleshooting

### Tests fail at signup

- Ensure email confirmation is disabled in Supabase (or set to auto-confirm)
- Check that signup is enabled in Supabase Auth settings
- Verify the Supabase URL and keys in your app's environment are correct
- Ensure your Supabase instance is running and accessible

### Tests fail at UI interactions

- Run tests in headed mode (`npm run test:e2e:headed`) to see what's happening
- The UI selectors may need adjustment based on your actual component structure
- Check the Playwright report: `npx playwright show-report`

### Development server doesn't start

- Ensure no other process is running on port 5173
- Check that `npm run dev` works correctly outside of tests

## Updating Tests

The test file (`app.spec.ts`) uses flexible selectors that should work with common UI patterns. If your UI structure changes significantly, you may need to update:

- Button selectors (e.g., "Add Group", "Create", etc.)
- Input field selectors
- Navigation patterns

Use Playwright's `--debug` mode or UI mode to help identify the correct selectors.

## CI/CD Integration

To run these tests in CI:

1. Ensure test user credentials are set as environment variables
2. The app needs to be running (or use a deployed preview URL)
3. Update `PLAYWRIGHT_BASE_URL` to point to the test environment

Example GitHub Actions workflow:

```yaml
- name: Run E2E tests
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    PLAYWRIGHT_BASE_URL: https://your-preview-url.com
  run: npm run test:e2e
```
