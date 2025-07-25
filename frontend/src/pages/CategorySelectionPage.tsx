import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { categoriesByLicense } from "../data/categories.ts";
import { licenses } from "../data/licenses.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";

type ProgressMap = Record<string, number>;

const CategorySelectionPage: React.FC = () => {
  const { licenseId } = useParams<{ licenseId: string }>();
  const license = licenses.find((l) => l.id === licenseId);
  const categories = licenseId ? categoriesByLicense[licenseId] || [] : [];

  const [progressMap, setProgressMap] = useState<ProgressMap>({});

  useEffect(() => {
    if (!licenseId) return;

    const m: ProgressMap = {};
    categories.forEach((cat) => {
      const key = `quiz-progress-${licenseId}-${cat.id}`;
      const json = localStorage.getItem(key);
      let pct = 0;

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

          pct = total > 0 ? Math.round((done / total) * 100) : 0;
        } catch {
          pct = 0;
        }
      }

      m[cat.id] = pct;
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={license.name} backTo="/licenses" />

      <main className="container max-w-xl w-full mx-auto flex-grow px-4 py-8 space-y-6">
        {categories.map((cat) => {
          const progress = progressMap[cat.id] || 0;
          return (
            <Link
              to={`/${licenseId}/${cat.id}/quiz`}
              key={cat.id}
              className="
                block bg-white p-6 rounded-lg shadow
                transform hover:shadow-lg hover:-translate-y-0.5
                transition
              "
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-lg">
                  {cat.name}
                </h2>
                <span className="text-sm text-gray-500">
                  {cat.questionCount} Fragen
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                <div
                  className={`
                    h-2 rounded ${
                    progress === 100 ? "bg-green-500" : "bg-blue-600"
                  }
                  `}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {progress}% beherrscht
              </p>
            </Link>
          );
        })}
      </main>
      <Footer />
    </div>
  );
};

export default CategorySelectionPage;
