import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LicenseSelectionPage from './pages/LicenseSelectionPage'
import CategorySelectionPage from './pages/CategorySelectionPage'
import QuizPage from './pages/QuizPage'

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<LicenseSelectionPage />} />
    <Route path="/:licenseId" element={<CategorySelectionPage />} />
    <Route
      path="/:licenseId/:categoryId/quiz"
      element={<QuizPage />}
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default App
