import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { ToastProvider } from '@/components/Toast'
import { AppRoutes } from '@/app/App'

/** Render aplikasi penuh pada laluan tertentu untuk ujian komponen. */
export function renderApp(route = '/generator') {
  const user = userEvent.setup()
  const view = render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </MemoryRouter>,
  )
  return { user, ...view }
}

/** Render satu komponen di dalam penyedia toast sahaja. */
export function renderWithToast(ui: ReactElement) {
  const user = userEvent.setup()
  const view = render(<ToastProvider>{ui}</ToastProvider>)
  return { user, ...view }
}
