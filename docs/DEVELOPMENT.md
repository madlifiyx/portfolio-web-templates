# Development Standards

Status: Active

This document is the source of truth for code quality, readability, TypeScript safety, reuse, error handling, testing behavior, and implementation workflow. File placement and dependency rules remain defined in `docs/ARCHITECTURE.md`.

## Core Principles

- Prefer readable code over clever code.
- Prefer the smallest correct implementation.
- Keep behavior close to its owner.
- Reuse code only when meaning and change reasons are shared.
- Prefer a small amount of duplication over a wrong abstraction.
- Add abstractions, layers, and dependencies only for current requirements.
- Make invalid states difficult to represent.
- Validate data at trust boundaries.
- Use native Bun and web platform APIs before adding dependencies.

## Readability

- Name code after intent and domain meaning, not implementation mechanics.
- Avoid unclear abbreviations and generic names when a precise name is available.
- Use early returns to reduce nesting.
- Keep one primary responsibility per function and file.
- Keep related logic together when splitting it would make reading harder.
- Do not impose arbitrary line-count limits. Extract code when ownership or responsibility becomes clearer.
- Avoid boolean parameters whose meaning is unclear at the call site. Prefer an options object or separate functions.
- Avoid magic strings and numbers when they represent a shared rule or domain concept.
- Remove dead code instead of commenting it out.
- Keep control flow explicit. Avoid nested ternaries and surprising side effects.

## Function Design

- A function should represent one clear operation.
- Separate parsing, validation, business rules, persistence, and transport concerns when they have distinct responsibilities.
- Prefer pure functions for data transformation and business calculations.
- Do not mutate function inputs unless mutation is explicit and required by the API.
- Use an object parameter when arguments are numerous, optional, or easy to confuse.
- Keep return shapes consistent across all branches.
- Do not catch an error only to throw the same error again.
- Keep local helpers local until another real consumer needs them.

## Reuse And Duplication

Extract code only when:

- Behavior has the same meaning.
- Consumers should change together when behavior changes.
- More than one real consumer exists, unless extraction isolates a clear responsibility.
- The abstraction makes call sites easier to understand.
- The abstraction has a clear owner and respects dependency boundaries.

Use this placement order:

```text
One file                -> local function
One module              -> owning module
Multiple client modules -> client/shared
Multiple server modules -> server/shared
Client and server       -> src/shared
```

Do not move code to `shared` for possible future reuse. Prefer duplication when an abstraction would couple unrelated modules.

## Strict TypeScript

All project-authored TypeScript must compile under strict mode. This applies to production code, tests, fixtures, factories, mocks, scripts, and test helpers.

### No `any`

Explicit and implicit `any` are forbidden, including:

- `as any`.
- `any[]` and `Array<any>`.
- Generic defaults or constraints based on `any`.
- Project declaration files that expose `any`.
- Suppression comments added to bypass no-`any` rules.
- Unsafe third-party values escaping an adapter boundary.

Generated code and third-party declarations outside project ownership are exempt, but their unsafe values must be contained at a validated boundary.

### Trust Boundaries

Use `unknown` for unvalidated values, including:

- HTTP request input.
- URL parameters and query values.
- External API responses.
- Parsed JSON.
- Browser storage.
- Environment variables before parsing.
- Values returned by untyped packages.

Narrow `unknown` through a schema, type guard, or explicit runtime checks before use. Native Bun route controllers must apply module schemas before invoking services.

### Assertions

- Do not use type assertions instead of runtime validation.
- `as any` is always forbidden.
- Double assertions are forbidden.
- Avoid non-null assertions.
- An assertion is acceptable only when a platform invariant is already proven but TypeScript cannot express it.

Prefer runtime narrowing:

```ts
const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}
```

### Type Design

- Use `import type` for type-only imports.
- Let TypeScript infer obvious local types.
- Add explicit types at public module, API, storage, and integration boundaries.
- Prefer types inferred from validation schemas over duplicated declarations.
- Use discriminated unions for mutually exclusive states.
- Use precise value types instead of broad object types.
- Do not use `{}`, `object`, `Function`, or broad casts when a precise type can be expressed.
- Catch variables remain `unknown` until narrowed.

## Client Standards

