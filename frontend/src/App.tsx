import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LicenseSelectionPage from "./pages/LicenseSelectionPage.tsx";
import CategorySelectionPage from "./pages/CategorySelectionPage.tsx";
import QuizPage from "./pages/QuizPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ExamSelectionPage from "./pages/ExamSelectionPage.tsx";
import ExamPage from "./pages/ExamPage.tsx";

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/licenses" element={<LicenseSelectionPage />} />
    <Route path="/:licenseId" element={<CategorySelectionPage />} />
    <Route path="/:licenseId/:categoryId/quiz" element={<QuizPage />} />
    <Route path="/:licenseId/exam" element={<ExamSelectionPage />} />
    <Route path="/:licenseId/exam/:examId" element={<ExamPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
