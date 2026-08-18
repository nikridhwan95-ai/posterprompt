# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Perintah

```bash
npm run dev          # Vite dev server, port 5173
npm run build        # tsc -b + binaan production ke dist/
npm run preview      # layan binaan production
npm run test         # suite penuh (192 ujian, 12 fail)
npm run test:watch   # mod tontonan
npm run lint         # oxlint src (dua amaran only-export-components sedia ada)
npm run typecheck    # tsc --noEmit -p tsconfig.app.json
```

Vitest berjalan dengan dua *project*: `unit` (persekitaran node, `src/{lib,data,schemas}/**/*.test.ts`)
dan `ui` (jsdom, `src/**/*.test.tsx`, timeout 30s). Untuk menjalankan sebahagian sahaja:

```bash
npx vitest run --project unit src/lib/prompt/density.test.ts
npx vitest run --project ui -t "nama ujian"
```

## Bahasa

Kod, komen, JSDoc, mesej ralat Zod, label UI dan mesej amaran ditulis dalam **Bahasa Melayu**
(NFR-012). Kekalkan konvensyen ini apabila menambah kod. Identifier TypeScript kekal dalam
bahasa Inggeris. Katalog preset menyimpan teks `Bilingual` (`{ ms, en }`): `ms` untuk UI,
manakala teks prompt memilih `ms` atau `en` mengikut `platform.promptLanguage`.

Rujukan `SDD §…`, `FR-…`, `NFR-…`, `QA-…` dalam komen merujuk spesifikasi SDD-PP-MVP-001
(dokumen sumber tiada dalam repo). Kekalkan penomboran itu apabila menyunting fail berkaitan.

## Seni bina

Aplikasi React 19 + Vite sisi klien sepenuhnya. Tiada backend, tiada API AI, tiada rangkaian
selepas aset dimuat. Alias `@/` → `src/`.

### Enjin prompt (`src/lib/prompt/`)

`generatePrompt(project)` dalam `compose.ts` ialah satu-satunya pintu masuk dan mengikut
susunan tetap:

```
validate (Zod) → normalize → buildContext → fragments → adapter → audit + conflicts
```

Invarian yang tidak boleh dilanggar:

- **Tulen (NFR-008).** Tiada `Date.now()`, tiada rawak, tiada I/O. Input sama → output sama.
  Inilah yang menjadikan fixture regression bermakna; jangan perkenalkan sumber tidak
  deterministik ke dalam mana-mana modul di bawah `lib/prompt/`.
- **Teks pengguna tidak pernah ditulis semula.** `normalize.ts` hanya mengemas ruang, line
  ending dan format HEX. Tarikh tidak ditafsir, ejaan tidak dibetulkan, huruf besar tidak
  diubah. `exactCopy.ts` menyalin nilai mentah; QA-07 membandingkan setiap baris EXACT COPY
  dengan input asal.
- **Kegagalan adapter tidak merosakkan output (NFR-010).** `compose.ts` membungkus
  `adapter.transform()` dalam try/catch dan jatuh balik kepada `universalAdapter` berserta
  amaran.
- **Amaran, bukan sekatan (§10.2).** Konflik reka bentuk dan kegagalan audit menjadi
  `QualityWarning`; hanya kegagalan skema Zod (`ValidationError`) menghalang penjanaan.

Prompt disusun sebagai sepuluh `PromptSection` mengikut `SECTION_ORDER` dalam `types.ts`
(DESIGN TASK … MODEL NOTES). `fragments.ts` membina bahagian; nama fungsinya sengaja sepadan
dengan pseudokod SDD §7.3.

### Adapter platform (`src/lib/prompt/adapters/`)

Enam adapter (`universal`, `chatgpt_image`, `gemini_image`, `midjourney`, `canva`, `adobe`)
berkongsi antara muka `PlatformAdapter { id, version, transform(sections, ctx) }` dan
didaftarkan dalam `adapters/index.ts`. Pembantu render (`renderLabelled`, `renderProse`,
`renderCompact`, `pickSections`) berada dalam `shared.ts`. Adapter yang menanggalkan blok
EXACT COPY daripada prompt utama mesti menetapkan `textSeparated: true` supaya QA-02 kekal
bermakna. Setiap adapter mesti mengekalkan bahagian CONSTRAINTS berserta arahan tersuai
pengguna — ini dikunci oleh ujian.

