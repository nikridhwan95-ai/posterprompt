# PosterPrompt — MVP v1.0

Generator prompt poster berstruktur. Aplikasi web sisi klien yang menukar maklumat acara,
ucapan, pertandingan atau hebahan kepada prompt poster AI yang tersusun untuk ChatGPT Image,
Gemini Image, Midjourney, Canva dan Adobe.

Dibina mengikut **SDD-PP-MVP-001** (`SDD_PosterPrompt_MVP_Versi_1.0.docx`).

> Fokus MVP bukan menghasilkan poster, tetapi menghasilkan **arahan reka bentuk** yang lengkap
> dan konsisten. Tiada akaun, tiada pangkalan data, tiada panggilan API AI — semua pemprosesan
> berlaku dalam pelayar.

---

## Mula

```bash
npm install
```

```bash
npm run dev
```

| Skrip | Fungsi |
| --- | --- |
| `npm run dev` | Pelayan pembangunan Vite pada port 5173 |
| `npm run build` | Semakan jenis penuh + binaan production ke `dist/` |
| `npm run preview` | Layan binaan production secara tempatan |
| `npm run test` | Keseluruhan suite Vitest (unit + komponen) |
| `npm run test:watch` | Vitest dalam mod tontonan |
| `npm run lint` | oxlint ke atas `src/` |

---

## Aliran pengguna

`/` landing → `/generator` wizard lima langkah → `/hasil` empat blok output → `/privasi` notis privasi

1. **Kandungan** — kategori, bahasa dan teks rasmi. Medan berubah mengikut kategori.
2. **Kanvas** — preset saiz atau dimensi tersuai, orientasi dan destinasi.
3. **Gaya** — gaya utama, mood, palet, warna tersuai dan tipografi.
4. **Susun atur** — komposisi, subjek, dan zon logo, penaja, QR serta footer.
5. **Platform** — adapter sasaran, bahasa arahan, semakan dan penjanaan.

Output: **Prompt Utama**, **Teks Tepat**, **Negative Prompt**, **Nota Layout**, berserta meter
ketumpatan, amaran konflik dan audit kualiti QA-01 hingga QA-07.

---

## Seni bina

```
src/
  app/                 shell, laluan, ErrorBoundary
  components/          komponen UI boleh guna semula
  features/generator/  wizard, panel hasil, pratonton zon, meter ketumpatan
  data/                katalog kategori, kanvas, gaya, palet, platform, versi
  lib/prompt/          normalizer, composer, adapters, audit kualiti
  lib/storage/         localStorage, consent dan migrasi skema
  schemas/             skema Zod dan jenis TypeScript
  tests/               fixtures dan pembantu render

vercel.json            pengepala keselamatan untuk hosting Vercel
public/_headers        pengepala keselamatan untuk hos gaya Netlify
```

**Enjin prompt tulen.** `generatePrompt()` dalam `src/lib/prompt/compose.ts` tidak memanggil
`Date.now()`, tidak menggunakan nombor rawak dan tidak melakukan I/O. Input yang sama sentiasa
menghasilkan output yang sama (NFR-008) — inilah yang membolehkan fixture regression bermakna.

**Teks pengguna tidak pernah ditulis semula.** Enjin menyusun arahan visual *di sekeliling* teks
rasmi. Tarikh tidak ditafsir, ejaan tidak dibetulkan, huruf besar tidak diubah. Semakan QA-07
membandingkan setiap baris blok EXACT COPY dengan input asal.

**Adapter berasingan.** Setiap platform ialah satu modul dengan antara muka yang sama. Kegagalan
satu adapter jatuh balik kepada Universal berserta amaran, tanpa merosakkan draf (NFR-010).

**Keadaan borang hidup merentas laluan.** `GeneratorLayout` ialah layout route yang memayungi
`/generator` dan `/hasil`, jadi berulang-alik antara borang dan hasil tidak menghilangkan input
(FR-019).

---

## Keselamatan

Content Security Policy dikuatkuasakan dua kali (§11.3):

- **Pengepala HTTP** melalui `vercel.json` dan `public/_headers` — termasuk
  `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy` dan HSTS.
