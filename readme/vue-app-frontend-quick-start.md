# Vue App Frontend Quick Start

## Install dependencies
```shell
nvm use 24
npm install
```
## Configure Auth0
```shell
cp config.development.json config.json
```

## Run the dev server
```shell
nvm use 24
npm run hot
```

## Run tests
```shell
nvm use 24
npm test
```

## End-to-end smoke tests
Playwright has one smoke test that signs in with the dedicated Auth0 e2e user and asserts the authenticated timeline loads.

Create an ignored local env file:
```shell
touch .env.e2e.local
```

```dotenv
E2E_USER_EMAIL=your-e2e-user@example.com
E2E_USER_PASSWORD=your-auth0-password
```

Run against production:
```shell
npm run e2e:prod
```

Run against local Vite on `http://localhost:3000`:
```shell
npm run e2e:local
```

For local runs, Playwright starts the Vite dev server if needed. Start the .NET API separately on `http://localhost:5299` when testing against local data.

GitHub Actions runs the smoke test nightly and after successful production deploys. The post-deploy run is a separate workflow, so it reports failures without blocking the deploy. Required GitHub repository secrets:
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

### MCP and agent setup
Codex can use the Playwright MCP server for browser exploration and test maintenance:
```shell
codex mcp add playwright -- npx -y @playwright/mcp@latest --headless
```

JetBrains AI Assistant can use the same MCP server via its MCP JSON configuration:
```json
{
    "mcpServers": {
        "playwright": {
            "command": "npx",
            "args": ["-y", "@playwright/mcp@latest", "--headless"]
        }
    }
}
```

When asking an agent to work on these tests, keep production checks read-only: log in, navigate, and assert loaded UI without creating or deleting workouts.

## Linting and formatting
```shell
nvm use 24
npm lint-fix
```

## License
This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
