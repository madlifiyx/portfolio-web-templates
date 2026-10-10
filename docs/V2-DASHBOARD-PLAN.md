# V2 Dashboard CMS Plan

Status: In Progress

This document defines the accepted implementation plan for the self-hosted portfolio dashboard, PostgreSQL backend, and RustFS file storage. It is a release specification, not active architecture. Rules in `docs/ARCHITECTURE.md` remain authoritative until each phase is implemented and that document is updated.

## Product Goal

The repository is a public portfolio template. A user clones or forks the repository, deploys one instance, and manages one personal portfolio through a private dashboard.

```text
Public repository template
        ↓ clone or fork
One self-hosted deployment
        ↓
One portfolio owner
        ↓
Private dashboard CMS
        ↓
Draft → preview → publish
        ↓
Public portfolio
```

The dashboard exists so repository users do not need to edit JSON, change React source, or manually manage media paths to customize their portfolio.

## Accepted Decisions

- One portfolio per deployment.
- One administrator account per deployment.
- No public registration.
- Email and password authentication.
- Server-side sessions stored in PostgreSQL.
- PostgreSQL accessed through native `Bun.SQL`.
- RustFS accessed through native `Bun.S3Client` using its S3-compatible endpoint.
- Portfolio files are delivered through a Bun proxy route.
- Dashboard edits a draft revision.
- Public portfolio reads only the published revision.
- Publish replaces the complete public portfolio atomically.
- Contact and project-link platforms use a reusable platform catalog.
- Contacts may override platform labels and icons.
- Custom uploaded icons accept PNG and WebP only.
- Trusted built-in SVG platform icons may be seeded from the repository.
- PostgreSQL and RustFS run locally through Docker Compose.
- Existing JSON content becomes optional demo seed data, not the final runtime source.

## Non-Goals

- Multi-tenant SaaS.
- Multiple portfolios in one deployment.
- Public account registration.
- Organizations or workspaces.
- Roles and complex permission management.
- Social login in the first release.
- A general-purpose headless CMS.
- Direct public access to RustFS credentials or private endpoints.
- User-uploaded SVG files.

## Target Architecture

```text
src/
├── index.ts
├── client/
│   ├── index.html
│   ├── frontend.tsx
│   ├── app.tsx
│   ├── index.css
│   ├── modules/
│   │   ├── portfolio/
│   │   └── dashboard/
│   └── shared/
├── server/
│   ├── app.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── portfolio/
│   │   └── media/
│   └── shared/
│       ├── config/
│       ├── database/
│       ├── errors/
│       └── plugins/
└── shared/
    ├── schemas/
    └── types/

migrations/
scripts/
tests/e2e/
compose.yaml
.env.example
```

Only create files and directories when implementation requires them.

### Ownership

- `src/index.ts` remains the composition root.
- `src/client/modules/portfolio` owns public portfolio UI.
- `src/client/modules/dashboard` owns login, dashboard pages, editors, preview, and authenticated API calls.
- `src/server/modules/auth` owns admin identity and sessions.
- `src/server/modules/portfolio` owns revisions, profile, experience, technologies, projects, platforms, contacts, and publishing.
- `src/server/modules/media` owns RustFS objects, asset metadata, upload validation, proxy delivery, and safe deletion.
- `src/server/shared/database` owns the PostgreSQL connection and migration infrastructure.
- `src/server/shared/config` owns environment parsing and validation.
- `src/shared` contains only contracts used by both client and server.

## Routing

`Bun.serve()` owns HTTP routing, HTML shell delivery, APIs, media proxying, authentication, authorization, and HTTP errors. React Router owns browser navigation, nested layouts, and route rendering.

Every public React Router URL must have a matching Bun HTML route.

### Client Routes

```text
/
/project
/contact
/login
/dashboard
/dashboard/profile
/dashboard/experience
/dashboard/skills
/dashboard/projects
/dashboard/contacts
/dashboard/media
/dashboard/preview
```

