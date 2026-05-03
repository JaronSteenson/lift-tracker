const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

loadEnvFile(path.resolve(__dirname, '.env.e2e.local'));

const CI = Boolean(process.env.CI);
const baseURL =
    process.env.E2E_BASE_URL ||
    (CI ? 'https://lift-tracker.app' : 'http://localhost:3000');
const isLocalBaseURL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    baseURL,
);

module.exports = defineConfig({
    testDir: './e2e',
    timeout: 120_000,
    expect: {
        timeout: 15_000,
    },
    fullyParallel: false,
    forbidOnly: CI,
    retries: CI ? 2 : 0,
    workers: 1,
    reporter: CI
        ? [['github'], ['html', { open: 'never' }]]
        : [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL,
        actionTimeout: 15_000,
        navigationTimeout: 45_000,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer:
        isLocalBaseURL && process.env.PLAYWRIGHT_SKIP_WEBSERVER !== 'true'
            ? {
                  command: 'npm run dev -- --host localhost',
                  url: baseURL,
                  reuseExistingServer: !CI,
                  timeout: 120_000,
              }
            : undefined,
});

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
        }

        const match = trimmedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

        if (!match) {
            continue;
        }

        const [, key, rawValue] = match;

        if (Object.hasOwn(process.env, key)) {
            continue;
        }

        process.env[key] = unquoteEnvValue(rawValue.trim());
    }
}

function unquoteEnvValue(value) {
    const quote = value.at(0);

    if ((quote !== '"' && quote !== "'") || value.at(-1) !== quote) {
        return value;
    }

    return value.slice(1, -1);
}