### Data terpandu katalog (`src/data/`)

Kategori, kanvas, gaya, palet dan platform ialah tatasusunan preset baca sahaja. `data/types.ts`
tidak boleh mengimport modul lain (NFR-007) supaya katalog kekal bebas daripada skema dan UI.
Kategori menentukan medan mana yang wajib/dipaparkan, labelnya, dan ayat DESIGN TASK — menambah
kategori bermakna menyunting `categories.ts` sahaja, bukan komponen borang.

### Borang dan laluan

`GeneratorLayout` ialah layout route yang memayungi `/generator` dan `/hasil`, memegang satu
`useForm<PosterProject>` melalui `FormProvider`. Berulang-alik antara wizard dan hasil tidak
menghilangkan input (FR-019). Wizard lima langkah (`kandungan`, `kanvas`, `gaya`, `susun_atur`,
`platform`) — pemetaan langkah↔medan berada dalam `STEP_FIELDS`/`stepForField` dalam
`schemas/project.ts`, jadi amaran boleh memaut terus ke langkah yang betul.

### Simpanan draf (`src/lib/storage/draft.ts`)

Tidak aktif secara lalai; menulis hanya selepas persetujuan pengguna, debounce 500 ms, ke tiga
kunci `posterprompt:{draft,consent,ui}:v1`. Semua akses localStorage dibungkus try/catch.
Draf daripada versi skema tidak dikenali dipulangkan sebagai `{ status: 'incompatible', raw }`
supaya pengguna boleh memuat turun teksnya sebelum memadam — jangan buang draf secara senyap.

## Versi

`SCHEMA_VERSION` dan `TEMPLATE_VERSION` dalam `src/data/version.ts` direkod dalam setiap output.

- Naikkan **SCHEMA_VERSION** apabila bentuk `PosterProject` berubah, dan tambah laluan migrasi
  dalam `src/lib/storage/draft.ts`.
- Naikkan **TEMPLATE_VERSION** apabila mana-mana preset, fragmen atau adapter mengubah teks
  output, kemudian jalankan semula suite regression.

## Keselamatan

CSP ditakrifkan **sekali** dalam `src/lib/csp.ts` dan dikuatkuasakan dua kali: pengepala HTTP
(`vercel.json`, `public/_headers`) dan tag `<meta>` yang disuntik ke binaan production oleh
`cspMetaPlugin` dalam `vite.config.ts` (dev dikecualikan kerana HMR memerlukan skrip sebaris).
`script-src` ialah `'self'` tanpa `unsafe-inline`; `style-src` membenarkan gaya sebaris kerana
warna palet pengguna ditetapkan melalui atribut `style` pada pratonton zon. Jika CSP diubah,
ubah `csp.ts` dan pastikan ketiga-tiga tempat kekal selari.

`dangerouslySetInnerHTML` tidak digunakan di mana-mana dan tidak boleh diperkenalkan (NFR-011).

## Ujian

Fixtures dalam `src/tests/fixtures.ts` merangkumi satu projek bagi setiap kategori
(`categoryFixtures`), setiap adapter (`platformFixtures`), serta input minimum, biasa, padat,
had maksimum dan Unicode Melayu/Arab. Gunakan `makeProject(overrides)` untuk projek baharu
dan bukan membina objek `PosterProject` dari kosong. Ujian komponen merender aplikasi penuh
melalui `renderApp(route)` dalam `src/tests/renderApp.tsx`.

Ujian menegaskan teks output secara langsung (tiada snapshot Vitest), jadi mengubah mana-mana
preset, fragmen atau adapter akan memecahkan penegasan itu dengan sengaja — betulkan penegasan,
jangan longgarkan ia.

## Di luar skop V1

Penjanaan imej, akaun pengguna, pangkalan data, muat naik aset, pembayaran, kolaborasi dan
integrasi API terus dengan mana-mana platform AI. Nama platform hanyalah sasaran output.