- Keep components focused on rendering and user interaction.
- Keep domain behavior in the module that owns it.
- Do not embed complex business rules inside JSX.
- Do not store values in state when they can be derived during rendering.
- Do not use an effect for synchronous derived values.
- Use effects only to synchronize with external systems.
- Keep module-specific API calls, hooks, constants, and types inside their module.
- Shared components must remain domain-neutral.
- Use semantic HTML and preserve keyboard, focus, labeling, and screen-reader behavior.
- Represent loading, empty, error, and success states explicitly when relevant.
- Keep authentication, authorization decisions, secrets, and database access out of client code.
- Keep server and client initial output deterministic to prevent hydration mismatches.
- Access `window`, `document`, browser storage, and other browser APIs only in browser-safe boundaries.
- Use React Router for client navigation and nested UI routing. Add a matching `Bun.serve()` HTML route for every public client URL.

## Server Standards

Server modules use these responsibility boundaries when needed:

- `index.ts`: exposes module routes and intentional public APIs.
- `controller.ts`: receives native Bun HTTP input, applies schema validation, calls module behavior, and returns a `Response`.
- `schema.ts`: validates request, response, parameter, query, environment, or content values at runtime.
- `service.ts`: contains business rules and workflows independent from HTTP details.
- `repository.ts`: contains module-owned database queries and persistence behavior.
- `policy.ts`: contains resource authorization specific to the module.
- `plugin.ts` or `server/shared/plugins`: composes reusable native Bun server behavior.

Rules:

- Use `Bun.serve()` for HTTP routing and serving client HTML.
- Do not install Elysia or another HTTP framework without an explicit architectural change.
- Validate untrusted input at the server boundary.
- Keep controllers thin when business workflows become non-trivial.
- Do not pass `Request` into services unless the service genuinely owns HTTP behavior.
- Do not return HTTP status codes from repositories.
- Keep authentication and authorization enforced on the server.
- Never trust identity, roles, permissions, or ownership supplied by the client.
- Do not force every endpoint through every possible file when fewer files remain clear.
- Read and validate `SSR_ENABLED` and other environment configuration in one server-owned boundary.
- Never expose server secrets through public environment variables, browser bundles, or SSR payloads.

## Error Handling

- Never silently swallow unexpected errors.
- Do not expose stack traces, database errors, secrets, or internal implementation details to clients.
- Distinguish expected domain errors from unexpected system errors.
- Convert errors to safe `Response` objects at the HTTP boundary.
- Include useful operational context in server logs without logging secrets or sensitive data.
- Show actionable error states in the client.
- Centralize server error handling only when multiple modules need consistent behavior.
- Preserve an original error as a cause when wrapping adds meaningful context.

## Constants And Configuration

- Do not extract a value solely because it appears once.
- Extract values that express a domain rule, require centralized configuration, or have multiple consumers.
- Keep module-owned constants inside their module.
- Keep side-specific shared constants in `client/shared` or `server/shared`.
- Keep constants used by client and server in `src/shared` only when safe for browser bundles.
- Parse server environment variables once and fail fast on invalid configuration.
- Commit only safe placeholders in example environment files.

## Imports And Exports

Group imports in this order:

1. External packages.
2. Absolute project imports.
3. Relative imports.
4. Styles and assets.

Additional rules:

- Prefer named exports.
- Use default exports only when required or strongly supported by a platform convention.
- Use `import type` for type-only dependencies.
- Use a module `index.ts` only as an intentional public API or controller entry.
- Do not create global or per-directory barrel files without a concrete need.
- Avoid circular dependencies.
- Remove unused imports and exports.

## Comments And Documentation

- Prefer self-explanatory code over comments that restate operations.
- Comments should explain intent, constraints, security concerns, or non-obvious tradeoffs.
- Keep comments accurate when behavior changes.
- Do not leave commented-out code.
- Update documentation when changing public contracts, environment variables, commands, architecture, security constraints, or development workflow.

## Testing Standards

Test placement is defined in `docs/ARCHITECTURE.md`.

- Use Bun Test.
- Test behavior and public outcomes, not private implementation details.
- Add a regression test for every bug fix at the lowest reliable level.
- Keep tests deterministic and independent.
- Avoid excessive mocking.
- Do not test behavior owned entirely by third-party libraries.
- Name tests after the condition and expected outcome.
- Cover success, expected failure, authorization, and meaningful edge cases.
- Cover SSR-enabled and SSR-disabled server responses when rendering behavior changes.
- Tests, fixtures, mocks, and helpers follow the same strict TypeScript rules as production code.

