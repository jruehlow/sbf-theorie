import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { examConfigs } from "../data/examConfigs.ts";
import { licenses } from "../data/licenses.ts";
import type { Question } from "../types.ts";
import Header from "../components/Header.tsx";
import AnswerOption from "../components/AnswerOption.tsx";
import Button from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import Page from "../components/Page.tsx";
import ProgressBar from "../components/ProgressBar.tsx";
import ZoomableImage from "../components/ZoomableImage.tsx";

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

const ExamPage: React.FC = () => {
	const { licenseId, examId } = useParams<
		{ licenseId: string; examId: string }
	>();
	const navigate = useNavigate();

	const license = licenses.find((l) => l.id === licenseId);
	const examConfig = examConfigs[licenseId!]?.find((e) => e.id === examId);

	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [timeLeft, setTimeLeft] = useState<number>(
		examConfig?.duration ? examConfig.duration * 60 : 0,
	);
	const [finished, setFinished] = useState(false);

	// Load all required categories
	const { data, isLoading, error } = useQuery({
		queryKey: ["exam-questions", licenseId, examId],
		queryFn: async () => {
			if (!examConfig) return [];
			const all: Question[] = [];
			for (const req of examConfig.requirements) {
				const qs = await fetchQuestions(licenseId!, req.categoryId);
				const shuffled = [...qs]
					.sort(() => Math.random() - 0.5)
					.slice(0, req.count)
					.map((q) => ({ ...q, categoryId: req.categoryId }));
				all.push(...shuffled);
			}
			return all;
		},
		enabled: !!examConfig,
	});

	useEffect(() => {
		if (data) setQuestions(data);
	}, [data]);

	// Timer
	useEffect(() => {
		if (!timeLeft || finished) return;
		const t = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(t);
					setFinished(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(t);
	}, [timeLeft, finished]);

	if (!license || !examConfig) {
		return (
			<p className="p-8 text-red-600">
				Lizenz oder Prüfung nicht gefunden.
			</p>
		);
	}
	if (isLoading) return <p className="p-8">Fragen werden geladen…</p>;
	if (error) {
		return <p className="p-8 text-red-600">Fehler: {String(error)}</p>;
	}
	if (questions.length === 0) {
		return <p className="p-8">Keine Fragen gefunden.</p>;
	}

	const currentQ = questions[currentIndex];
	const selected = answers[currentQ.id];
	const answered = selected !== undefined;

	const handleSelect = (optId: string) => {
		if (answered) return;
		setAnswers((a) => ({ ...a, [currentQ.id]: optId }));
	};

	const handleNext = () => {
		if (currentIndex < questions.length - 1) {
			setCurrentIndex((i) => i + 1);
		} else {
			setFinished(true);
		}
	};

	// Evaluation
	function evaluateExam() {
		if (!finished || !examConfig || !questions || questions.length === 0) {
			return null;
		}

		const perCategory: Record<string, number> = {};
		let totalCorrect = 0;

		for (const q of questions) {
			const chosen = answers[q.id];
			const correct = q.options.find((o) => o.isCorrect)?.id;
			const isCorrect = chosen === correct;
			if (isCorrect && q.categoryId) {
				totalCorrect++;
				perCategory[q.categoryId] = (perCategory[q.categoryId] || 0) +
					1;
			}
		}

		let passed = false;
		if (examConfig.passingRules.type === "perCategory") {
			passed = Object.entries(examConfig.passingRules.rules).every(
				([cat, min]) => {
					return (perCategory[cat] || 0) >= min;
				},
			);
		} else {
			const totalRequired =
				(examConfig.passingRules.rules as { total: number }).total;
			passed = totalCorrect >= totalRequired;
		}

		return { totalCorrect, perCategory, passed };
	}

	const result = finished ? evaluateExam() : null;

	// Format timer
	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;

	if (finished && result) {
		return (
			<div className="min-h-screen bg-slate-50 flex flex-col">
				<Header title="Prüfung beendet" backTo={`/${licenseId}/exam`} />
				<Page>
					<Card className="p-6">
						<p
							className={`text-sm font-semibold uppercase tracking-wide ${
								result.passed ? "text-emerald-700" : "text-red-700"
							}`}
						>
							{result.passed ? "Bestanden" : "Nicht bestanden"}
						</p>
						<h2 className="mt-2 text-2xl font-semibold">
							{result.totalCorrect} von {questions.length} Fragen korrekt
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-600">
							{result.passed
								? "Das Ergebnis erfüllt die Bestehensregel dieser Prüfung."
								: "Trainiere die schwachen Kategorien weiter und starte danach einen neuen Prüfungsversuch."}
						</p>
						<Button
							type="button"
							onClick={() => navigate(`/${licenseId}/exam`)}
							className="mt-6"
						>
							Zurück zur Auswahl
						</Button>
					</Card>
				</Page>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col">
			<Header title={examConfig.title} backTo={`/${licenseId}/exam`} />
			<ProgressBar
				value={currentIndex + 1}
				max={questions.length}
				className="h-1 rounded-none"
			/>
			<Page contentClassName="pb-28">
				<div className="mb-4 flex justify-between text-sm text-slate-500">
					<span>Frage {currentIndex + 1} / {questions.length}</span>
					<span className="font-semibold text-blue-700">
						{minutes}:{seconds.toString().padStart(2, "0")}
					</span>
				</div>
				<Card className="p-4 sm:p-6">
					<h2 className="text-lg font-semibold leading-7 sm:text-xl">
						{currentQ.question}
					</h2>
					{currentQ.image && (
						<div className="my-4">
							<ZoomableImage
								src={`/${currentQ.image}`}
								alt="Illustration zur Frage"
								className="mx-auto max-h-48 rounded object-contain"
							/>
						</div>
					)}
					<div className="mt-4 space-y-2">
						{currentQ.options.map((opt) => (
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
						{currentIndex === questions.length - 1
							? "Prüfung beenden"
							: "Nächste Frage"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ExamPage;
