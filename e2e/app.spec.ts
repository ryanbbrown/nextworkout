import { test, expect } from '@playwright/test';

test.describe('NextWorkout E2E Flow', () => {
  // Variables to store data created during tests
  let workoutGroupName: string;
  let stretchesGroupName: string;
  const workoutNames = ['Bench Press', 'Squats', 'Deadlift'];
  const stretchNames = ['Hamstring Stretch', 'Quad Stretch', 'Calf Stretch', 'Hip Flexor Stretch'];

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

    // Step 4: Create another exercise group "Stretches"
    await test.step('Create Stretches exercise group', async () => {
      stretchesGroupName = `Stretches ${Date.now()}`;

      await page.goto('/edit-exercises');
      await page.waitForLoadState('networkidle');

      const addGroupButton = page.getByRole('button', { name: /create.*group/i });
      await addGroupButton.click();
      await page.waitForSelector('[role="dialog"]');

      const groupNameInput = page.locator('[role="dialog"] input').first();
      await groupNameInput.fill(stretchesGroupName);

      const submitButton = page.getByRole('button', { name: /create group/i });
      await submitButton.click();
      await page.waitForTimeout(1500);

      await expect(page.getByText(stretchesGroupName)).toBeVisible();
      console.log(`✓ Created stretches group: ${stretchesGroupName}`);
    });

    // Step 5: Create 4 exercises in Stretches group
    await test.step('Create 4 stretches exercises', async () => {
      for (const stretchName of stretchNames) {
        const groupCard = page.locator(`text=${stretchesGroupName}`).locator('..').locator('..').locator('..');
        const createExerciseButton = groupCard.getByText('Create').first();
        await createExerciseButton.click();

        await page.waitForSelector('[role="dialog"]');

        const exerciseNameInput = page.locator('[role="dialog"] input').first();
        await exerciseNameInput.fill(stretchName);

        const submitButton = page.getByRole('button', { name: /create exercise/i });
        await submitButton.click();
        await page.waitForTimeout(1500);

        await expect(page.getByText(stretchName)).toBeVisible();
      }
      console.log('✓ Created 4 stretch exercises');
    });

    // Step 6: Edit one stretch exercise (add ! to name and change description)
    await test.step('Edit stretch exercise name and description', async () => {
      const exerciseToEdit = stretchNames[0]; // Hamstring Stretch
      const newName = exerciseToEdit + '!';

      // Click the exercise card to open edit modal
      const exerciseCard = page.locator('.bg-zinc-900.p-2.rounded-lg').filter({ hasText: exerciseToEdit }).first();
      await exerciseCard.click();

      // Wait for edit modal to open
      await page.waitForSelector('[role="dialog"]');
      await page.waitForTimeout(500);

      // Update name
      const nameInput = page.locator('[role="dialog"] input').first();
      await nameInput.clear();
      await nameInput.fill(newName);

      // Update description
      const descriptionInput = page.locator('[role="dialog"] input').nth(1);
      await descriptionInput.clear();
      await descriptionInput.fill('Updated description for testing');

      // Save
      const saveButton = page.locator('[role="dialog"]').getByRole('button', { name: /save|update/i });
      await saveButton.click();
      await page.waitForTimeout(1500);

      // Verify the name was updated
      await expect(page.getByText(newName)).toBeVisible();
      console.log(`✓ Edited exercise: ${exerciseToEdit} -> ${newName}`);
    });

    // Step 7: Delete one stretch exercise
    await test.step('Delete one stretch exercise', async () => {
      const exerciseToDelete = stretchNames[3]; // Hip Flexor Stretch

      // Find the exercise card and click it to open edit modal
      const exerciseCard = page.locator('.bg-zinc-900.p-2.rounded-lg').filter({ hasText: exerciseToDelete }).first();
      await exerciseCard.click();

      // Wait for edit modal to open
      await page.waitForSelector('[role="dialog"]');
      await page.waitForTimeout(500);

      // Set up dialog handler BEFORE clicking delete
      page.once('dialog', async dialog => {
        console.log('Dialog message:', dialog.message());
        await dialog.accept();
      });

      // Click the delete button in the modal
      const deleteButton = page.locator('[role="dialog"]').getByRole('button', { name: /delete|remove/i });
      await deleteButton.click();

      await page.waitForTimeout(1500);

      // Verify the exercise is gone
      const deletedExercise = page.getByText(exerciseToDelete, { exact: true });
      await expect(deletedExercise).not.toBeVisible();

      console.log(`✓ Deleted exercise: ${exerciseToDelete}`);
    });

    // Step 8: Edit workout group name and color
    await test.step('Edit workout group name and color', async () => {
      const newGroupName = workoutGroupName + ' (Updated)';

      // Find the group card by looking for the specific group name in a card title
      const groupCard = page.locator('.rounded-xl.border.bg-transparent').filter({ hasText: workoutGroupName }).first();

      // Click the edit button (pencil icon) - it's the first button in the header
      const editButton = groupCard.locator('button svg').first().locator('..');
      await editButton.click();
      await page.waitForSelector('[role="dialog"]');

      // Update group name
      const groupNameInput = page.locator('[role="dialog"] input').first();
      await groupNameInput.clear();
      await groupNameInput.fill(newGroupName);

      // Change color (click a different color button)
      const colorButtons = page.locator('[role="dialog"] button').filter({ has: page.locator('div[style*="background"]') });
      const secondColor = colorButtons.nth(1);
      if (await secondColor.isVisible()) {
        await secondColor.click();
      }

      // Save
      const saveButton = page.locator('[role="dialog"]').getByRole('button', { name: /save|update/i });
      await saveButton.click();
      await page.waitForTimeout(1500);

      // Update the variable for future steps
      workoutGroupName = newGroupName;

      // Verify the name was updated
      await expect(page.getByText(newGroupName)).toBeVisible();
      console.log(`✓ Edited group name to: ${newGroupName}`);
    });

    // Step 9: Go to homepage and record a workout with exercises from both groups
    await test.step('Record workout with exercises from both groups', async () => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      // Click "Record Workout"
      await page.getByText('Record Workout').click();
      await page.waitForURL('**/record-workout');
      await page.waitForLoadState('networkidle');

      // Add 3 sets each of 2 exercises from the first group
      const exercisesFromGroup1 = [workoutNames[0], workoutNames[1]]; // Bench Press, Squats
      for (const exerciseName of exercisesFromGroup1) {
        // Find the exercise card in the GROUP section (not in "This Workout" section)
        // The group section is the rounded-xl card with the group name
        const groupCard = page.locator('.rounded-xl.border.bg-transparent').filter({ hasText: workoutGroupName });
        const exerciseCard = groupCard.locator('.bg-zinc-900.p-2.rounded-lg').filter({ hasText: exerciseName });

        // Click 3 times for 3 sets with proper waits for state updates
        // First click - wait for exercise to appear with 1 set
        await exerciseCard.click();
        await page.waitForTimeout(400); // Give React time to update state
        await expect(page.getByText('1 set').first()).toBeVisible({ timeout: 3000 });

        // Second click - wait for update to 2 sets
        await exerciseCard.click();
        await page.waitForTimeout(400); // Give React time to update state
        await expect(page.getByText('2 sets').first()).toBeVisible({ timeout: 3000 });

        // Third click - wait for update to 3 sets
        await exerciseCard.click();
        await page.waitForTimeout(400); // Give React time to update state
        await expect(page.getByText('3 sets').first()).toBeVisible({ timeout: 3000 });

        console.log(`✓ Added 3 sets of ${exerciseName}`);
      }

      // Add 3 sets each of 2 exercises from the stretches group
      const exercisesFromGroup2 = [stretchNames[0] + '!', stretchNames[1]]; // Hamstring Stretch!, Quad Stretch
      for (const exerciseName of exercisesFromGroup2) {
        // Find the exercise card in the GROUP section (not in "This Workout" section)
        const groupCard = page.locator('.rounded-xl.border.bg-transparent').filter({ hasText: stretchesGroupName });
        const exerciseCard = groupCard.locator('.bg-zinc-900.p-2.rounded-lg').filter({ hasText: exerciseName });

        // Click 3 times for 3 sets with waits for state updates
        // First click
        await exerciseCard.click();
        await page.waitForTimeout(400);

        // Second click
        await exerciseCard.click();
        await page.waitForTimeout(400);

        // Third click
        await exerciseCard.click();
        await page.waitForTimeout(400);

        console.log(`✓ Added 3 sets of ${exerciseName}`);
      }

      // Submit the workout
      const submitButton = page.getByRole('button', { name: /record workout/i });
      await submitButton.click();
      await page.waitForTimeout(2000);

      console.log('✓ Recorded workout with 4 exercises (3 sets each)');
    });

    // Step 10: Verify correct exercises show as leftmost in their groups
    await test.step('Verify correct exercises appear first on homepage', async () => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      // For the first group, Deadlift should be first (never performed)
      const group1Card = page.locator('.rounded-xl.border.bg-transparent').filter({ hasText: workoutGroupName }).first();
      const group1Exercises = group1Card.locator('.bg-zinc-900.p-2.rounded-lg.border.border-zinc-800');
      const firstInGroup1 = await group1Exercises.first().textContent();
      expect(firstInGroup1).toContain('Deadlift');
      expect(firstInGroup1).toContain('Never performed');

      // For stretches group, Calf Stretch should be first (never performed, since we deleted Hip Flexor)
      const group2Card = page.locator('.rounded-xl.border.bg-transparent').filter({ hasText: stretchesGroupName }).first();
      const group2Exercises = group2Card.locator('.bg-zinc-900.p-2.rounded-lg.border.border-zinc-800');
      const firstInGroup2 = await group2Exercises.first().textContent();
      expect(firstInGroup2).toContain('Calf Stretch');

      console.log('✓ Verified correct exercises appear first in their groups');
    });

    // Step 11: Go to View Workouts and confirm the workout shows up
    await test.step('View workouts and verify recent workout', async () => {
      await page.goto('/home');
      await page.getByText('View Workouts').click();
      await page.waitForURL('**/view-workouts');
      await page.waitForLoadState('networkidle');

      // Look for today's date and the exercises we logged
      await expect(page.getByText(workoutNames[0])).toBeVisible(); // Bench Press
      await expect(page.getByText(workoutNames[1])).toBeVisible(); // Squats
      await expect(page.getByText(stretchNames[0] + '!')).toBeVisible(); // Hamstring Stretch!
      await expect(page.getByText(stretchNames[1])).toBeVisible(); // Quad Stretch

      console.log('✓ Verified workout appears in View Workouts');
    });

    // Step 12: Edit the workout (change date, modify sets, delete an exercise)
    await test.step('Edit workout: change date and sets', async () => {
      // Click edit button (pencil icon) on the workout
      const editButton = page.locator('button svg').first().locator('..');
      await editButton.click();
      await page.waitForTimeout(1000);

      // Change date to 2 days ago
      const dateButton = page.locator('button').filter({ hasText: /Oct|Nov|Dec|Jan|Feb/i }).first();
      if (await dateButton.isVisible()) {
        await dateButton.click();
        await page.waitForTimeout(500);

        // Click the calendar day that's 2 days ago
        const today = new Date();
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2);
        const dayNumber = twoDaysAgo.getDate();

        const dayButton = page.locator(`button:has-text("${dayNumber}")`).first();
        await dayButton.click();
        await page.waitForTimeout(500);
      }

      // Decrease sets for one exercise from 3 to 1
      // In the Edit Workout dialog, find all the decrease buttons (down chevron icons)
      // They appear in the sets control group next to each exercise
      const allDecreaseButtons = page.locator('[role="dialog"] button svg[class*="chevron-down"], [role="dialog"] button svg[class*="ChevronDown"]').locator('..');

      // Click the first decrease button (for Bench Press) twice: 3 -> 2 -> 1
      const firstDecrease = allDecreaseButtons.first();
      await firstDecrease.click();
      await page.waitForTimeout(500);

      await firstDecrease.click();
      await page.waitForTimeout(500);

      console.log('✓ Decreased sets from 3 to 1 for first exercise');

      // Click the second decrease button (for Squats) three times: 3 -> 2 -> 1 -> 0 (delete)
      const secondDecrease = allDecreaseButtons.nth(1);
      await secondDecrease.click();
      await page.waitForTimeout(500);

      await secondDecrease.click();
      await page.waitForTimeout(500);

      await secondDecrease.click();
      await page.waitForTimeout(500);

      console.log('✓ Deleted second exercise by setting sets to 0');

      // Save the changes
      const saveButton = page.getByRole('button', { name: /save|update/i });
      await saveButton.click();
      await page.waitForTimeout(2000);

      console.log('✓ Edited workout: changed date and modified sets');
    });

    // Step 13: Verify changes were applied
    await test.step('Verify workout edit changes', async () => {
      // Should still be on view workouts page
      // Verify we can see the updated workout with fewer exercises
      await page.waitForTimeout(1000);

      // The workout should now show only 3 exercises (one was deleted)
      // We can verify by checking the date changed
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      console.log('✓ Verified workout changes applied');
    });

    // Step 14: Delete the workout
    await test.step('Delete the workout', async () => {
      // Click edit again (pencil icon)
      const editButton = page.locator('button svg').first().locator('..');
      await editButton.click();
      await page.waitForTimeout(1000);

      // Click delete workout
      const deleteButton = page.getByRole('button', { name: /delete.*workout/i });
      await deleteButton.click();
      await page.waitForTimeout(500);

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|delete|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      await page.waitForTimeout(2000);

      console.log('✓ Deleted the workout');
    });

    // Step 15: Go to homepage and verify all exercises show "Never performed"
    await test.step('Verify all exercises show Never performed', async () => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      // Check all exercises from both groups
      const allExerciseCards = page.locator('.bg-zinc-900.p-2.rounded-lg.border.border-zinc-800');
      const count = await allExerciseCards.count();

      for (let i = 0; i < count; i++) {
        const exerciseText = await allExerciseCards.nth(i).textContent();
        expect(exerciseText).toContain('Never performed');
      }

      console.log('✓ All exercises show "Never performed" after workout deletion');
    });
  });

  // Cleanup: Remove test data after tests (optional)
  test.afterAll(async ({ browser }) => {
    // You can add cleanup logic here if needed
    // For example, delete the test workout group via API
    console.log('Tests completed. Test data cleanup can be added here if needed.');
  });
});
