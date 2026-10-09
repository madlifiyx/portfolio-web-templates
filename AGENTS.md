# Agent Instructions

## Required Reading

Before creating, moving, deleting, or changing code, read:

- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- Documentation directly relevant to the requested task

If a user request conflicts with documented architecture, follow the explicit user request and update the architecture documentation in the same change. Ask for clarification when intent is ambiguous.

## Core Rules

- Keep `src/index.ts` as the application composition root.
- Keep browser code in `src/client`.
- Keep server-only code in `src/server`.
- Keep environment-neutral client-server contracts in `src/shared`.
- Follow dependency boundaries in `docs/ARCHITECTURE.md`.
- Organize product capabilities by module.
- Keep code owned by one module inside that module.
- Move code to a `shared` directory only when multiple modules use it.
- Do not create empty placeholder files or directories.
- Do not add layers, abstractions, dependencies, or barrel files without a concrete need.
- Use strict TypeScript in production code, tests, fixtures, mocks, and helpers.
- Do not introduce explicit or implicit `any`.
- Treat untrusted or unvalidated data as `unknown` and narrow it before use.
- Do not bypass type safety with `as any`, double assertions, non-null assertions, or suppression comments.
- Validate untrusted input at server boundaries.
- Keep authentication, authorization, secrets, and database access out of client code.
- Never commit credentials, access tokens, private keys, or other secrets.
- Never bypass Gitleaks or add an allowlist without explicit approval.
- If Gitleaks detects a secret, stop and report the affected file without printing the secret value.
- Use kebab-case for file and directory names.
- Colocate unit tests with source files.
- Keep integration tests in the documented centralized test directories.
- Update `docs/ARCHITECTURE.md` when an architectural rule or active structure changes.
- Follow code quality and reuse rules in `docs/DEVELOPMENT.md`.
- Use Conventional Commits when creating commits.
- Write a specific imperative commit subject that matches the actual change.
- Run Commitlint before completing a requested commit.

## Required Verification

Run before completing code changes:

```bash
bun run check
bun run typecheck
bun run secrets:check
bun run build
```

Use `bun run check:fix` to apply safe Biome fixes and formatting. Run relevant tests when test commands exist. Report any verification command that could not run.
