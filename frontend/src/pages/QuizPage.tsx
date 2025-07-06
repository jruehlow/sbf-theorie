import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Question } from "../types.ts";
import { licenses } from "../data/licenses.ts";
import { categoriesByLicense } from "../data/categories.ts";
import { FaCheck, FaChevronLeft, FaX } from "react-icons/fa6";
import Header from "../components/Header.tsx";

interface ReviewData {
  count: number; // consecutive correct answers
}

async function fetchQuestions(
  licenseId: string,
  categoryId: string,
): Promise<Question[]> {
  const res = await fetch(
    `/api/questions/?license=${licenseId}&category=${categoryId}`,
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
  const [finished, setFinished] = useState(false);
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
    const savedReviews = saved.reviews || {};
    const savedCurrent = saved.current || null;

    setReviews(savedReviews);

    const openIds = questions
      .filter((q) => {
        const r = savedReviews[q.id];
        const count = r?.count ?? 0;
        return count < 3;
      })
      .map((q) => q.id);

    if (openIds.length === 0) {
      setFinished(true);
      return;
    }

    const initial = openIds.includes(savedCurrent!)
      ? savedCurrent!
      : openIds[Math.floor(Math.random() * openIds.length)];
    setCurrentQId(initial);
  }, [questions, licenseId, categoryId, navigate]);

  // every time we switch to a new question, clear any previous answer
  useEffect(() => {
    if (!currentQId) return;
    setAnswers((prev) => {
      // remove the entry for the currentQId so `answered` → false
      const { [currentQId]: _, ...rest } = prev;
      return rest;
    });
  }, [currentQId]);

  // persist every time answers / reviews / current change
  useEffect(() => {
    if (!currentQId) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ reviews, current: currentQId }),
    );
  }, [reviews, currentQId, STORAGE_KEY]);

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
  if (finished) {
    return (
      <div className="min-h-screen max-w-xl bg-gray-50 flex flex-col">
        <Header
          title={category.name}
          backTo={"/" + licenseId}
        />

        <div className="items-center justify-center p-8">
          <h2 className="text-2xl font-semibold mb-4">
            🎉 Herzlichen Glückwunsch! 🎉
          </h2>
          <p className="mb-6">
            Du hast alle Fragen dreimal korrekt beantwortet und damit
            vollständig beherrscht.
          </p>
          <button
            type="reset"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setAnswers({});
              setReviews({});
              setCurrentQId(null);
              setFinished(false);
            }}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Quiz zurücksetzen
          </button>
        </div>
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
        count: 0,
      };
      const newCount = isCorrect ? prev.count + 1 : Math.max(0, prev.count - 1);

      return {
        ...r,
        [currentQId]: {
          count: newCount,
        },
      };
    });
  };

  const handleNext = () => {
    const openIds = questions
      .filter((q) => {
        const r = reviews[q.id];
        const count = r?.count ?? 0;
        return count < 3;
      })
      .map((q) => q.id);

    if (openIds.length === 0) {
      setFinished(true);
      return;
    }

    const candidates = openIds.filter((id) => id !== currentQId);
    const nextId = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : currentQId!;
    setAnswers({});
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
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header
        title={category.name}
        backTo={"/" + licenseId}
        onReset={handleReset}
        resetText="Reset"
      />

      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-blue-600 h-1 transition-all"
          style={{ width: `${percentDone}%` }}
        />
      </div>

      <main className="flex flex-col flex-grow max-w-xl w-full mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg flex flex-col">
          <div className="overflow-auto p-4 space-y-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-medium">
              {question.question}
            </h2>

            {question.image && (
              <div className="text-center my-4">
                <img
                  src={`/${question.image}`}
                  alt="Illustration zur Frage"
                  className=" block mx-auto w-auto h-auto max-w-[80vw] sm:max-w-md max-h-32 sm:max-h-48 object-contain rounded"
                />
              </div>
            )}

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
                  type="button"
                  key={opt.id}
                  disabled={answered}
                  onClick={() => handleSelect(opt.id)}
                  className={`
                    w-full text-left px-3 py-4 sm:px-4 sm:py-3
                    border rounded-lg flex justify-between
                    items-center text-sm sm:text-base
                    transition ${style}
                  `}
                >
                  <span>{opt.text}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6">
            <button
              type="button"
              onClick={handleNext}
              disabled={!answered}
              className={`
                 mt-4 w-full py-4 text-sm sm:text-base rounded-lg text-white 
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
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
