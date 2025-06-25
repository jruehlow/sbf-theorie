import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Question } from "../types.ts";
import { licenses } from "../data/licenses.ts";
import { categoriesByLicense } from "../data/categories.ts";
import { FaCheck, FaChevronLeft, FaX } from "react-icons/fa6";

const API_URL = "http://localhost:8000";

interface ReviewData {
  ef: number; // easiness factor
  interval: number; // days until next review
  due: number; // timestamp in ms
  count: number; // consecutive correct answers
}

async function fetchQuestions(
  licenseId: string,
  categoryId: string,
): Promise<Question[]> {
  const res = await fetch(
    `${API_URL}/api/questions/?license=${licenseId}&category=${categoryId}`,
  );
  if (!res.ok) {
    throw new Error(`Fehler beim Laden: ${res.status} ${res.statusText}`);
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
    ? categoriesByLicense[licenseId]?.find((c) => c.id === categoryId)
    : null;

  const STORAGE_KEY = `quiz-progress-${licenseId}-${categoryId}`;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<Record<string, ReviewData>>({});
  const [currentQId, setCurrentQId] = useState<string | null>(null);

  const { data: questions, isLoading, error } = useQuery<
    Question[],
    Error
  >({
    queryKey: ["questions", licenseId, categoryId],
    queryFn: () => fetchQuestions(licenseId!, categoryId!),
    enabled: Boolean(licenseId && categoryId),
    staleTime: Infinity,
  });

  // on load—or when questions arrive—restore or init state
  useEffect(() => {
    if (!questions) return;
    const json = localStorage.getItem(STORAGE_KEY);
    let saved: {
      answers?: Record<string, string>;
      reviews?: Record<string, ReviewData>;
      current?: string;
    } = {};
    if (json) {
      try {
        saved = JSON.parse(json);
      } catch {
        saved = {};
      }
    }
    const savedAnswers = saved.answers || {};
    const savedReviews = saved.reviews || {};
    const savedCurrent = saved.current || null;

    setAnswers(savedAnswers);
    setReviews(savedReviews);

    const now = Date.now();
    // open = not mastered (count<3) and due ≤ now
    const openIds = questions
      .filter((q) => {
        const r = savedReviews[q.id];
        const count = r?.count ?? 0;
        const due = r?.due ?? 0;
        return count < 3 && due <= now;
      })
      .map((q) => q.id);

    if (openIds.length === 0) {
      // all done → straight to results
      navigate(`/${licenseId}/${categoryId}/results`, {
        state: { questions, answers: savedAnswers, reviews: savedReviews },
      });
      return;
    }

    const initial = openIds.includes(savedCurrent!)
      ? savedCurrent!
      : openIds[Math.floor(Math.random() * openIds.length)];
    setCurrentQId(initial);
  }, [questions, licenseId, categoryId, navigate]);

  // persist every time answers / reviews / current change
  useEffect(() => {
    if (!currentQId) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers, reviews, current: currentQId }),
    );
  }, [answers, reviews, currentQId, STORAGE_KEY]);

  if (!license || !category) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Lizenz/Kategorie nicht gefunden.</p>
        <Link to="/" className="text-blue-600 underline">
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
        <p className="text-red-600">Fehler: {error.message}</p>
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Frage wird geladen…</p>
      </div>
    );
  }

  // derive current question + progress
  const question = questions.find((q) => q.id === currentQId)!;
  const selected = answers[currentQId];
  const answered = selected !== undefined;

  const total = questions.length;
  const masteredCount = Object.values(reviews).filter((r) => r.count >= 3)
    .length;
  const percentDone = Math.round((masteredCount / total) * 100);

  const handleSelect = (optId: string) => {
    if (answered) return;
    const opt = question.options.find((o) => o.id === optId)!;
    const isCorrect = opt.isCorrect === true;

    setAnswers((a) => ({ ...a, [currentQId]: optId }));

    setReviews((r) => {
      const prev = r[currentQId] || {
        ef: 2.5,
        interval: 0,
        due: Date.now(),
        count: 0,
      };
      const now = Date.now();
      let newCount = isCorrect ? prev.count + 1 : 0;
      let newInterval: number;
      let newEF = prev.ef;

      if (isCorrect) {
        if (newCount === 1) {
          newInterval = 1;
        } else if (newCount === 2) {
          newInterval = 6;
        } else {
          newInterval = Math.round(prev.interval * prev.ef);
        }
        newEF = prev.ef + 0.1; // quality=5 → EF += 0.1
      } else {
        newInterval = 1;
        // on wrong: keep EF unchanged, reset count
      }

      const newDue = now + newInterval * 24 * 60 * 60 * 1000;
      return {
        ...r,
        [currentQId]: {
          ef: newEF,
          interval: newInterval,
          due: newDue,
          count: newCount,
        },
      };
    });
  };

  const handleNext = () => {
    const now = Date.now();
    const openIds = questions
      .filter((q) => {
        const r = reviews[q.id];
        const count = r?.count ?? 0;
        const due = r?.due ?? 0;
        return count < 3 && due <= now;
      })
      .map((q) => q.id);

    if (openIds.length === 0) {
      navigate(`/${licenseId}/${categoryId}/results`, {
        state: { questions, answers, reviews },
      });
      return;
    }

    const candidates = openIds.filter((id) => id !== currentQId);
    const nextId = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : currentQId!;
    setCurrentQId(nextId);
  };

  const handleReset = () => {
    if (globalThis.confirm("Fortschritt wirklich zurücksetzen?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAnswers({});
      setReviews({});
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
            {masteredCount} / {total} beherrscht
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

          {question.image && (
            <div className="mb-6 text-center">
              <img
                src={`${API_URL}/${question.image}`}
                alt="Illustration zur Frage"
                className="w-full h-auto max-w-1/10 mx-auto rounded"
              />
            </div>
          )}

          <div className="space-y-4">
            {question.options.map((opt) => {
              let style = "border-gray-200 hover:border-gray-300";
              let icon = null;

              if (answered) {
                if (opt.isCorrect) {
                  style = "border-green-500 bg-green-50 text-green-800";
                  icon = <FaCheck className="w-5 h-5 text-green-500" />;
                } else if (opt.id === selected) {
                  style = "border-red-500 bg-red-50 text-red-800";
                  icon = <FaX className="w-5 h-5 text-red-500" />;
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
              transition ${
              answered
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 opacity-50 cursor-not-allowed"
            }
            `}
          >
            {percentDone === 100 ? "Ergebnis anzeigen" : "Nächste Frage"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