Client route guards improve UX only. Dashboard APIs always validate the server session.

### Health Routes

```text
GET /health/live
GET /health/ready
```

- `live` reports that the Bun process is running.
- `ready` verifies PostgreSQL and RustFS availability without exposing credentials or internal error details.

## Database Design

Use PostgreSQL UUID primary keys and `timestamptz` timestamps. Lists always have explicit `sort_order`; insertion order must never be assumed.

### Administrators

```text
admin_users
- id uuid primary key
- email text not null unique
- password_hash text not null
- created_at timestamptz not null
- updated_at timestamptz not null
```

The setup command must reject creation when an administrator already exists.

### Sessions

```text
sessions
- id uuid primary key
- admin_user_id uuid not null references admin_users(id) on delete cascade
- token_hash text not null unique
- expires_at timestamptz not null
- created_at timestamptz not null
- last_seen_at timestamptz not null
```

Only the token hash is stored. The raw token exists only in the browser cookie.

### Portfolio Revisions

```text
portfolio_revisions
- id uuid primary key
- status text not null: draft | published | archived
- version integer not null unique
- created_at timestamptz not null
- updated_at timestamptz not null
- published_at timestamptz null
```

Partial unique indexes enforce at most one active draft and one active published revision.

### Profile

```text
profiles
- id uuid primary key
- revision_id uuid not null unique references portfolio_revisions(id) on delete cascade
- name text not null
- pronouns text null
- headline text not null
- about text not null
- avatar_asset_id uuid null
- resume_asset_id uuid null
- created_at timestamptz not null
- updated_at timestamptz not null
```

### Experiences

Work and education share one table.

```text
experiences
- id uuid primary key
- revision_id uuid not null references portfolio_revisions(id) on delete cascade
- kind text not null: work | education
- organization text not null
- role_or_program text not null
- website_url text null
- logo_asset_id uuid null
- start_year integer not null
- start_month integer null
- end_year integer null
- end_month integer null
- is_current boolean not null default false
- description text null
- sort_order integer not null
- created_at timestamptz not null
- updated_at timestamptz not null
```

Constraints:

- Month values are between 1 and 12.
- Current experience has no end period.
- End period cannot precede start period.

Month and year fields preserve current data precision such as `Jan 2020` and `Present`.

### Technologies

```text
technologies
- id uuid primary key
- revision_id uuid not null references portfolio_revisions(id) on delete cascade
- name text not null
- normalized_name text not null
- created_at timestamptz not null
- updated_at timestamptz not null

unique (revision_id, normalized_name)
```

```text
profile_technologies
- profile_id uuid not null references profiles(id) on delete cascade
- technology_id uuid not null references technologies(id) on delete cascade
- sort_order integer not null

primary key (profile_id, technology_id)
```

### Projects

```text
projects
- id uuid primary key
- revision_id uuid not null references portfolio_revisions(id) on delete cascade
- title text not null
- description text not null
- project_date date null
- image_asset_id uuid null
- client_name text null
- project_type text null
- project_role text null
- sort_order integer not null
- created_at timestamptz not null
- updated_at timestamptz not null
```

Project type and role remain free text for the first release.

```text
project_technologies
- project_id uuid not null references projects(id) on delete cascade
- technology_id uuid not null references technologies(id) on delete cascade
- sort_order integer not null

primary key (project_id, technology_id)
```

### Platform Catalog

```text
platforms
- id uuid primary key
- revision_id uuid not null references portfolio_revisions(id) on delete cascade
- key text not null
- name text not null
- default_icon_asset_id uuid null
- sort_order integer not null
- is_active boolean not null default true
- created_at timestamptz not null
- updated_at timestamptz not null

unique (revision_id, key)
```

Initial platform keys:

```text
github
youtube
linkedin
x
website
email
phone
mobile
desktop
custom
```

### Contacts

