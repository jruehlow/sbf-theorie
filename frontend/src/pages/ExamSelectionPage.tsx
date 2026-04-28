import React from "react";
import { Link, useParams } from "react-router-dom";
import { licenses } from "../data/licenses.ts";
import { examConfigs } from "../data/examConfigs.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Card from "../components/Card.tsx";
import Page from "../components/Page.tsx";

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
		<div className="min-h-screen bg-slate-50 flex flex-col">
			<Header
				title={`${license.name} – Prüfungsmodus`}
				backTo={`/${licenseId}`}
			/>
			<Page footer={<Footer />} contentClassName="gap-4">
				{configs.length === 0
					? <p>Für diese Lizenz sind keine Prüfungen definiert.</p>
					: (
						configs.map((exam) => (
							<Link
								to={`/${licenseId}/exam/${exam.id}`}
								key={exam.id}
								className="block"
							>
								<Card interactive className="p-5">
									<div className="flex justify-between gap-4">
										<div>
											<h3 className="font-semibold">
												{exam.title}
											</h3>
											<p className="mt-1 text-sm text-slate-500">
												{exam.requirements.reduce(
													(sum, req) => sum + req.count,
													0,
												)} Fragen
											</p>
										</div>
										<span className="shrink-0 text-sm font-semibold text-blue-700">
											{exam.duration} Min
										</span>
									</div>
								</Card>
							</Link>
						))
					)}
			</Page>
		</div>
	);
};

export default ExamSelectionPage;
