// src/pages/HomePage.tsx
import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.tsx";
import { lastUpdated, questionBankState } from "../data/metadata.ts";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white py-6">
        <h1 className="text-2xl text-center font-bold">
          SBF Binnen/See Theorie
        </h1>
      </header>

      <main className="flex-grow mx-auto px-4 py-8 space-y-4 max-w-xl w-full">
        <p>
          Willkommen beim SBF Binnen/See Theorie trainings App! Hier kannst du
          deine Kenntnisse in der Prüfungs-Theorie für Binnen und See testen,
          wiederholen und festigen.
        </p>
        <p>
          Fragenbank {questionBankState}, letzte Aktualisierung: {lastUpdated}
        </p>
        <div className="mt-6 text-center">
          <Link
            to="/licenses"
            className="
              inline-block px-6 py-3 bg-blue-600 text-white
              font-semibold rounded-lg shadow hover:bg-blue-700
              transition
            "
          >
            Start
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
