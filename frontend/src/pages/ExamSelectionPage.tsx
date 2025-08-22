import React from "react";
import { Link, useParams } from "react-router-dom";
import { licenses } from "../data/licenses.ts";
import { examConfigs } from "../data/examConfigs.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

const ExamSelectionPage: React.FC = () => {
	const { licenseId } = useParams<{ licenseId: string }>();
	const license = licenses.find((l) => l.id === licenseId);

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

	const configs = examConfigs[licenseId!] || [];

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Header
				title={`${license.name} – Prüfungsmodus`}
				backTo={`/${licenseId}`}
			/>
			<main className="container max-w-xl w-full mx-auto flex-grow px-4 py-8 space-y-6">
				{configs.length === 0
					? <p>Für diese Lizenz sind keine Prüfungen definiert.</p>
					: (
						configs.map((exam) => (
							<Link
								to={`/${licenseId}/exam/${exam.id}`}
								key={exam.id}
								className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
							>
								<div className="flex justify-between items-center">
									<h3 className="font-semibold">
										{exam.title}
									</h3>
									<span className="text-sm text-gray-500">
										{exam.duration} Min
									</span>
								</div>
							</Link>
						))
					)}
			</main>
			<Footer />
		</div>
	);
};

export default ExamSelectionPage;
