import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { examConfigs } from "../data/examConfigs.ts";
import { licenses } from "../data/licenses.ts";
import type { Question } from "../types.ts";
import Header from "../components/Header.tsx";
import { FaCheck, FaX } from "react-icons/fa6";

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
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<Header title="Prüfung beendet" backTo={`/${licenseId}/exam`} />
				<main className="max-w-xl w-full mx-auto p-6">
					<h2 className="text-2xl font-semibold mb-4">
						{result.passed ? "🎉 Bestanden!" : "❌ Nicht bestanden"}
					</h2>
					<p className="mb-4">
						Du hast {result.totalCorrect} von {questions.length}
						{" "}
						Fragen korrekt beantwortet.
					</p>
					<button
						type="button"
						onClick={() => navigate(`/${licenseId}/exam`)}
						className="px-6 py-2 bg-blue-600 text-white rounded"
					>
						Zurück zur Auswahl
					</button>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Header title={examConfig.title} backTo={`/${licenseId}/exam`} />
			<div className="bg-gray-200 h-1">
				<div
					className="bg-blue-600 h-1"
					style={{
						width: `${
							((currentIndex + 1) / questions.length) * 100
						}%`,
					}}
				/>
			</div>
			<main className="max-w-xl w-full mx-auto flex-grow p-6">
				<div className="flex justify-between mb-4">
					<span>Frage {currentIndex + 1} / {questions.length}</span>
					<span>
						{minutes}:{seconds.toString().padStart(2, "0")}
					</span>
				</div>
				<h2 className="text-lg font-medium mb-4">
					{currentQ.question}
				</h2>
				{currentQ.image && (
					<div className="mb-4">
						<img
							src={`/${currentQ.image}`}
							alt=""
							className="max-h-48 mx-auto"
						/>
					</div>
				)}
				<div className="space-y-2">
					{currentQ.options.map((opt) => {
						let style = "border-gray-200";
						let icon = null;
						if (answered) {
							if (opt.isCorrect) {
								style = "border-green-500 bg-green-50";
								icon = <FaCheck className="text-green-500" />;
							} else if (opt.id === selected) {
								style = "border-red-500 bg-red-50";
								icon = <FaX className="text-red-500" />;
							}
						}
						return (
							<button
								type="button"
								key={opt.id}
								disabled={answered}
								onClick={() => handleSelect(opt.id)}
								className={`w-full text-left px-3 py-2 border rounded flex justify-between ${style}`}
							>
								<span>{opt.text}</span>
								{icon}
							</button>
						);
					})}
				</div>
				<button
					type="button"
					onClick={handleNext}
					disabled={!answered}
					className={`mt-6 w-full py-3 rounded text-white ${
						answered
							? "bg-blue-600 hover:bg-blue-700"
							: "bg-blue-400 cursor-not-allowed"
					}`}
				>
					{currentIndex === questions.length - 1
						? "Prüfung beenden"
						: "Nächste Frage"}
				</button>
			</main>
		</div>
	);
};

export default ExamPage;
