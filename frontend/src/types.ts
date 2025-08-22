export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  question: string;
  image?: string;
  options: Option[];
  categoryId?: string;
}
