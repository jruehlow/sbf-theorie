// src/pages/HomePage.tsx
import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.tsx";
import { lastUpdated, questionBankState } from "../data/metadata.ts";
import { categoriesByLicense } from "../data/categories.ts";
import { licenses } from "../data/licenses.ts";
import Card from "../components/Card.tsx";
import Page from "../components/Page.tsx";
import ProgressBar from "../components/ProgressBar.tsx";

const getLicenseProgress = (licenseId: string) => {
  const categories = categoriesByLicense[licenseId] ?? [];
  let done = 0;
  let total = 0;

  for (const category of categories) {
    total += category.questionCount * 3;
    const json = localStorage.getItem(`quiz-progress-${licenseId}-${category.id}`);
    if (!json) continue;

    try {
      const saved = JSON.parse(json);
      const reviews: Record<string, { count: number }> = saved.reviews || {};
      done += Object.values(reviews).reduce(
        (sum, { count }) => sum + Math.min(count, 3),
        0,
      );
    } catch {
      // Ignore broken local progress entries.
    }
  }

  return {
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-blue-800 bg-blue-700 text-white">
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
          <p className="text-sm font-medium text-blue-100">Prüfungstrainer</p>
          <h1 className="mt-1 text-2xl font-bold">
            SBF Binnen/See Theorie
          </h1>
        </div>
      </header>

      <Page footer={<Footer />} contentClassName="gap-6">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Weiterlernen</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Trainiere nach Themen, wiederhole schwache Fragen und starte den
            Prüfungsmodus, wenn du bereit bist.
          </p>
          <Link
            to="/licenses"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Lernbereich öffnen
          </Link>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Fortschritt
          </h2>
          {licenses.map((license) => {
            const progress = getLicenseProgress(license.id);
            return (
              <Link to={`/${license.id}`} key={license.id} className="block">
                <Card interactive className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{license.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {license.desc}
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
        </section>

        <p className="text-xs text-slate-500">
          Fragenbank {questionBankState}, letzte Aktualisierung: {lastUpdated}
        </p>
      </Page>
    </div>
  );
};

export default HomePage;