```text
contacts
- id uuid primary key
- revision_id uuid not null references portfolio_revisions(id) on delete cascade
- platform_id uuid null references platforms(id)
- label_override text null
- url text not null
- icon_asset_id uuid null
- sort_order integer not null
- is_visible boolean not null default true
- created_at timestamptz not null
- updated_at timestamptz not null
```

Display resolution:

```text
label = label_override ?? platform.name
icon  = contact.icon_asset_id ?? platform.default_icon_asset_id
```

Accepted URL schemes are `https:`, `mailto:`, and `tel:`. Unsafe and unknown schemes are rejected.

### Project Links

```text
project_links
- id uuid primary key
- project_id uuid not null references projects(id) on delete cascade
- platform_id uuid null references platforms(id)
- label text null
- url text not null
- sort_order integer not null
- created_at timestamptz not null
- updated_at timestamptz not null
```

This replaces fixed boolean and URL pairs such as `isGithub` plus `githubLink`.

### Assets

```text
assets
- id uuid primary key
- bucket text not null
- object_key text not null
- original_filename text not null
- content_type text not null
- byte_size bigint not null
- etag text null
- checksum_sha256 text not null
- width integer null
- height integer null
- created_at timestamptz not null

unique (bucket, object_key)
```

Assets do not belong to one revision. Draft, published, and archived revisions may reference the same immutable object.

## Draft And Publish

Dashboard mutations affect only the active draft. Public APIs read only the active published revision.

### Publish Transaction

1. Lock the active draft and published rows.
2. Validate that the draft is publishable.
3. Mark the current published revision as archived.
4. Mark the draft as published and set `published_at`.
5. Clone the complete published graph into a new draft.
6. Reuse immutable asset references.
7. Commit the transaction.

The cloned graph includes profile, experiences, technologies, profile technologies, projects, project technologies, project links, platforms, and contacts.

Publishing is all-or-nothing. A partial portfolio must never become public.

### Preview

`/dashboard/preview` renders the draft through existing portfolio components and requires an authenticated administrator session.

## Authentication And Security

### Passwords

Use `Bun.password.hash()` and `Bun.password.verify()`. Never store or log raw passwords.

Setup password requirements:

- At least 12 characters.
- Read interactively, not from a command argument that enters shell history.
- Confirmation required.

### Cookies

Session cookies use:

```text
HttpOnly
SameSite=Lax
Secure in production
Path=/
Max-Age based on SESSION_TTL_SECONDS
```

### Request Protection

- Mutations require a valid session.
- Mutations use `POST`, `PATCH`, or `DELETE`.
- Validate `Origin` against `APP_ORIGIN`.
- Require JSON content type except for multipart uploads.
- Return generic login failures.
- Apply login rate limiting and response delay.
- Do not expose stack traces, SQL errors, storage errors, or secrets.

In-process rate limiting is sufficient for the first single-process deployment. Move it to shared persistence only when multi-process deployment becomes a requirement.

## RustFS Storage

RustFS is treated as an S3-compatible service through native `Bun.S3Client`.

```ts
new Bun.S3Client({
  endpoint,
  region,
  bucket,
  accessKeyId,
  secretAccessKey,
})
```

Do not add AWS SDK unless a concrete unsupported S3 operation requires it.

### Upload Types

Avatar, experience logo, and project image:

```text
image/png
image/jpeg
image/webp
```

Custom platform and contact icon:

```text
image/png
image/webp
```

Resume:

```text
application/pdf
```

User-uploaded SVG is rejected. Trusted built-in SVG icons may be imported during setup.

### Size Limits

```text
Icon: 1 MB
Avatar and logo: 5 MB
Project image: 10 MB
Resume PDF: 10 MB
```

### Validation

The server validates:

- Declared content type.
- Magic bytes.
- Byte size.
- Empty files.
- Image dimensions where relevant.
- Filename length.
- PDF header.
- SHA-256 checksum.

File extensions are not trusted as proof of type.

### Object Keys

