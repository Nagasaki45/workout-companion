import { test, expect } from '@playwright/test';

test('create, view, and delete workout', async ({ page }) => {
	// Homepage
	await page.goto('/');
	await expect(page.getByRole('heading', { name: '💪 Workout companion' })).toBeVisible();
	await page.getByRole('button', { name: '+ New Workout' }).click();

	// View page
	await expect(page.getByRole('heading', { name: 'New Workout' })).toBeVisible();
	await page.getByRole('link', { name: 'Edit' }).click();

	// Edit page
	// TODO Add a name label and target the input by label
	await page.getByRole('textbox').first().fill('My test workout');
	await page.getByRole('button', { name: 'Save' }).click();

	// Checking the edit on the homepage
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'My test workout' })).toBeVisible();
	await page.getByRole('link', { name: 'My test workout' }).click();

	// Back to the view page to delete
	await expect(page.getByRole('heading', { name: 'My test workout' })).toBeVisible();
	page.on('dialog', dialog => dialog.accept());
	await page.getByRole('button', { name: 'Delete Workout' }).click();

	// Make sure we are back in the homepage
	await expect(page.getByRole('heading', { name: '💪 Workout companion' })).toBeVisible();
});


test('run a workout', async ({ page }) => {
	// Homepage
	await page.goto('/');
	await page.getByRole('button', { name: '+ New Workout' }).click();

	// View page
	await page.getByRole('link', { name: 'Edit' }).click();

	// Edit page
	await page.getByRole('textbox', { name: 'Name' }).fill('time based');
	await page.getByRole('textbox', { name: 'Amount' }).fill('1');
	await page.getByRole('button', { name: '+ Add Exercise' }).click();
	await page.locator('#ex-name-0-1').fill('reps based');
	await page.locator('#ex-amount-0-1').fill('1');
	await page.getByRole('button', { name: 'Save' }).click();

	// Back to view page
	await page.getByRole('link', { name: 'Start Workout' }).click();

	// Running exercise
	await page.getByRole('button', { name: 'Start' }).click();
	await expect(page.getByRole('heading', { name: 'time based' })).toBeVisible();

	// After 1 second we should be at the reps based exercise
	await expect(page.getByRole('heading', { name: 'reps based' })).toBeVisible();
	await expect(page.getByText('1 reps')).toBeVisible();

	// 'Next' at the end of the reps based exercise
	await page.getByRole('button', { name: 'Next' }).click();

	// Workout completed
	await expect(page.getByRole('heading', { name: 'Workout Complete! 🎉' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Go Home' })).toBeVisible();
	await page.getByRole('button', { name: 'Go Home' }).click();
});

test('raw editing', async ({ page }) => {
	// Homepage
	await page.goto('/');
	await page.getByRole('link', { name: 'Edit' }).click();

	// Raw edit page
	await page.getByRole('textbox').fill('workouts:\n  - name: Raw edit test workout\n    rounds:\n      - count: 1\n        rest_after_round: 0\n        exercises:\n          - name: Raw edit exercise\n            type: time\n            amount: 45\n            sets: 1\n            rest: 0\n');
	await page.getByRole('button', { name: 'Save All Workouts' }).click();

	// Back in homepage after save
	await page.getByRole('link', { name: 'Raw edit test workout' }).click();

	// View page
	await expect(page.getByText('Raw edit exercise')).toBeVisible();
});
