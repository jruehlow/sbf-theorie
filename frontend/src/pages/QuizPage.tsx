import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Question } from "../types.ts";
import { licenses } from "../data/licenses.ts";
import { categoriesByLicense } from "../data/categories.ts";
import { FaCheck, FaChevronLeft, FaX } from "react-icons/fa6";

const API_URL = "http://localhost:8000";

async function fetchQuestions(
  licenseId: string,
  categoryId: string
): Promise<Question[]> {
  const res = await fetch(
    `${API_URL}/api/questions/?license=${licenseId}&category=${categoryId}`
  );
  if (!res.ok) {
    throw new Error(
      `Fehler beim Laden: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

const QuizPage: React.FC = () => {
  const { licenseId, categoryId } = useParams<{
    licenseId: string;
    categoryId: string;
  }>();
  const navigate = useNavigate();

  const license = licenses.find((l) => l.id === licenseId);
  const category = licenseId
    ? categoriesByLicense[licenseId]?.find(
        (c) => c.id === categoryId
      )
    : null;

  const STORAGE_KEY = `quiz-progress-${licenseId}-${categoryId}`;
  const [answers, setAnswers] = useState<
    Record<string, string>
  >({});
  const [correctMap, setCorrectMap] = useState<
    Record<string, boolean>
  >({});
  const [currentQId, setCurrentQId] = useState<string | null>(
    null
  );

  const {
    data: questions,
    isLoading,
    error,
  } = useQuery<Question[], Error>({
    queryKey: ["questions", licenseId, categoryId],
    queryFn: () =>
      fetchQuestions(licenseId!, categoryId!),
    enabled: Boolean(licenseId && categoryId),
    staleTime: Infinity,
  });

  // on load—or when questions arrive—restore or init state
  useEffect(() => {
    if (!questions) return;

    const json = localStorage.getItem(STORAGE_KEY);
    let saved: any = {};
    if (json) {
      try {
        saved = JSON.parse(json);
      } catch {
        saved = {};
      }
    }

    const savedAnswers: Record<string, string> =
      saved.answers || {};
    const savedCorrect: Record<string, boolean> =
      saved.correctMap || {};
    const savedCurrent: string | null = saved.current || null;

    setAnswers(savedAnswers);
    setCorrectMap(savedCorrect);

    // compute open questions = unanswered or incorrect
    const openIds = questions
      .map((q) => q.id)
      .filter((id) => savedCorrect[id] !== true);

    if (openIds.length === 0) {
      // all done → straight to results
      navigate(
        `/${licenseId}/${categoryId}/results`,
        { state: { questions, answers: savedAnswers } }
      );
      return;
    }

    // if we have a saved current that's still open, keep it
    const initial = openIds.includes(savedCurrent)
      ? savedCurrent
      : openIds[
          Math.floor(Math.random() * openIds.length)
        ];
    setCurrentQId(initial);
  }, [
    questions,
    licenseId,
    categoryId,
    navigate,
  ]);

  // persist every time answers / correctMap / current change
  useEffect(() => {
    if (!currentQId) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        answers,
        correctMap,
        current: currentQId,
      })
    );
  }, [answers, correctMap, currentQId, STORAGE_KEY]);

  if (!license || !category) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">
          Lizenz/Kategorie nicht gefunden.
        </p>
        <Link
          to="/"
          className="text-blue-600 underline"
        >
          Zurück zur Auswahl
        </Link>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lädt Fragen…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">
          Fehler: {error.message}
        </p>
      </div>
    );
  }
  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Keine Fragen gefunden.</p>
      </div>
    );
  }
  if (!currentQId) {
    // still initializing
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Frage wird geladen…</p>
      </div>
    );
  }

  // current question + progress
  const question = questions.find(
    (q) => q.id === currentQId
  )!;
  const selected = answers[currentQId];
  const answered = selected !== undefined;
  const total = questions.length;
  const correctCount = Object.values(correctMap).filter(
    (v) => v
  ).length;
  const percentDone = Math.round(
    (correctCount / total) * 100
  );

  const handleSelect = (optId: string) => {
    if (answered) return;
    const opt = question.options.find(
      (o) => o.id === optId
    );
    const isCorrect = opt?.isCorrect === true;
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: optId,
    }));
    setCorrectMap((prev) => ({
      ...prev,
      [currentQId]: isCorrect,
    }));
  };

  const handleNext = () => {
    // recompute open pool
    const openIds = questions
      .map((q) => q.id)
      .filter((id) => correctMap[id] !== true);

    if (openIds.length === 0) {
      // done
      navigate(
        `/${licenseId}/${categoryId}/results`,
        { state: { questions, answers, correctMap } }
      );
      return;
    }

    // avoid repeating the same Q if possible
    const candidates = openIds.filter(
      (id) => id !== currentQId
    );
    const nextId =
      candidates.length > 0
        ? candidates[
            Math.floor(Math.random() * candidates.length)
          ]
        : currentQId;
    setCurrentQId(nextId);
  };

  const handleReset = () => {
    if (
      globalThis.confirm(
        "Fortschritt wirklich zurücksetzen?"
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setAnswers({});
      setCorrectMap({});
      setCurrentQId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow">
        <div className="container mx-auto px-4 flex items-center">
          <Link
            to={`/${licenseId}`}
            className="flex items-center text-white hover:opacity-80"
          >
            <FaChevronLeft className="w-5 h-5 mr-2" />
            Kategorien
          </Link>
          <h1 className="ml-4 text-lg font-semibold">
            {license.name} – {category.name}
          </h1>
        </div>
      </header>

      {/* slim top progress */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-blue-600 h-1 transition-all"
          style={{ width: `${percentDone}%` }}
        />
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-700 font-medium">
            {correctCount} / {total} richtig
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-red-600 hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="mb-6 text-xl font-medium">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((opt) => {
              let style = "border-gray-200 hover:border-gray-300";
              let icon = null;

              if (answered) {
                if (opt.isCorrect) {
                  style =
                    "border-green-500 bg-green-50 text-green-800";
                  icon = (
                    <FaCheck className="w-5 h-5 text-green-500" />
                  );
                } else if (opt.id === selected) {
                  style =
                    "border-red-500 bg-red-50 text-red-800";
                  icon = (
                    <FaX className="w-5 h-5 text-red-500" />
                  );
                } else {
                  style = "border-gray-200 text-gray-500";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={answered}
                  className={`
                    w-full text-left p-4 border rounded-lg
                    flex justify-between items-center transition
                    ${style}
                  `}
                >
                  <span>{opt.text}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={!answered}
            className={`
              mt-6 w-full py-2 rounded-lg text-white
              transition
              ${
                answered
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-600 opacity-50 cursor-not-allowed"
              }
            `}
          >
            {percentDone === 100
              ? "Ergebnis anzeigen"
              : "Nächste Frage"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
