import React from "react";
import { Link } from "react-router-dom";
import { licenses } from "../data/licenses.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import Card from "../components/Card.tsx";
import Page from "../components/Page.tsx";

const LicenseSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Bootsscheine" backTo="/" />
      <Page footer={<Footer />} contentClassName="gap-4">
        {licenses.map(({ id, name, desc, icon: Icon }) => (
          <Link
            to={`/${id}`}
            key={id}
            className="block"
          >
            <Card interactive className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-7 w-7" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-lg">{name}</h2>
                    <p className="text-sm text-slate-500">{desc}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-blue-700">
                  Start
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </Page>
    </div>
  );
};

export default LicenseSelectionPage;
