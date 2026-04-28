import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { categoriesByLicense } from "../data/categories.ts";
import { licenses } from "../data/licenses.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import Card from "../components/Card.tsx";
import Page from "../components/Page.tsx";
import ProgressBar from "../components/ProgressBar.tsx";

type ProgressData = {
  percent: number;
  mastered: number;
};

type ProgressMap = Record<string, ProgressData>;

const CategorySelectionPage: React.FC = () => {
  const { licenseId } = useParams<{ licenseId: string }>();
  const license = licenses.find((l) => l.id === licenseId);
  const categories = useMemo(
    () => licenseId ? categoriesByLicense[licenseId] || [] : [],
    [licenseId],
  );

  const [progressMap, setProgressMap] = useState<ProgressMap>({});

  useEffect(() => {
    if (!licenseId) return;

    const m: ProgressMap = {};
    categories.forEach((cat) => {
      const key = `quiz-progress-${licenseId}-${cat.id}`;
      const json = localStorage.getItem(key);
      let pct = 0;
      let mastered = 0;

      if (json) {
        try {
          const saved = JSON.parse(json);
          // saved.reviews: Record<questionId, { count }>
          const reviews: Record<string, { count: number }> = saved.reviews ||
            {};

          const total = cat.questionCount * 3;
          const done = Object.values(reviews).reduce(
            (sum, { count }) => sum + Math.min(count, 3),
            0,
          );
          mastered = Object.values(reviews).filter(({ count }) => count >= 3)
            .length;

          pct = total > 0 ? Math.round((done / total) * 100) : 0;
        } catch {
          pct = 0;
          mastered = 0;
        }
      }

      m[cat.id] = { percent: pct, mastered };
    });

    setProgressMap(m);
  }, [licenseId, categories]);

  if (!license) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Lizenz nicht gefunden.</p>
        <Link to="/" className="text-blue-600 underline">
          Zurück zur Auswahl
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title={license.name} backTo="/licenses" />

      <Page footer={<Footer />} contentClassName="gap-4">
        {categories.map((cat) => {
          const progress = progressMap[cat.id] || {
            percent: 0,
            mastered: 0,
          };
          return (
            <Link
              to={`/${licenseId}/${cat.id}/quiz`}
              key={cat.id}
              className="block"
            >
              <Card interactive className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {progress.mastered} / {cat.questionCount} Fragen
                      beherrscht
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    {progress.percent}%
                  </span>
                </div>
                <ProgressBar
                  value={progress.percent}
                  tone={progress.percent === 100 ? "green" : "blue"}
                  className="mt-4"
                />
              </Card>
            </Link>
          );
        })}
        {licenseId === "sbf-binnen" && (
          <Link
            to={`/${licenseId}/exam`}
            className="block"
          >
            <Card interactive className="border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg text-amber-950">
                    Prüfungsmodus
                  </h2>
                  <p className="mt-1 text-sm text-amber-800">
                    Simuliere eine echte Prüfung mit Zeitlimit.
                  </p>
                </div>
                <span className="text-sm font-semibold text-amber-800">
                  Start
                </span>
              </div>
            </Card>
          </Link>
        )}
      </Page>
    </div>
  );
};

export default CategorySelectionPage;
