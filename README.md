# Portfolio Web Template

Template portfolio full-stack berbasis Bun, React, dan TypeScript. Versi 2 akan mempertahankan tampilan versi 1 dengan build, server, routing, dan runtime native Bun.

> Status: v2 dalam pengembangan aktif pada `master`.

## Versi

- `v1.0.0`: rilis Vite SPA yang tetap tersedia melalui tag `v1.0.0` dan branch `v1`.
- `master`: jalur pengembangan v2 berbasis Bun full-stack.

## Target V2

- Bun sebagai package manager, bundler, development server, production runtime, dan HTTP router.
- React 19 dan React Router untuk UI serta navigasi client.
- `Bun.serve()` untuk route HTTP, HTML shell, API, aset, dan respons 404.
- Tailwind CSS 4 melalui plugin bundler Bun.
- Dashboard CMS pribadi dengan draft dan publish.
- PostgreSQL untuk konten dan session.
- RustFS untuk avatar, resume, project image, dan icon custom.
- SSR yang dapat dikonfigurasi melalui `SSR_ENABLED` menjadi target tahap berikutnya.
- Tampilan responsif dan konten portfolio yang mudah disesuaikan.

## Struktur

```text
src/
├── index.ts # Composition root dan entry point Bun
├── client/  # HTML entry, UI React, React Router, dan modul portfolio
└── server/  # Route HTTP, aset publik, dan layanan server
```

Struktur dibuat sesuai kebutuhan; direktori kosong tidak dibuat. Aturan lengkap tersedia di [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), standar development di [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md), rencana dashboard CMS di [`docs/V2-DASHBOARD-PLAN.md`](docs/V2-DASHBOARD-PLAN.md), dan instruksi agent di [`AGENTS.md`](AGENTS.md).

## Konfigurasi Rendering

`SSR_ENABLED` belum aktif pada tahap struktur dan dependency ini. Kontrak targetnya:

```env
SSR_ENABLED=true
```

- `true`: Bun merender React pada server, lalu browser melakukan hydration.
- `false`: Bun mengirim client shell, lalu browser melakukan render.
- Perubahan konfigurasi memerlukan restart atau redeploy server.
- Pengunjung tidak dapat mengubah mode melalui query, cookie, atau header.

## Menjalankan Aplikasi

Perintah berikut menjalankan workflow v2.

Prasyarat:

- Bun `1.4.2`.

Instal dependensi:

```bash
bun install
```

Siapkan konfigurasi dan infrastructure lokal:

```bash
cp .env.example .env
bun run infra:up
bun run db:migrate
bun run setup --seed-demo
```

`bun run setup` membuat satu admin pribadi. Tidak ada registrasi publik. Hapus `--seed-demo` untuk mulai dari portfolio kosong.

Setup non-interaktif dapat memakai `SETUP_ADMIN_EMAIL` dan `SETUP_ADMIN_PASSWORD`. Jangan menyimpan nilai production tersebut dalam file yang di-commit.

Untuk menjalankan seluruh aplikasi dalam Docker:

```bash
cp .env.example .env
bun run docker:build
bun run infra:up
bun run docker:setup
```

Migration dijalankan otomatis saat container aplikasi mulai. Dashboard tersedia di `http://localhost:3000/login` dan RustFS Console di `http://localhost:9001`.

Jalankan development server:

```bash
bun run dev
```

Build production:

```bash
bun run build
```

Jalankan server production:

```bash
bun run start
```

## Verifikasi

Jalankan seluruh verifikasi v2:

```bash
bun run verify
```

Atau jalankan pemeriksaan secara terpisah:

```bash
bun run check
bun run typecheck
bun run secrets:check
bun run build
```

Jalankan test ketika tersedia:

```bash
bun run test
```

Terapkan formatting dan safe fixes Biome:

```bash
bun run check:fix
```

Periksa secret pada staged changes sebelum commit:

```bash
bun run secrets:staged
```

Gitleaks diperlukan untuk pemeriksaan secret lokal. Instal pada macOS dengan:

```bash
brew install gitleaks
```

## Deployment

V2 memerlukan host yang dapat menjalankan proses Bun untuk mendukung SSR dan route server. Static-only GitHub Pages tidak mendukung mode SSR.

Production juga memerlukan PostgreSQL dan RustFS atau layanan S3-compatible. Backup PostgreSQL dan object storage harus dibuat sebagai pasangan snapshot.

## Contributing

Gunakan Conventional Commits. Aturan commit, testing, keamanan, dan review tersedia di [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).

Validasi pesan commit bila diperlukan:

```bash
printf '%s\n' 'docs(architecture): prepare bun full-stack v2' | bun run commitlint
```

## Acknowledgements

- Inspired by [Dillion Verma](https://portfolio-magicui.vercel.app/)