```text
profile/avatar/{asset-id}
profile/resume/{asset-id}
experiences/{experience-id}/{asset-id}
projects/{project-id}/{asset-id}
platforms/{platform-id}/{asset-id}
contacts/{contact-id}/{asset-id}
```

Original filenames are metadata only. Objects are immutable; replacing a file creates a new asset.

## Media Proxy

```text
GET  /media/:assetId
HEAD /media/:assetId
```

Public media flow:

1. Load asset metadata from PostgreSQL.
2. Confirm the asset is referenced by the published revision.
3. Read or stream the RustFS object.
4. Return content type, content length, ETag, and cache headers.
5. Support byte ranges for PDF files.
6. Return `404` for missing or non-public assets.

Recommended headers:

```text
Cache-Control: public, max-age=31536000, immutable
X-Content-Type-Options: nosniff
```

Resume responses may use an attachment content disposition.

Dashboard media access may include draft-only assets after session validation.

### Safe Deletion

1. Validate the administrator session.
2. Check references across draft, published, and archived revisions.
3. Return `409 Conflict` if the asset is in use.
4. Delete the RustFS object.
5. Delete PostgreSQL metadata only after storage deletion succeeds.

An orphan cleanup command may be added after the basic lifecycle works. An outbox or retry worker is deferred until operational failures prove the need.

## API Design

### Public API

```text
GET /api/portfolio
GET /media/:assetId
HEAD /media/:assetId
```

`GET /api/portfolio` returns one consistent published aggregate:

```ts
{
  version: number
  profile: Profile
  experiences: {
    work: Experience[]
    education: Experience[]
  }
  technologies: Technology[]
  projects: Project[]
  contacts: Contact[]
}
```

Collections are explicitly ordered. The endpoint replaces six JSON requests and duplicate summary/project requests.

Use an ETag derived from the published version and support `304 Not Modified`.

### Authentication API

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### Dashboard Reads

```text
GET /api/dashboard/portfolio
GET /api/dashboard/preview
```

### Profile

```text
PATCH /api/dashboard/profile/:id
```

### Experiences

```text
POST   /api/dashboard/experiences
PATCH  /api/dashboard/experiences/:id
DELETE /api/dashboard/experiences/:id
PUT    /api/dashboard/experiences/reorder
```

### Technologies

```text
POST   /api/dashboard/technologies
PATCH  /api/dashboard/technologies/:id
DELETE /api/dashboard/technologies/:id
```

### Projects

```text
POST   /api/dashboard/projects
PATCH  /api/dashboard/projects/:id
DELETE /api/dashboard/projects/:id
PUT    /api/dashboard/projects/reorder
```

Project writes include technology IDs and project links.

### Contacts

```text
POST   /api/dashboard/contacts
PATCH  /api/dashboard/contacts/:id
DELETE /api/dashboard/contacts/:id
PUT    /api/dashboard/contacts/reorder
```

Dashboard contact values expose nullable `labelOverride` and `iconOverride` separately from
resolved `label` and `icon` values. Clearing an override therefore restores the platform default.

Platform records are seeded suggestions, not routine dashboard content. Contact and project forms
select active suggestions inline. Built-in suggestions include trusted default icons. A custom link
uses the `custom` suggestion plus per-entity label and icon overrides.

### Assets

```text
POST   /api/dashboard/assets
DELETE /api/dashboard/assets/:id
```

### Publish

```text
POST /api/dashboard/publish
```

Response:

```ts
{
  publishedVersion: number
  nextDraftVersion: number
}
```

### Error Contract

```ts
{
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}
```

Status conventions:

```text
400 malformed request
401 unauthenticated
403 forbidden or rejected origin
404 resource not found
409 conflict, stale update, or asset in use
413 upload too large
415 unsupported media type
422 validation error
500 safe internal error
```

## Dashboard UX

### Login

- Email and password.
- Loading state.
- Generic credential error.
- Redirect to dashboard after login.

### Overview

- Published version.
- Draft version.
- Last publish time.
- Draft validation status.
- Quick links to editors.
- Publish action.

### Profile