## Change Workflow

Before writing code:

1. Read `AGENTS.md`, `docs/ARCHITECTURE.md`, this document, and task-specific documentation.
2. Inspect existing code for ownership, conventions, and reusable behavior.
3. Choose the smallest change that satisfies the requirement.
4. Confirm new dependencies or abstractions are necessary.

Before completion:

1. Remove dead code, unused imports, debug output, and temporary workarounds.
2. Confirm no explicit or implicit `any` was introduced.
3. Confirm untrusted input is validated and narrowed.
4. Confirm dependency and ownership boundaries remain valid.
5. Add or update relevant tests.
6. Update documentation when behavior or architecture changed.
7. Run required checks, relevant tests, typecheck, secret scan, and build.

## Biome

Biome is the formatter, linter, and import organizer. Do not add ESLint or Prettier unless a documented requirement cannot be enforced by Biome.

Commands:

```bash
bun run check
bun run check:fix
bun run format
```

Run `bun run check:fix` after substantial edits, review its changes, then run `bun run check`. Fix issues instead of weakening rules or adding suppression comments.

Tool responsibilities:

```text
Biome      -> formatting, imports, explicit any, lint rules
TypeScript -> implicit any, type safety, module and contract checking
Bun Test   -> behavior and regressions
Bun Build  -> production bundle validation
```

## Secret Detection

Gitleaks detects credentials, access tokens, private keys, and other secrets before they enter repository history.

Commands:

```bash
bun run secrets:staged
bun run secrets:check
```

Rules:

- Never commit credentials, access tokens, private keys, database passwords, session secrets, or production environment values.
- Store local secrets in ignored environment files or an approved secret manager.
- Never bypass Gitleaks or add an allowlist without explicit approval and a documented false-positive reason.
- Use `--redact` so detected values are not printed.

If Gitleaks finds a secret:

1. Stop the commit or push.
2. Identify the affected file without exposing the secret value.
3. Revoke or rotate the credential immediately if it may be real or exposed.
4. Remove the secret from source and replace it with environment-based configuration.
5. If the secret entered Git history, clean history only through an explicitly approved procedure.
6. Run staged and history scans again.

## Conventional Commits

All commit messages follow Conventional Commits and are validated by Commitlint through Husky.

```text
<type>(<scope>): <description>
```

Allowed types:

```text
build chore ci docs feat fix perf refactor revert style test
```

Rules:

- Write a lowercase imperative description.
- Describe the concrete change.
- Do not end the subject with a period.
- Keep the full header at or below 100 characters.
- Keep one logical change per commit.
- Do not bypass the `commit-msg` hook.
- Use `!` and a `BREAKING CHANGE:` footer for breaking changes.

Examples:

```text
feat(server): add configurable react rendering
fix(portfolio): reject invalid project data
docs(architecture): define native bun routing
chore(tooling): configure biome and commitlint
```

## Required Verification

Run before completing code changes:

```bash
bun run check
bun run typecheck
bun run secrets:check
bun run build
```

The standard aggregate command is:

```bash
bun run verify
```

`verify` runs Biome, TypeScript, Gitleaks, and the production build. Run `bun run test` separately when tests exist or when a task adds tests.

Run `bun run test` when tests exist or the task adds tests. Report any command that cannot run.

## Review Checklist

- Names communicate intent.
- Functions and files have clear ownership.
- No explicit or implicit `any` exists.
- No unsafe assertion or suppression bypasses type safety.
- Untrusted input is validated before use.
- Business rules remain in their owning module.
- Shared code has multiple real consumers and a clear owner.
- No premature abstraction, layer, dependency, or barrel was added.
- Client and server boundaries remain intact.
- SSR and client rendering remain deterministic where applicable.
- Errors are handled at the appropriate boundary.
- Accessibility is preserved.
- Relevant tests cover behavior and regressions.
- Documentation matches active behavior.
- Requested commits follow Conventional Commits and pass Commitlint.
- Biome, TypeScript, Gitleaks, relevant tests, and build pass.
