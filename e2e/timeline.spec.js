const { expect, test } = require('@playwright/test');

test('logs in and loads the timeline', async ({ page }) => {
    await page.goto('/');
    await loginWithAuth0(page);

    const timeline = page.locator(
        '[data-testid="timeline-table"]:visible, [data-testid="timeline-card"]:visible',
    );

    await expect(timeline).toBeVisible({ timeout: 60_000 });
    await expect(timeline).toContainText('Timeline');
});

async function loginWithAuth0(page) {
    if (
        await page
            .locator(
                '[data-testid="timeline-table"]:visible, [data-testid="timeline-card"]:visible',
            )
            .isVisible()
            .catch(() => false)
    ) {
        return;
    }

    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;

    if (!email || !password) {
        throw new Error(
            'Set E2E_USER_EMAIL and E2E_USER_PASSWORD in .env.e2e.local or GitHub secrets.',
        );
    }

    await page.getByRole('button', { name: /^Login$/ }).click();

    const emailField = await firstVisibleLocator(page, [
        page.getByLabel(/email/i),
        page.locator('input[name="username"]'),
        page.locator('input[name="email"]'),
        page.locator('input[type="email"]'),
    ]);

    await emailField.fill(email);

    let passwordField = await firstVisibleLocator(
        page,
        [
            page.getByLabel(/^password$/i),
            page.locator('input[name="password"]'),
            page.locator('input[type="password"]'),
        ],
        1_500,
    ).catch(() => null);

    if (!passwordField) {
        await clickAuth0Submit(page);
        passwordField = await firstVisibleLocator(page, [
            page.getByLabel(/^password$/i),
            page.locator('input[name="password"]'),
            page.locator('input[type="password"]'),
        ]);
    }

    await passwordField.fill(password);
    await clickAuth0Submit(page);
    await clickOptionalConsent(page);
}

async function firstVisibleLocator(page, locators, timeout = 15_000) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        for (const locator of locators) {
            const candidate = locator.first();

            if (await candidate.isVisible({ timeout: 250 }).catch(() => false)) {
                return candidate;
            }
        }

        await page.waitForTimeout(250);
    }

    throw new Error('Expected one of the requested locators to become visible.');
}

async function clickAuth0Submit(page) {
    const submitButton = await firstVisibleLocator(page, [
        page.getByRole('button', { name: /^Continue$/i }),
        page.getByRole('button', { name: /^Log in$/i }),
        page.getByRole('button', { name: /^Login$/i }),
        page.locator('button[type="submit"]'),
    ]);

    await submitButton.click();
}

async function clickOptionalConsent(page) {
    const consentButton = await firstVisibleLocator(
        page,
        [
            page.getByRole('button', { name: /^Accept$/i }),
            page.getByRole('button', { name: /^Allow$/i }),
            page.getByRole('button', { name: /^Authorize$/i }),
            page.getByRole('button', { name: /^Continue$/i }),
        ],
        5_000,
    ).catch(() => null);

    if (consentButton) {
        await consentButton.click();
    }
}
