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

## Contributing

Gunakan Conventional Commits. Aturan commit, testing, keamanan, dan review tersedia di [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).

Validasi pesan commit bila diperlukan:

```bash
printf '%s\n' 'docs(architecture): prepare bun full-stack v2' | bun run commitlint
```

## Acknowledgements

- Inspired by [Dillion Verma](https://portfolio-magicui.vercel.app/)
