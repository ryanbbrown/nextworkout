# E2E Testing Setup - Complete Guide

This document provides a complete overview of the Playwright end-to-end testing setup for NextWorkout.

## What Was Set Up

### 1. Playwright Installation
- ✅ Installed `@playwright/test` as a dev dependency
- ✅ Installed Chromium browser for testing
- ✅ Installed supporting packages (`dotenv`, `@types/node`)

### 2. Configuration Files

#### `playwright.config.ts`
- Located at the project root
- Configures test directory (`./e2e`)
- Sets up web server to run dev environment before tests
- Loads environment variables from `.env.test`
- Configured for Chromium browser
- Base URL: `http://localhost:5173` (configurable via `PLAYWRIGHT_BASE_URL`)

#### `.env.test` and `.env.test.example`
- `.env.test`: Your actual test credentials (gitignored)
- `.env.test.example`: Template for setting up test environment
- Required variables:
  - `TEST_USER_EMAIL`: Email for test user
  - `TEST_USER_PASSWORD`: Password for test user
  - `PLAYWRIGHT_BASE_URL`: Base URL of the app

#### `.gitignore` Updates
Added entries for:
- `.env.test`
- `/test-results/`
- `/playwright-report/`
- `/playwright/.cache/`

### 3. Test Files

#### `e2e/app.spec.ts`
Main test file that implements the complete user flow:

1. **Login**: Authenticates with test user credentials
2. **Create Workout Group**: Creates a group with a unique timestamped name
3. **Create 3 Exercises**: Adds Bench Press, Squats, and Deadlift to the group
4. **Log Workout**: Records a workout with 2 of the 3 exercises (Bench Press and Squats)
5. **Verify Order**: Confirms unlogged exercise (Deadlift) appears first on homepage

The test uses accurate selectors based on your actual UI implementation:
- Form inputs and buttons
- Modal dialogs
- Exercise cards with specific CSS classes
- Group cards with border colors

#### `e2e/README.md`
Comprehensive documentation including:
- Setup instructions
- How to run tests
- Test flow explanation
- Supabase testing strategy
- Troubleshooting guide
- CI/CD integration tips

### 4. NPM Scripts

Added to `package.json`:
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug"
}
```

### 5. GitHub Actions Workflow (Bonus)

#### `.github/workflows/e2e-tests.yml`
CI/CD workflow that:
- Runs on pushes to main/develop and pull requests
- Sets up Node.js environment
- Installs dependencies and Playwright browsers
- Creates `.env.test` from GitHub secrets
- Runs tests
- Uploads test reports as artifacts

## Supabase Testing Strategy

### Current Approach: Real Database Testing

The setup uses your actual Supabase instance with these characteristics:

**Pros:**
- True integration testing
- Tests real authentication flow
- No mocking complexity
- Tests actual database operations

**Cons:**
- Tests create real data
- Requires test user setup
- Can't easily reset state

### How It Works

1. **Test User**: Create a dedicated user in your Supabase dashboard
2. **Isolation**: Tests use unique names (timestamps) to avoid conflicts
3. **No Cleanup**: Test data persists (can be manually deleted)

### Alternative Approaches (Not Implemented)

If you need more isolation in the future:

1. **Supabase Local Development**
   ```bash
   supabase start
   supabase db reset
   ```
   - Pros: Complete isolation, easy reset
   - Cons: Requires Docker, additional setup

2. **Separate Test Project**
   - Create a dedicated Supabase project for testing
   - Point tests to this project
   - Pros: Production data safety
   - Cons: Another project to manage

3. **Database Seeding & Cleanup**
   - Add beforeEach/afterEach hooks to reset test user data
   - Pros: Clean slate for each test
   - Cons: More complex test code

## Getting Started

### Step 1: Configure Environment (Optional)

The `.env.test` file is already configured with defaults. You only need to change it if your app runs on a different port:

```bash
# .env.test (already exists)
PLAYWRIGHT_BASE_URL=http://localhost:8080
```

**Note**: Test users are automatically created! Each test run signs up with a unique email like `test-1234567890@example.com`.

### Step 2: Ensure Supabase Email Confirmation is Disabled

For automated testing, you need to disable email confirmation in Supabase:

1. Go to your Supabase dashboard
2. Navigate to Authentication → Email Templates
3. Under "Confirm signup", set to auto-confirm or disable confirmation

Alternatively, you can use a test email provider that auto-confirms.

### Step 3: Run Tests

```bash
# Headless mode (default)
npm run test:e2e

