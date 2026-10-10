# Application Architecture

Status: Active

This document is the source of truth for active application structure, module ownership, dependency direction, file placement, naming, and test placement.

## Principles

- Organize application capabilities by module, not by global technical layer.
- Keep code near the module that owns it.
- Share code only after more than one module needs it.
- Keep client, server, and cross-environment code explicitly separated.
- Use Bun as package manager, bundler, development server, production runtime, and HTTP router.
- Prefer the smallest structure that keeps ownership clear.

## Top-Level Source Structure

```text
src/
├── index.ts
├── client/
│   ├── index.html
│   ├── frontend.tsx
│   ├── app.tsx
│   ├── modules/
│   ├── shared/
│   └── tests/
├── server/
│   ├── app.ts
│   ├── modules/
│   ├── shared/
│   └── tests/
└── shared/
    ├── constants/
    ├── schemas/
    ├── types/
    └── utils/
```

This is a target structure, not a requirement to create every directory immediately. Git does not track empty directories. Create a directory only when it contains required code.

## Composition Root

`src/index.ts` is the application composition root.

It may:

- Start the Bun server.
- Import the client HTML entry.
- Import and mount the server application or server modules.
- Connect top-level application dependencies.

It must not contain:

- Business rules.
- Database queries.
- Feature-specific request handlers.
- Reusable client or server utilities.

As server routes grow, `src/server/app.ts` owns native Bun application assembly while `src/index.ts` remains the runtime entry point.

## Client Architecture

```text
src/client/
├── index.html
├── frontend.tsx
├── app.tsx
├── modules/
│   └── <module>/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       ├── lib/
│       ├── types/
│       └── index.ts
├── shared/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── tests/
    ├── fixtures/
    ├── helpers/
    ├── integration/
    └── setup.ts
```

### Client Entry Files

`index.html` is the browser HTML entry.

`frontend.tsx` bootstraps or hydrates React into the DOM. It must stay small and must not own feature logic.

`app.tsx` is the React application root. It composes global providers and the React Router provider. HTTP route ownership remains in the Bun server, while React Router owns client navigation and nested UI composition.

### Client Modules

`src/client/modules/<module>` owns client code for one product capability or domain.

The active client currently has one `portfolio` module. Its public `index.ts` owns the React Router configuration exported to `src/client/app.tsx`.

The `dashboard` module owns authenticated content editing, media management, draft preview, and publishing UI. Entity editors use list-and-drawer flows with per-entity persistence. Platform records are seeded suggestions selected inside contact and project forms, not a primary dashboard capability. `src/client/app.tsx` composes portfolio and dashboard route definitions.

Example:

```text
src/client/modules/portfolio/
├── components/
│   ├── project-card.tsx
│   └── project-card.test.tsx
├── hooks/
├── lib/
├── types/
└── index.ts
```

Subdirectories are optional. A small module should use a flat structure until more grouping is useful.

Module ownership rules:

- Domain-aware components stay in their module.
- Hooks used only by one module stay in that module.
- API calls for one module stay in that module.
- Constants and types used only by one module stay in that module.
- `index.ts` exposes only the module's intentional public API.
- Avoid imports into another module's internal paths. Import its public API instead.

### Client Shared

`src/client/shared` contains client-only code used by multiple client modules.

- `components`: domain-neutral reusable UI primitives.
- `constants`: browser or UI constants used by multiple modules.
- `hooks`: domain-neutral hooks used by multiple modules.
- `lib`: shared client infrastructure such as an HTTP client or browser storage adapter.
- `types`: client-only types used by multiple modules.

Code used frequently is not automatically shared. Domain ownership takes priority. Do not place server contracts in `client/shared`; put environment-neutral client-server contracts in `src/shared`.

## Server Architecture

The server uses native `Bun.serve()` and follows a feature-based module structure. Do not install a server framework for behavior provided by Bun.

Active server modules:

- `auth`: single-administrator credentials and server-side sessions.
- `portfolio`: revisioned portfolio aggregate, draft replacement, and atomic publishing.
- `media`: RustFS upload, proxy delivery, asset listing, and safe deletion.

`src/server/shared/database` owns the native `Bun.SQL` migration infrastructure. `src/server/shared/config` validates environment configuration once at startup.

```text
src/server/
├── app.ts
├── modules/
│   └── <module>/
│       ├── index.ts
│       ├── controller.ts
│       ├── schema.ts
│       ├── service.ts
│       ├── repository.ts
│       ├── policy.ts
│       ├── constants.ts
│       ├── types.ts
│       └── utils.ts
├── shared/
│   ├── auth/
│   ├── database/
│   ├── errors/
│   ├── plugins/
│   ├── constants/
│   ├── types/
│   └── utils/
└── tests/
    ├── fixtures/
    ├── helpers/
    ├── integration/
    └── setup.ts
```

Every file except a module's `index.ts` is optional. Do not create empty files merely to match this example.

### Server Application

`src/server/app.ts` assembles native Bun routes when server modules exist.

It may:

- Create and configure the `Bun.serve()` options.
- Mount shared plugins.
- Mount server modules and HTML routes.
- Configure application-wide error handling.
- Select SSR or client rendering from validated server configuration.

It must not contain module business logic or module database queries.

### Server Modules

`src/server/modules/<module>` owns one server capability or domain.

Standard file responsibilities:

