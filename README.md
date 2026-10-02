# Notes API automation

An API test suite for the public [Expand Testing Notes API](https://practice.expandtesting.com/notes/api/api-docs/), written in strict TypeScript and Jest. Tests use only a newly registered account and its notes, then delete that account during teardown.

## Requirements

- Node.js 22 or newer (Node.js LTS recommended)
- npm

## Install and run

```sh
npm ci
npm test
```

`npm test` runs Jest serially against the live service. The API base URL defaults to `https://practice.expandtesting.com/notes/api`. To target a compatible environment:

```sh
API_BASE_URL=https://example.test/notes/api npm test
```

Useful commands:

| Command                                   | Purpose                             |
| ----------------------------------------- | ----------------------------------- |
| `npm test`                                | Run the complete suite once         |
| `npm run test:watch`                      | Run Jest in watch mode              |
| `npm run test:health`                     | Run only the read-only health check |
| `npm test -- --testNamePattern="profile"` | Select tests by their names         |
| `npm run typecheck`                       | Check strict TypeScript types       |
| `npm run lint`                            | Run ESLint                          |
| `npm run format:check`                    | Check formatting                    |
| `npm run validate`                        | Run typecheck, lint, and tests      |

## Structure

```text
src/
  api-client.ts       Fetch-based HTTP client and URL-encoded form helper
  config.ts           API URL configuration
tests/
  health-check.spec.ts  Read-only API availability check
  notes-api.spec.ts     Registration, login, profile, and notes lifecycle checks
docs/
  TEST-PLAN.md          Scope, scenarios, data strategy, and known risks
```

The health check is intentionally isolated so it can be run without creating data. The authenticated checks share a disposable account, created by the registration/login test and removed after the suite completes.

## Test accounts and data

The authenticated suite generates a unique email address and password for each run, registers and logs in that account, and keeps its token in memory. It creates one note owned by that account and exercises profile retrieval, note reading, listing, and deletion. An `afterAll` hook deletes the test account, which also removes any remaining notes. If registration succeeds but login fails, teardown retries login once so it can delete the account.

The service is shared and public. Run the suite considerately (one run at a time); avoid adding tests that enumerate, edit, or delete records not created by that test. Credentials are not persisted or printed. If the service remains unavailable or the retry also fails after registration, teardown reports a failure but the account may remain; the generated credentials are lost when the test process exits, so this is a known cleanup limitation.

## Results

Jest reports results to the terminal. No test report or persistent test data is written by default.

## Test plan and scope

The detailed test plan, including case IDs, expected outcomes, isolation strategy, and known risks, is in [docs/TEST-PLAN.md](./docs/TEST-PLAN.md).

### Included

- **Health check:** the API reports that it is running.
- **Register and log in:** a unique test user is created and authenticated.
- **Get profile:** the authenticated user retrieves their profile.
- **Notes lifecycle:** the user creates, reads, lists, and deletes their own note.
- **Unauthenticated notes access:** listing notes without a token is rejected.
- **Invalid login:** logging in with an unknown email is rejected.
- Cleanup of the test account, including any notes left behind after a failed test.

These checks exercise the authentication boundary and the highest-value notes lifecycle while keeping mutations scoped to disposable test data.

### Future expansion

- Cross-account ownership checks are the highest-priority next tests because ownership is central to the API. They require a second disposable account and careful cleanup.
- Note update and completion-status behavior are documented operations to add after the selected create/read/list/delete lifecycle.
- Profile mutation, password reset/change, and logout can be added as separate account-workflow coverage; password reset requires a reliable email/token strategy.
- Focused validation and boundary tests should follow once expected response schemas and observed behaviors are established.
- Load, concurrency, and destructive tests should only run in an explicitly isolated environment, not against this shared public service.

## API observations and automation notes

- The Swagger UI is at `/notes/api/api-docs/`; its OpenAPI 2.0 document is served at `/notes/api/swagger.json`. A path such as `/notes/api/api-docs/swagger.json` serves the UI HTML instead of a JSON document.
- The specification documents form fields for registration, login, and notes, and lists the note categories as `Home`, `Work`, and `Personal`. Live probing showed that registration accepts URL-encoded fields but rejects multipart form data.
- Registration requires a 4–30 character name and 6–30 character password. These constraints are not stated in the API specification and are respected by the generated test account.
- The published specification does not define response schemas or request `consumes` media types. The suite checks only the response fields needed to continue (for example, the login token and created note identifier), and verifies other behavior through status codes and returned values.

## Next steps

- Add an isolated cross-account authorization test as the highest-priority next test, covering at least reading another user's note and, if safe to verify, update/delete authorization.
- Add note update and completion-status tests.
- Add contract assertions for response schemas once documented or repeatedly observed.
- Add a CI workflow that runs typecheck, lint, and the read-only health check by default, with live mutation tests enabled deliberately.