- **Tag `<meta>`** yang disuntik ke dalam binaan production oleh plugin Vite dalam
  `vite.config.ts`, supaya dasar itu tetap berkuat kuasa pada hos statik biasa.

Dasar tunggal ditakrifkan sekali dalam `src/lib/csp.ts`. `script-src` ialah `'self'` tanpa
`unsafe-inline`; `style-src` membenarkan gaya sebaris kerana warna palet pengguna ditetapkan
melalui atribut `style` pada pratonton zon.

Semua kandungan pengguna dirender sebagai text node. `dangerouslySetInnerHTML` tidak digunakan
di mana-mana (NFR-011).

---

## Privasi

Tiada kandungan poster meninggalkan pelayar. Tiada analitik, tiada telemetri, tiada panggilan
rangkaian selepas aset dimuatkan.

Simpanan draf **tidak aktif secara lalai**. Apabila diaktifkan oleh pengguna, tiga kunci
digunakan:

| Kunci | Kandungan |
| --- | --- |
| `posterprompt:draft:v1` | Objek `PosterProject` dalam JSON |
| `posterprompt:consent:v1` | Persetujuan simpan draf |
| `posterprompt:ui:v1` | Langkah terakhir dan pilihan paparan |

Draf ditulis selepas debounce 500 ms. Mematikan persetujuan turut memadam draf. Draf daripada
versi skema yang tidak dikenali **tidak dibuang secara senyap** — pengguna diberi pilihan memuat
turun teksnya sebelum memadam.

---

## Versi

`SCHEMA_VERSION` dan `TEMPLATE_VERSION` dalam `src/data/version.ts` direkod dalam setiap output.

- Naikkan **SCHEMA_VERSION** apabila bentuk `PosterProject` berubah, dan tambah laluan migrasi
  dalam `src/lib/storage/draft.ts`.
- Naikkan **TEMPLATE_VERSION** apabila mana-mana preset, fragmen atau adapter mengubah teks
  output, dan jalankan semula suite regression.

---

## Ujian

200 ujian merentas 12 fail.

- **Unit** (persekitaran node) — normalizer, skor ketumpatan termasuk sempadan band, composer dan
  determinismenya, keenam-enam adapter, peraturan negative prompt, audit QA-01…07, pengesanan
  konflik, skema Zod bagi setiap kategori, dan migrasi storan.
- **Komponen** (jsdom) — medan dinamik mengikut kategori, sekatan dimensi tersuai, salin setiap
  tab, fallback papan klip, pemeliharaan Unicode Melayu dan Arab, pemulihan serta pemadaman draf,
  pengesahan set semula, peringatan penggunaan aset dan penunjuk auto-save.

Suite ini turut mengunci beberapa pembetulan yang ditemui semasa audit kepatuhan SDD: setiap
adapter mesti mengekalkan bahagian kekangan berserta arahan tersuai pengguna, tajuk yang hanya
mengandungi ruang kosong mesti ditolak, dan set semula tidak boleh membenarkan simpanan tertunda
menulis draf semula selepas kunci dipadam.

Suite ini juga mengunci beberapa pembetulan lanjutan: penunjuk auto-save tidak boleh menyatakan
"disimpan" apabila localStorage menolak tulisan, draf separuh siap yang kehilangan keseluruhan
bahagian dilengkapkan dengan nilai lalai sebelum dipulihkan, suis simpanan draf mesti mempunyai
nama boleh capai, dan setiap laluan mesti mempunyai satu landmark `<main>` yang menjadi sasaran
pautan langkau.

Fixtures dalam `src/tests/fixtures.ts` meliputi satu projek bagi setiap kategori, satu bagi
setiap adapter, serta input minimum, biasa, padat dan had maksimum.

---

## Di luar skop V1

Penjanaan imej, akaun pengguna, pangkalan data, muat naik aset, pembayaran, kolaborasi dan
integrasi API terus dengan mana-mana platform AI. Nama platform disenaraikan sebagai sasaran
output sahaja; PosterPrompt tidak berhubung dengan perkhidmatan tersebut dan tidak menjamin hasil
akhir model.
