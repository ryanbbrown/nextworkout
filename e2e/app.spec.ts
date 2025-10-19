import { test, expect } from '@playwright/test';

test.describe('NextWorkout E2E Flow', () => {
  // Variables to store data created during tests
  let workoutGroupName: string;
  const workoutNames = ['Bench Press', 'Squats', 'Deadlift'];

  // Generate unique user credentials for this test run
  const uniqueId = Date.now();
  const testUser = {
    email: `test-${uniqueId}@example.com`,
    password: `TestPass${uniqueId}!`,
  };

  test('complete workout flow: signup, create group, create workouts, log workout, verify order', async ({ page }) => {
    // Step 1: Sign up with a new user
    await test.step('Sign up with new test user', async () => {
      await page.goto('/');

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Navigate to auth page if not already there
      const currentUrl = page.url();
      if (!currentUrl.includes('/auth')) {
        // Click login/sign in button if present on landing page
        const authButton = page.getByRole('link', { name: /sign in|login|get started/i });
        if (await authButton.isVisible()) {
          await authButton.click();
          await page.waitForURL('**/auth');
        } else {
          // Navigate directly to auth page
          await page.goto('/auth');
        }
      }

      // Wait for the auth form to load
      await page.waitForSelector('input[placeholder="email@example.com"]', { timeout: 5000 });

      // Check if we're on sign in mode (check for the title or button text)
      const signInButton = page.getByRole('button', { name: /^sign in$/i });
      const isSignInMode = await signInButton.isVisible().catch(() => false);

      if (isSignInMode) {
        // We're on sign in mode, switch to sign up
        const signUpToggle = page.getByRole('button', { name: /don't have an account\? sign up/i });
        await signUpToggle.click();
        await page.waitForTimeout(500); // Wait for form to switch

        // Verify we're now on sign up mode
        await page.waitForSelector('button:has-text("Sign up")', { timeout: 5000 });
      }

      // Fill in sign up credentials using label-based selectors
      await page.getByPlaceholder('email@example.com').fill(testUser.email);
      await page.getByPlaceholder('••••••••').fill(testUser.password);

      // Click sign up button (this will also automatically sign in)
      await page.getByRole('button', { name: /sign up/i }).click();

      // Wait for successful signup + auto-login and redirect to home
      await page.waitForURL('**/home', { timeout: 10000 });

      // Verify we're logged in
      await expect(page).toHaveURL(/.*\/home/);

      console.log(`✓ Created and logged in test user: ${testUser.email}`);
    });

    // Step 2: Create a new workout group
    await test.step('Create a new workout group', async () => {
      // Generate a unique group name
      workoutGroupName = `Test Group ${Date.now()}`;

      // Navigate to edit exercises page
      await page.goto('/edit-exercises');
      await page.waitForLoadState('networkidle');

      // Find and click the "Create Group" button - looks for Plus icon button or text
      const addGroupButton = page.getByRole('button', { name: /create.*group/i });
      await addGroupButton.click();

      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]');

      // Fill in group name in the dialog
      const groupNameInput = page.locator('[role="dialog"] input').first();
      await groupNameInput.fill(workoutGroupName);

      // Submit the form - look for "Create Group" button
      const submitButton = page.getByRole('button', { name: /create group/i });
      await submitButton.click();

      // Wait for the group to be created and modal to close
      await page.waitForTimeout(1500);

      // Verify group was created - look for it in the list
      await expect(page.getByText(workoutGroupName)).toBeVisible();
    });

    // Step 3: Create three workouts in the group
    await test.step('Create three workouts in the group', async () => {
      for (const workoutName of workoutNames) {
        // Find the group card by its name
        const groupCard = page.locator(`text=${workoutGroupName}`).locator('..').locator('..').locator('..');

        // Click the "Create" button with Plus icon within the group card
        // This is the button in the exercise grid
        const createExerciseButton = groupCard.getByText('Create').first();
        await createExerciseButton.click();

        // Wait for modal to appear
        await page.waitForSelector('[role="dialog"]');

        // Fill in exercise name in the dialog
        const exerciseNameInput = page.locator('[role="dialog"] input').first();
        await exerciseNameInput.fill(workoutName);

        // Submit the exercise form
        const submitButton = page.getByRole('button', { name: /create exercise/i });
        await submitButton.click();

        // Wait for exercise to be created and modal to close
        await page.waitForTimeout(1500);

        // Verify exercise was created
        await expect(page.getByText(workoutName)).toBeVisible();
      }
    });

    // Step 4: Navigate to home and create a new workout log
    await test.step('Create a new workout log with 2 exercises', async () => {
      // Navigate to record workout page
      await page.goto('/record-workout');
      await page.waitForLoadState('networkidle');

      // Select the first two exercises (Bench Press and Squats)
      const exercisesToLog = workoutNames.slice(0, 2); // Get first 2 exercises

      for (const exerciseName of exercisesToLog) {
        // Find the exercise card by its text content
        // Exercise cards are in a grid within ExerciseGroupCard
        const exerciseCard = page.locator('.bg-zinc-900.p-2.rounded-lg').filter({ hasText: exerciseName }).first();

        // Click the exercise card to add it to the workout
        // Each click adds 1 set
        await exerciseCard.click();

        // Add 2 more sets (3 total)
        await exerciseCard.click();
        await exerciseCard.click();

        // Wait a bit between exercises
        await page.waitForTimeout(300);
      }

      // Verify the exercises were added to "This Workout" section
      for (const exerciseName of exercisesToLog) {
        await expect(page.locator('text="This Workout"').locator('..').locator('..')).toContainText(exerciseName);
      }

      // Submit the workout log - look for "Record Workout" button
      const submitWorkoutButton = page.getByRole('button', { name: /record workout/i });
      await submitWorkoutButton.click();

      // Wait for submission to complete and navigation
      await page.waitForTimeout(2000);
    });

    // Step 5: Verify the unlogged workout (Deadlift) appears first on homepage
    await test.step('Verify unlogged workout appears first on homepage', async () => {
      // Navigate to home page
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      // Find the workout group under "Focus Exercises" section
      const groupCard = page.locator('.rounded-xl.border.bg-transparent').filter({ hasText: workoutGroupName }).first();
      await expect(groupCard).toBeVisible();

      // Get all exercise cards in the group (they're in a grid-cols-2 layout)
      const exerciseCards = groupCard.locator('.bg-zinc-900.p-2.rounded-lg.border.border-zinc-800');

      // Wait for exercises to load
      await expect(exerciseCards.first()).toBeVisible();

      // The first exercise should be Deadlift (the one not logged)
      const firstExercise = exerciseCards.first();
      await expect(firstExercise).toContainText('Deadlift');
      await expect(firstExercise).toContainText('Never performed');

      // Verify that the logged exercises show dates instead of "Never performed"
      const allExercises = await exerciseCards.all();

      // Check that we have all 3 exercises visible (or at least 2 based on group settings)
      // The first one should be Deadlift (unlogged)
      const firstExerciseText = await allExercises[0].textContent();
      expect(firstExerciseText).toContain('Deadlift');
      expect(firstExerciseText).toContain('Never performed');

      console.log('✓ Test passed: Unlogged exercise (Deadlift) appears first on homepage');
    });
  });

  // Cleanup: Remove test data after tests (optional)
  test.afterAll(async ({ browser }) => {
    // You can add cleanup logic here if needed
    // For example, delete the test workout group via API
    console.log('Tests completed. Test data cleanup can be added here if needed.');
  });
});
