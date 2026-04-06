import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './router/ProtectedRoute'

// Pages — remplacées au fur et à mesure
const LoginPage = () => <div>Login - TODO</div>
const DashboardPage = () => <div>Dashboard - TODO</div>
const ProductFormPage = () => <div>ProductFormPage - TODO</div>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
