import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/components/Toast'
import { GeneratorLayout } from '@/features/generator/GeneratorLayout'
import { ResultPage } from '@/features/generator/ResultPage'
import { WizardPage } from '@/features/generator/WizardPage'
import { Landing } from '@/pages/Landing'
import { NotFound } from '@/pages/NotFound'
import { Privacy } from '@/pages/Privacy'
import { ErrorBoundary } from './ErrorBoundary'
import { Layout } from './Layout'

/**
 * Peta laluan (§5.1).
 *
 * GeneratorLayout memayungi /generator dan /hasil sebagai satu layout route,
 * jadi keadaan borang kekal hidup ketika pengguna berulang-alik antara
 * keduanya (FR-019).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route element={<GeneratorLayout />}>
          <Route path="generator" element={<WizardPage />} />
          <Route path="hasil" element={<ResultPage />} />
        </Route>
        <Route path="privasi" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  )
}