- Name.
- Pronouns.
- Headline.
- About.
- Avatar upload or picker.
- Resume upload or picker.

### Experience

- Work and education tabs.
- Create, edit, and delete.
- Logo picker.
- Month and year periods.
- Current toggle.
- Explicit ordering controls.

### Skills

- Technology catalog.
- Add and remove profile skills.
- Canonical normalized names.
- Ordering controls.

### Projects

- Metadata and date.
- Project image.
- Technologies.
- Platform-based project links.
- Ordering controls.
- Card preview.

### Contacts

- Platform selection.
- Safe URL input.
- Label override.
- Icon override.
- Visibility toggle.
- Ordering controls.

### Platform Suggestions

- Platform suggestions appear inside contact and project-link forms.
- Built-in suggestions are seeded with trusted default icons.
- Routine users do not manage a separate platform page.
- Contact icon and label overrides remain nullable so platform defaults continue to apply.

### Media

- Upload.
- Image/PDF filtering.
- Preview.
- Reference count.
- Delete only when unused.

### Preview And Publish

- Preview renders draft with shared portfolio components.
- Validation errors appear before publish.
- Publish requires confirmation.
- Double submission is disabled.
- Successful publish shows the new published and draft versions.

## Runtime Validation

Do not add a schema dependency initially. Each module `schema.ts` accepts `unknown`, validates it with explicit runtime checks, and returns a typed value or structured validation error.

Validate:

- Required and optional fields.
- String lengths.
- UUIDs.
- Integer and date ranges.
- Enumerated values.
- Safe URL schemes.
- Upload metadata.

Move schemas to `src/shared` only when both client and server have real consumers.

## PostgreSQL Integration

Use native `Bun.SQL` with `DATABASE_URL`.

Rules:

- Configure one connection pool in `src/server/shared/database`.
- Use parameterized tagged templates.
- Do not pass user input through `sql.unsafe()`.
- Keep queries inside owning repositories.
- Use `sql.begin()` for publishing and other multi-write operations.
- Close the pool during graceful shutdown.
- Narrow database results before returning from repositories.

## Migrations

Commands:

```bash
bun run db:migrate
bun run db:status
```

Migration runner behavior:

1. Create `schema_migrations` when absent.
2. Acquire a PostgreSQL advisory lock.
3. Read ordered SQL migration files.
4. Compute and compare checksums.
5. Reject modified migrations that already ran.
6. Apply new migrations transactionally.
7. Store version, checksum, and applied time.
8. Release the lock.

Applied migration files are immutable. Schema changes require a new migration.

## Setup And Demo Import

### Setup Command

```bash
bun run setup
```

Interactive prompts:

```text
Admin email:
Admin password:
Confirm password:
Portfolio name:
Import demo content? [y/N]
```

Setup behavior:

1. Confirm migrations are current.
2. Refuse to run when an administrator exists.
3. Hash and create the administrator password.
4. Seed the platform catalog.
5. Create the initial published revision.
6. Clone it into the initial draft.
7. Optionally import demo content.

The command never prints passwords, session tokens, or storage secrets.

### Demo Mode

```bash
bun run setup --seed-demo
```

Demo sources:

```text
public/data/*.json
public/images/*
public/icon/*
public/pdf/resume.pdf
```

The importer validates all JSON before writing, imports content in a transaction, uploads managed files to RustFS, creates an initial published snapshot, clones a draft, and prints a per-record report.

Normalization:

```text
Github → GitHub
Youtube → YouTube
TailwindCSS → Tailwind CSS
Present → is_current=true
isDekstop/dekstopLink → desktop project link
```

Do not automatically associate known incorrect demo logos with unrelated organizations or schools. Unstable remote placeholder images become empty asset references and use the application fallback.

The importer must reject rerunning against a populated instance or otherwise prove idempotency.

## Local Infrastructure

`compose.yaml` contains PostgreSQL and RustFS only. The Bun application continues to run locally with `bun run dev` during development.

### PostgreSQL

