export interface Category {
  id: string;
  name: string;
  questionCount: number;
}

export const categoriesByLicense: Record<string, Category[]> = {
  "sbf-binnen": [
    { id: "basisfragen", name: "Basisfragen", questionCount: 72 },
    {
      id: "fragen-binnen ",
      name: "Spezifische Fragen Binnen ",
      questionCount: 181,
    },
    {
      id: "fragen-segeln",
      name: "Spezifische Fragen Segeln",
      questionCount: 47,
    },
  ],
  "sbf-see": [
    // TODO: fill up
  ],
};
