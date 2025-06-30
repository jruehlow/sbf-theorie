import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LicenseSelectionPage from "./pages/LicenseSelectionPage";
import CategorySelectionPage from "./pages/CategorySelectionPage";
import QuizPage from "./pages/QuizPage";
import HomePage from "./pages/HomePage";

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/licenses" element={<LicenseSelectionPage />} />
    <Route path="/:licenseId" element={<CategorySelectionPage />} />
    <Route
      path="/:licenseId/:categoryId/quiz"
      element={<QuizPage />}
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
