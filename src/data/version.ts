/**
 * Versi skema dan templat (FR-022, SDD §11.4).
 *
 * SCHEMA_VERSION  — struktur objek PosterProject. Naikkan hanya apabila bentuk
 *                   data berubah; setiap kenaikan perlu laluan migrasi (§8.5).
 * TEMPLATE_VERSION — katalog preset, fragmen prompt dan adapter. Naikkan pada
 *                   setiap perubahan yang mengubah teks output supaya fixture
 *                   regression boleh dikesan (§11.4).
 */
export const SCHEMA_VERSION = '1.0' as const
export const TEMPLATE_VERSION = '1.1.0' as const

/** Versi aplikasi yang dipaparkan pada footer. */
export const APP_VERSION = '1.0.0' as const
