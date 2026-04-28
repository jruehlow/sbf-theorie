import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Question } from "../types.ts";
import { licenses } from "../data/licenses.ts";
import { categoriesByLicense } from "../data/categories.ts";
import Header from "../components/Header.tsx";
import AnswerOption from "../components/AnswerOption.tsx";
import Button from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import Page from "../components/Page.tsx";
import ProgressBar from "../components/ProgressBar.tsx";

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
  }, [questions, STORAGE_KEY]);

  // every time we switch to a new question, clear any previous answer
  useEffect(() => {
    if (!currentQId) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQId];
      return next;
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

  const question = useMemo(() => {
    if (!questions || !currentQId) return null;
    const rawQuestion = questions.find((q) => q.id === currentQId);
    if (!rawQuestion) return null;

    return {
      ...rawQuestion,
      options: [...rawQuestion.options].sort(() => Math.random() - 0.5),
    };
  }, [questions, currentQId]);

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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header
          title={category.name}
          backTo={"/" + licenseId}
        />

        <Page>
          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Abgeschlossen
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Alle Fragen beherrscht
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Du hast alle Fragen dreimal korrekt beantwortet. Du kannst die
              Kategorie zurücksetzen und von vorn trainieren.
            </p>
            <Button
              type="button"
              variant="danger"
              className="mt-6"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setAnswers({});
                setReviews({});
                setCurrentQId(null);
                setFinished(false);
              }}
            >
              Quiz zurücksetzen
            </Button>
          </Card>
        </Page>
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
  if (!currentQId || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Frage wird geladen…</p>
      </div>
    );
  }

  const selected = answers[currentQId];
  const answered = selected !== undefined;

  // calculate progress
  const total = questions.length * 3;
  const done = questions.reduce((acc, q) => {
    const c = reviews[q.id]?.count ?? 0;
    return acc + Math.min(c, 3);
  }, 0);
  const percentDone = Math.round((done / total) * 100);

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
    // Find all questions with count < 3
    const openQuestions = questions.filter((q) => {
      const count = reviews[q.id]?.count ?? 0;
      return count < 3;
    });

    // If none left, mark finished
    if (openQuestions.length === 0) {
      setFinished(true);
      return;
    }

    // Build a pool of candidates (avoid current question if possible)
    const candidateIds = openQuestions
      .map((q) => q.id)
      .filter((id) => id !== currentQId);
    const pool = candidateIds.length > 0 ? candidateIds : [currentQId!];

    // Compute weights - quadratic weighting so worse answered questions occur more frequently
    const weights = pool.map((id) => {
      const count = reviews[id]?.count ?? 0;
      return (3 - count) * (3 - count);
    });

    // Pick one at random, proportional to its weight
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let r = Math.random() * totalWeight;
    let nextId = pool[0];
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        nextId = pool[i];
        break;
      }
    }

    // Reset the answers and move on
    setAnswers({});
    setCurrentQId(nextId);
  };

  const handleReset = () => {
    if (globalThis.confirm("Fortschritt wirklich zurücksetzen?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAnswers({});
      setReviews({});
      setCurrentQId(null);
      navigate(`/${licenseId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title={category.name}
        backTo={"/" + licenseId}
        onReset={handleReset}
        resetText="Zurücksetzen"
      />

      <ProgressBar value={percentDone} className="h-1 rounded-none" />

      <Page contentClassName="pb-28">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
          <span>{done} / {total} Lernschritte</span>
          <span className="font-semibold text-blue-700">{percentDone}%</span>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 space-y-4 sm:p-6">
            <h2 className="text-lg font-semibold leading-7 sm:text-xl">
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

            <div className="space-y-2">
              {question.options.map((opt) => (
                <AnswerOption
                  key={opt.id}
                  text={opt.text}
                  reveal={answered}
                  selected={opt.id === selected}
                  correct={opt.isCorrect}
                  disabled={answered}
                  onSelect={() => handleSelect(opt.id)}
                />
              ))}
            </div>

            {answered && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {question.options.find((opt) => opt.id === selected)?.isCorrect
                  ? "Richtig. Diese Frage zählt als ein Schritt Richtung beherrscht."
                  : "Nicht richtig. Die korrekte Antwort ist markiert."}
              </div>
            )}
          </div>
        </Card>
      </Page>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <Button
            type="button"
            onClick={handleNext}
            disabled={!answered}
            fullWidth
          >
            {percentDone === 100 ? "Ergebnis anzeigen" : "Nächste Frage"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
