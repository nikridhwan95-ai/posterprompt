import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup, configure } from '@testing-library/react'

// Ujian integrasi penuh boleh mengambil lebih daripada had 1 saat lalai bagi
// pertanyaan findBy* apabila mesin sibuk.
configure({ asyncUtilTimeout: 8000 })

// jsdom tidak melaksanakan API tatal; aplikasi menggunakannya untuk membawa
// fokus ke medan gagal (§10.2).
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// jsdom belum melaksanakan dialog modal; polyfill ringkas ini membolehkan
// laluan showModal sebenar diuji dan bukan hanya sandarannya.
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})