- Pin a major image version.
- Use a named volume.
- Add a `pg_isready` health check.
- Read development credentials from `.env`.

### RustFS

- Pin an official release tag, never `latest`.
- Use a named data volume.
- Expose the S3 API port.
- Expose the administration port only when required.
- Add a health check.
- Bootstrap the `portfolio-assets` bucket.

RustFS image name, release tag, command, and health endpoint must be verified against current official documentation during implementation.

Convenience scripts:

```bash
bun run infra:up
bun run infra:down
bun run infra:logs
```

## Environment Contract

`.env.example` contains safe placeholders only:

```env
APP_ORIGIN=http://localhost:3000
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://portfolio:change-me@localhost:5432/portfolio

SESSION_SECRET=replace-with-random-secret
SESSION_TTL_SECONDS=604800

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=portfolio-assets
S3_ACCESS_KEY_ID=replace-me
S3_SECRET_ACCESS_KEY=replace-me

POSTGRES_DB=portfolio
POSTGRES_USER=portfolio
POSTGRES_PASSWORD=change-me

RUSTFS_ACCESS_KEY=replace-me
RUSTFS_SECRET_KEY=replace-me
```

Server configuration is parsed and validated once at startup. Secrets never enter browser bundles.

## Test Plan

### Unit Tests

- Environment parsing.
- Email and password validation.
- Session token hashing.
- Safe URL validation.
- Experience period validation.
- Upload MIME and magic-byte validation.
- Contact label/icon resolution.
- Project-link conversion.
- Draft completeness validation.

### PostgreSQL Integration Tests

- Fresh migration.
- Migration rerun and checksum protection.
- Profile CRUD.
- Experience ordering.
- Project graph CRUD.
- Contact and platform constraints.
- Session expiry.
- Atomic publish.
- Publish rollback.
- Archived revision integrity.

### RustFS Integration Tests

- PNG, WebP, JPEG, and PDF upload.
- SVG rejection.
- Oversized upload rejection.
- Public proxy delivery.
- Draft-only asset authorization.
- HEAD and PDF range requests.
- ETag behavior.
- Missing object handling.
- Safe asset deletion.

### HTTP Integration Tests

- Public API reads published content only.
- Dashboard API reads draft content.
- Unauthenticated dashboard API returns `401`.
- Invalid origin returns `403`.
- Invalid payload returns `422`.
- Login, session, and logout lifecycle.
- Cookie flags.
- Publish route.
- Direct dashboard HTML route refresh.
- Stable safe error envelope.

### Client Tests

- Login states.
- Form validation.
- Contact platform and icon override.
- Draft preview.
- Publish confirmation.
- Media picker.
- Loading, empty, error, and success states.

### End-To-End Test

1. Start a fresh instance.
2. Run setup.
3. Log in.
4. Edit profile.
5. Add a contact platform.
6. Upload a custom WebP icon.
7. Preview the draft.
8. Confirm the public portfolio is unchanged.
9. Publish.
10. Confirm the public portfolio changed.
11. Log out.
12. Confirm dashboard APIs reject access.

## Backup And Recovery

Production documentation must cover:

- PostgreSQL backup with `pg_dump`.
- PostgreSQL restore with `pg_restore`.
- RustFS bucket or volume backup.
- Matching database and object-storage snapshots.
- Backup before schema migrations and major releases.

Do not restore PostgreSQL without the matching object-storage snapshot when asset references changed.

## Delivery Phases

### Phase 1: Local Infrastructure

Deliver:

- `compose.yaml`.
- `.env.example`.
- Validated environment config.
- PostgreSQL connection.
- RustFS client.
- Health routes.

Exit criteria:

- PostgreSQL and RustFS start through Docker Compose.
- Bun readiness returns `200` when both services are healthy.
- Invalid configuration fails at startup without exposing secrets.

### Phase 2: Database And Migrations

Deliver:

- Initial schema migration.
- Migration runner.
- Migration status command.
- Database integration test setup.