# Interactive UI mode (recommended for development)
npm run test:e2e:ui

# See the browser (headed mode)
npm run test:e2e:headed

# Debug mode with inspector
npm run test:e2e:debug
```

## Understanding the Test Flow

The test is structured as a single test with multiple steps to ensure proper sequencing:

```typescript
test('complete workout flow', async ({ page }) => {
  // Unique user created automatically each run
  const uniqueId = Date.now();
  const testUser = {
    email: `test-${uniqueId}@example.com`,
    password: `TestPass${uniqueId}!`,
  };

  await test.step('Sign up', async () => { ... });
  await test.step('Create group', async () => { ... });
  await test.step('Create workouts', async () => { ... });
  await test.step('Log workout', async () => { ... });
  await test.step('Verify order', async () => { ... });
});
```

Each step depends on the previous step's data, so they must run sequentially.

## Troubleshooting

### Tests fail at signup
- Ensure email confirmation is disabled in Supabase (or set to auto-confirm)
- Check that signup is enabled in Supabase Auth settings
- Verify Supabase URL and keys are correct in your app environment
- Check that the Supabase instance is running and accessible

### Selectors not finding elements
- Run in headed mode: `npm run test:e2e:headed`
- Use debug mode: `npm run test:e2e:debug`
- Check Playwright inspector
- View the HTML report: `npx playwright show-report`

### Dev server doesn't start
- Ensure port 5173 is available
- Check that `npm run dev` works standalone
- Look for errors in Playwright output

### Modal dialogs not appearing
- Increase wait times if network is slow
- Check that dialog triggers are working in manual testing
- Verify `[role="dialog"]` selector matches your UI

## CI/CD Setup

To run tests in GitHub Actions:

1. Add secrets to your repository (Settings → Secrets and variables → Actions):
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `SUPABASE_URL` - Same as VITE_SUPABASE_URL (for server)
   - `SUPABASE_ANON_KEY` - Same as VITE_SUPABASE_ANON_KEY (for server)
   - `SUPABASE_SERVICE_KEY` - Your Supabase service/secret key

2. Ensure email confirmation is disabled in Supabase (required for auto-signup)

3. The workflow will automatically run on:
   - Pushes to main/develop
   - Pull requests to main/develop
   - Manual trigger (workflow_dispatch)

4. Test reports are saved as artifacts for 30 days

**Note**: No test user credentials needed! The workflow automatically creates unique users for each test run.

## Extending the Tests

### Adding More Tests

Create new test files in the `e2e/` directory:

```typescript
// e2e/workout-history.spec.ts
import { test, expect } from '@playwright/test';

test('view workout history', async ({ page }) => {
  // Your test code
});
```

### Adding Test Helpers

Create a `e2e/helpers/` directory for shared utilities:

```typescript
// e2e/helpers/auth.ts
export async function login(page, email, password) {
  // Reusable login logic
}
```

### Using Fixtures

For shared state or setup:

```typescript
// e2e/fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login logic
    await use(page);
  },
});
```

## Best Practices

1. **Use test.step()**: Makes test reports more readable
2. **Avoid hard waits**: Prefer `waitForSelector` over `waitForTimeout` when possible
3. **Descriptive selectors**: Use accessible selectors (roles, labels) over CSS classes
4. **Independent tests**: Each test should be able to run in isolation
5. **Clean test data**: Use unique identifiers (timestamps) to avoid conflicts

## Next Steps

Consider adding:
- [ ] Visual regression testing with Playwright screenshots
- [ ] API testing for backend endpoints
- [ ] Performance testing with Lighthouse
- [ ] Accessibility testing with axe-core
- [ ] More test scenarios (error cases, edge cases)
- [ ] Database seeding/cleanup utilities
- [ ] Custom Playwright reporters

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [GitHub Actions for Playwright](https://playwright.dev/docs/ci)

---

**Questions or Issues?**
- Check the `e2e/README.md` for detailed instructions
- Review test output and reports
- Run tests in debug mode for investigation
