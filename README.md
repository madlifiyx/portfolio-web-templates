# Portfolio Web Template

Template portfolio full-stack berbasis Bun, React, dan TypeScript. Versi 2 akan mempertahankan tampilan versi 1 dengan build, server, routing, dan runtime native Bun.

> Status: persiapan v2. Source aplikasi pada `master` masih menggunakan implementasi v1 sampai rewrite Bun dimulai.

## Versi

- `v1.0.0`: rilis Vite SPA yang tetap tersedia melalui tag `v1.0.0` dan branch `v1`.
- `master`: jalur pengembangan v2 berbasis Bun full-stack.

## Target V2

- Bun sebagai package manager, bundler, development server, production runtime, dan HTTP router.
- React untuk UI tanpa React Router.
- `Bun.serve()` untuk route halaman, API, aset, dan respons 404.
- SSR dapat diaktifkan pemilik situs melalui `SSR_ENABLED`.
- Tampilan responsif dan konten portfolio yang mudah disesuaikan.

## Struktur

```text
src/
├── index.ts # Composition root dan entry point Bun
├── client/  # UI React dan kode browser
├── server/  # Route, controller, schema, plugin, dan layanan server
└── shared/  # Kontrak dan utilitas lintas environment
```

Struktur dibuat sesuai kebutuhan; direktori kosong tidak dibuat. Aturan lengkap tersedia di [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), standar development di [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md), dan instruksi agent di [`AGENTS.md`](AGENTS.md).

## Konfigurasi Rendering

Pemilik situs mengatur mode rendering melalui server environment:

```env
SSR_ENABLED=true
```

- `true`: Bun merender React pada server, lalu browser melakukan hydration.
- `false`: Bun mengirim client shell, lalu browser melakukan render.
- Perubahan konfigurasi memerlukan restart atau redeploy server.
- Pengunjung tidak dapat mengubah mode melalui query, cookie, atau header.

## Menjalankan Aplikasi

Perintah berikut menjadi kontrak workflow v2 dan akan aktif setelah runtime v2 diterapkan.

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
