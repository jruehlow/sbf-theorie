import React from "react";
import { Link } from "react-router-dom";
import { licenses } from "../data/licenses.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";

const LicenseSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Bootsscheine" backTo="/" />
      <main className="flex-grow max-w-xl w-full mx-auto px-4 py-8 space-y-6">
        {licenses.map(({ id, name, desc, icon: Icon }) => (
          <Link
            to={`/${id}`}
            key={id}
            className=" flex items-center justify-between p-6 bg-white rounded-lg shadow transform hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center space-x-4">
              <Icon className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="font-semibold text-lg">{name}</h2>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
            <div className="text-blue-600 font-semibold">Start</div>
          </Link>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default LicenseSelectionPage;