- `index.ts`: module public entry point. It exposes route definitions and intentional module APIs.
- `controller.ts`: native Bun request handler. It handles HTTP input/output, applies schema validation, and delegates business work.
- `schema.ts`: runtime request, response, parameter, query, environment, or content validation. Treat input as `unknown` until validated.
- `service.ts`: business rules and workflows that do not depend on HTTP details.
- `repository.ts`: database queries and persistence behavior owned by the module.
- `policy.ts`: module-specific resource authorization when authorization logic warrants its own file.
- `constants.ts`: constants owned only by the module.
- `types.ts`: internal types owned only by the module.
- `utils.ts`: pure helpers owned only by the module.

Start with `index.ts` when sufficient. Extract other files only when responsibility, complexity, reuse, or testability requires them.

### Server Shared

`src/server/shared` contains server-only code used by multiple server modules.

- `auth`: reusable session, password, identity, and authorization primitives.
- `database`: database connection, transaction primitives, shared database configuration, and schema infrastructure.
- `errors`: server errors used across modules.
- `plugins`: reusable native Bun wrappers and lifecycle concerns.
- `constants`: server-only constants used across modules.
- `types`: server-only types used across modules.
- `utils`: domain-neutral server helpers used across modules.

Examples of shared plugins:

- Request context.
- Error handling.
- Logging.
- Session resolution.
- CORS configuration.
- Security headers.

A plugin used by only one module remains inside that module. Do not move it to `server/shared` based only on its technical shape. A native Bun plugin is a project convention for reusable server composition; it does not imply Elysia or another framework.

## Rendering And Routing

- `Bun.serve()` owns public HTTP routes, including `/`, `/project`, `/contact`, assets, APIs, and 404 responses.
- React Router owns client route matching, navigation state, layouts, and nested page rendering after Bun serves the HTML shell.
- Every public React Router URL must have a matching Bun HTML route so direct requests and refreshes work.
- Server modules must not depend on React Router.
- Current rendering is client-side: Bun returns the HTML shell and the browser mounts React.
- Configurable SSR through validated server configuration is a planned v2 capability, not active behavior.
- Future SSR and current client rendering must preserve page behavior, accessibility, and URLs.
- Server-only values and secrets must never be serialized into client HTML.

## Cross-Environment Shared

`src/shared` contains environment-neutral code required by both client and server.

Allowed content:

- Client-server contract types.
- Validation schemas safe in browser and server environments.
- Constants used by both sides.
- Pure utilities used by both sides.

Forbidden content:

- DOM or browser API access.
- Bun server API access.
- Database access.
- Filesystem access.
- Secrets or server environment access.
- Imports from `src/client` or `src/server`.

Do not use `src/shared` for possible future reuse. Code must have a current client and server consumer before moving here.

## Dependency Direction

Allowed dependencies:

```text
src/index.ts            -> client, server, shared
client/modules          -> client/shared, shared
client/shared           -> shared
server/modules          -> server/shared, shared
server/shared           -> shared
```

Forbidden dependencies:

```text
client                  -> server
server                  -> client
shared                  -> client
shared                  -> server
client/shared           -> client/modules
server/shared           -> server/modules
```

The composition root may import the client HTML entry and server assembly. Server rendering may import an explicitly environment-neutral React application tree through a documented boundary; server modules must not import browser bootstrap code.

Cross-module imports should use the owning module's public `index.ts`. Avoid circular module dependencies. If two modules need a domain-neutral contract, identify its proper owner or move only the neutral contract to the appropriate shared boundary.

## Placement Decision

Before creating or moving a file, apply these rules in order:

1. Browser-only code belongs in `src/client`.
2. Server runtime, database, session, secret, filesystem, or native Bun HTTP code belongs in `src/server`.
3. Code owned by one capability belongs in that capability's module.
4. Code used by multiple modules on one side belongs in that side's `shared` directory.
5. Code currently used by client and server and safe in both environments belongs in `src/shared`.
6. Top-level runtime assembly belongs in `src/index.ts`.

When ownership is unclear, keep code in its first consumer. Do not promote it to shared prematurely.

## Naming Conventions

- Use kebab-case for every file and directory name.
- Use `.tsx` only when a file contains JSX.
- Use `.ts` when a file does not contain JSX.
- Use PascalCase for React components, classes, types, and interfaces.
- Use camelCase for functions, hooks, variables, and object instances.
- Use UPPER_SNAKE_CASE for module-level constants.
- Name hooks after behavior, such as `use-projects.ts`, not `hooks.ts` or `use-hooks.ts`.
- Prefer one primary concept per file.
- Avoid repeating directory context in file names.
- Use `index.ts` only for an intentional module public entry point or controller entry.
- Do not create barrel files for every directory.

## Test Placement

Unit tests are colocated with the source they test:

```text
project-card.tsx
project-card.test.tsx
schema.ts
schema.test.ts
service.ts
service.test.ts
```

Centralized integration test locations:

```text
src/client/tests/integration/
src/server/tests/integration/
```

Cross-stack end-to-end tests belong at `tests/e2e/`.

Testing rules:

- Do not place unit tests in centralized test directories.
- Keep a test helper used by only one module beside that module.
- Put test infrastructure used by multiple modules in the side-specific `tests` directory.
- Do not place production utilities in test directories.
- Add a regression test for a bug at the lowest level that reliably reproduces it.
- Do not create empty test files or placeholder suites.

## Structural Changes

- Update this document when active structure, ownership, dependency, naming, rendering, routing, or test placement rules change.
- Record version-specific proposed changes in the relevant release specification when version documentation exists. The proposed dashboard, PostgreSQL, and RustFS architecture is defined in `docs/V2-DASHBOARD-PLAN.md`.
- Record major, durable, or costly-to-reverse decisions as an Architecture Decision Record when ADR documentation exists.
- Do not treat a future proposal as active architecture until it is accepted and reflected here.