Exit criteria:

- Fresh migration succeeds.
- Rerun is safe.
- Modified applied migration is rejected.
- Constraints are covered by tests.

### Phase 3: Authentication

Deliver:

- Setup command.
- Administrator and session repositories.
- Login, logout, and session APIs.
- Cookie and origin validation.
- Login rate limiting.

Exit criteria:

- No public registration exists.
- Dashboard APIs reject unauthenticated requests.
- Login and logout tests pass.

### Phase 4: Media

Deliver:

- Asset table and repository.
- RustFS upload service.
- Upload validation.
- Media proxy.
- Safe deletion.

Exit criteria:

- Allowed files upload and stream correctly.
- SVG and oversized files are rejected.
- Referenced assets cannot be deleted.

### Phase 5: Portfolio Domain

Deliver:

- Revision model.
- Profile, experience, technology, project, platform, and contact repositories.
- Public and draft aggregate services.
- CRUD APIs.

Exit criteria:

- Draft CRUD works.
- Published reads are consistent.
- All list ordering is explicit.

### Phase 6: Demo Importer

Deliver:

- JSON validation.
- Data normalization.
- PostgreSQL import.
- RustFS media migration.
- Import report.

Exit criteria:

- Demo content imports without silent loss.
- Managed media resolves through the proxy.
- Published and draft revisions are created.

### Phase 7: Public Portfolio API

Deliver:

- `GET /api/portfolio`.
- ETag support.
- Portfolio client API adapter.
- Removal of runtime JSON fetches.

Exit criteria:

- Public UI no longer requests `/data/*.json`.
- Public UI reads one published aggregate.

### Phase 8: Dashboard Shell

Deliver:

- Login page.
- Dashboard layout and navigation.
- Session bootstrap.
- Overview page.
- Matching Bun HTML routes.

Exit criteria:

- Dashboard requires authentication.
- Direct route refresh works.

### Phase 9: Content Editors

Deliver:

- Profile editor.
- Experience editor.
- Technology editor.
- Project editor.
- Platform editor.
- Contact editor.
- Media library.

Exit criteria:

- Every existing JSON field can be managed without editing source.
- Custom contact icon works.

### Phase 10: Preview And Publish

Deliver:

- Draft preview.
- Draft validation summary.
- Atomic publish.
- New-draft cloning.

Exit criteria:

- Draft changes remain private before publish.
- Publish changes the whole public snapshot atomically.
- Failed publish rolls back.

### Phase 11: Cleanup And Documentation

Deliver:

- Remove runtime public JSON serving.
- Move demo JSON to fixtures.
- Remove migrated content media from `public`.
- Keep application-owned fallback assets.
- Setup, deployment, backup, and recovery guides.

Exit criteria:

- Runtime has no dependency on `public/data`.
- Fresh clone onboarding is documented and tested.
- Required verification and end-to-end tests pass.

## Commit Strategy

Suggested logical commits:

```text
chore(infra): add postgres and rustfs services
feat(database): add portfolio schema migrations
feat(auth): add dashboard session authentication
feat(media): add rustfs asset storage
feat(portfolio): add revisioned content api
feat(import): migrate demo portfolio data
refactor(client): load portfolio from public api
feat(dashboard): add authenticated dashboard shell
feat(dashboard): add portfolio content editors
feat(publish): add draft preview and publishing
docs(setup): document self-hosted portfolio workflow
```

## Completion Criteria

V2 dashboard is complete when a new user can:

1. Clone the public repository.
2. Configure safe local environment values.
3. Start PostgreSQL and RustFS.
4. Install dependencies and run migrations.
5. Create the single administrator through setup.
6. Log in to the dashboard.
7. Build a portfolio without editing source or JSON.
8. Upload images, resume, and contact icons.
9. Preview a private draft.
10. Publish the complete portfolio atomically.
11. Back up and restore both PostgreSQL and RustFS.

All required checks, tests, build, secret scan, and documented smoke tests must pass.
