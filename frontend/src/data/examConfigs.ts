// src/data/examConfigs.ts
export interface ExamRequirement {
	categoryId: string;
	count: number;
	minCorrect?: number; // optional, for per-category pass rules
}

export interface ExamConfig {
	id: string;
	title: string;
	duration: number; // minutes
	requirements: ExamRequirement[];
	passingRules: {
		type: "perCategory" | "total";
		rules: Record<string, number> | { total: number };
	};
}

export const examConfigs: Record<string, ExamConfig[]> = {
	"sbf-binnen": [
		{
			id: "motor-segel",
			title: "SBF-Binnen unter Motor und unter Segel",
			duration: 60,
			requirements: [
				{ categoryId: "basisfragen", count: 7, minCorrect: 5 },
				{ categoryId: "fragen-binnen", count: 23, minCorrect: 18 },
				{ categoryId: "fragen-segeln", count: 7, minCorrect: 5 },
			],
			passingRules: {
				type: "perCategory",
				rules: {
					basisfragen: 5,
					"fragen-binnen": 18,
					"fragen-segeln": 5,
				},
			},
		},
		{
			id: "motor-segel-sbfsee",
			title: "SBF-Binnen unter Motor und unter Segel (Inhaber SBF-See)",
			duration: 50,
			requirements: [
				{ categoryId: "fragen-binnen", count: 23, minCorrect: 18 },
				{ categoryId: "fragen-segeln", count: 7, minCorrect: 5 },
			],
			passingRules: {
				type: "perCategory",
				rules: {
					"fragen-binnen": 18,
					"fragen-segeln": 5,
				},
			},
		},
		{
			id: "motor",
			title: "SBF-Binnen nur unter Motor",
			duration: 45,
			requirements: [
				{ categoryId: "basisfragen", count: 7, minCorrect: 5 },
				{ categoryId: "fragen-binnen", count: 23, minCorrect: 18 },
			],
			passingRules: {
				type: "perCategory",
				rules: {
					basisfragen: 5,
					"fragen-binnen": 18,
				},
			},
		},
		{
			id: "motor-sbfsee",
			title: "SBF-Binnen nur unter Motor (Inhaber SBF-See)",
			duration: 35,
			requirements: [
				{ categoryId: "fragen-binnen", count: 23, minCorrect: 18 },
			],
			passingRules: {
				type: "perCategory",
				rules: {
					"fragen-binnen": 18,
				},
			},
		},
		{
			id: "segel",
			title: "SBF-Binnen nur unter Segel",
			duration: 35,
			requirements: [
				{ categoryId: "basisfragen", count: 18 },
				{ categoryId: "fragen-segeln", count: 7 },
			],
			passingRules: {
				type: "total",
				rules: { total: 20 },
			},
		},
		{
			id: "segel-sbfsee",
			title: "SBF-Binnen nur unter Segel (Inhaber SBF-See)",
			duration: 35,
			requirements: [
				{ categoryId: "basisfragen", count: 14 },
				{ categoryId: "fragen-segeln", count: 7 },
			],
			passingRules: {
				type: "total",
				rules: { total: 17 },
			},
		},
		{
			id: "segel-nach-motor",
			title: "SBF-Binnen unter Segel (Inhaber SBF-Binnen Motor)",
			duration: 15,
			requirements: [{
				categoryId: "fragen-segeln",
				count: 7,
				minCorrect: 5,
			}],
			passingRules: {
				type: "perCategory",
				rules: {
					"fragen-segeln": 5,
				},
			},
		},
	],
};
