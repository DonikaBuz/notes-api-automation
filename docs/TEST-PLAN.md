# Notes API test plan

## Objective

Validate the most valuable basic and negative behaviors of the Notes API using a small, repeatable Jest suite. Tests run against the public API and must not read, change, or delete data belonging to other users.

## System under test

- Swagger UI: <https://practice.expandtesting.com/notes/api/api-docs/>
- API base URL: `https://practice.expandtesting.com/notes/api`
- API specification: `GET /swagger.json`

## In-scope test cases

| ID      | Scenario                          | Type     | Expected result                                                                                                     | Data and isolation                                                                           |
| ------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| API-001 | Check API health                  | Basic    | `GET /health-check` returns HTTP 200 and a successful health payload.                                               | Read-only; no account or note data.                                                          |
| API-002 | Register and log in               | Basic    | A newly registered unique user receives HTTP 201; login succeeds with HTTP 200 and returns an authentication token. | Generates a unique email and valid-length credentials for each run.                          |
| API-003 | Retrieve own profile              | Basic    | An authenticated request returns HTTP 200 and a profile email matching the test user's email.                       | Uses the disposable account from API-002.                                                    |
| API-004 | Manage own note                   | Basic    | The user can create a note, retrieve it by ID, find it in their notes list, and delete it successfully.             | Creates one note under the disposable account; never selects a note not created by this run. |
| API-005 | List notes without authentication | Negative | `GET /notes` without an auth token is rejected with HTTP 401.                                                       | Read-only request without account data.                                                      |
| API-006 | Log in with an unknown email      | Negative | Login with a unique unregistered email is rejected with HTTP 401.                                                   | Does not create or modify an account.                                                        |

The Jest test names and implementation are in `tests/health-check.spec.ts` and `tests/notes-api.spec.ts`.

## Test data and cleanup

- Registration uses a fresh UUID-derived name, email, and password on each run.
- The API client submits form fields as URL-encoded data.
- The suite stores the auth token in memory and does not print or persist credentials.
- Note creation, read, listing, and deletion are scoped to the disposable user's note.
- Teardown deletes the disposable user, which also removes any remaining notes.
- If registration succeeds but login fails, teardown retries login once to obtain a token for account deletion.
- If the service is unavailable or login retry/deletion fails, an account may remain. The generated credentials are not persisted, so manual cleanup may not be possible; this is a known limitation of testing against the shared public service.
- Run the live suite serially and avoid repeated unnecessary runs.

## Future expansion

- **Cross-account authorization (highest priority):** add a second disposable user and verify they cannot read, update, or delete the first user's note. Ownership is central to the application; keep both accounts and notes isolated and clean them up.
- **Note update and completion status:** exercise the documented full update and completion-status patch operations, including checking returned or subsequently retrieved values.
- **Profile updates, password reset/change, and logout:** add these account workflows individually. Password reset needs a reliable email/token strategy before it can be automated dependably.
- **Validation and boundary cases:** add focused invalid-input tests after documenting expected response schemas and confirming observed service behavior.
- **Load, concurrency, and destructive testing:** consider only in an explicitly isolated environment, not against this shared public practice API.

## Approach and risks

- Jest is run in-band so mutations do not race and test execution remains considerate to the shared service.
- Assertions focus on documented status codes and observed response fields needed by the workflow. The API documentation does not define response schemas.
- The API requires URL-encoded registration fields in observed behavior, despite the Swagger spec leaving `consumes` unspecified. Multipart registration was observed to fail.
- Registration names must be 4–30 characters and passwords 6–30 characters; these observed constraints are not stated in the specification.
- The negative tests assert the observed HTTP 401 responses. A service behavior change may require updating those expectations and recording the evidence.

## Execution

From the repository root:

```sh
npm ci
npm test
```

Run the health check alone with `npm run test:health`. Select individual cases with Jest's test-name filter, for example:

```sh
npm test -- --testNamePattern="unknown email"
```
