export interface Category {
  id: string
  name: string
  questionCount: number
}

export const categoriesByLicense: Record<string, Category[]> = {
  'sbf-binnen': [
    { id: 'seemannschaft', name: 'Seemannenschaft', questionCount: 65 },
    { id: 'gesetzliche-grundlagen', name: 'Gesetzliche Grundlagen', questionCount: 44 },
    { id: 'schallsignale', name: 'Schallsignale', questionCount: 15 },
    { id: 'ausweichregeln', name: 'Ausweichregeln', questionCount: 22 },
    { id: 'lichter-sichtzeichen', name: 'Lichter & Sichtzeichen', questionCount: 53 },
    { id: 'schifffahrtszeichen', name: 'Schifffahrtszeichen', questionCount: 47 },
    { id: 'maschinenanlage', name: 'Maschinenanlage', questionCount: 7 }
  ],
  'sbf-see': [
    { id: 'seemannschaft', name: 'Seemannenschaft', questionCount: 65 },
    { id: 'gesetzliche-grundlagen', name: 'Gesetzliche Grundlagen', questionCount: 44 },
    { id: 'schallsignale', name: 'Schallsignale', questionCount: 15 },
    { id: 'ausweichregeln', name: 'Ausweichregeln', questionCount: 22 },
    { id: 'lichter-sichtzeichen', name: 'Lichter & Sichtzeichen', questionCount: 53 },
    { id: 'schifffahrtszeichen', name: 'Schifffahrtszeichen', questionCount: 47 },
    { id: 'maschinenanlage', name: 'Maschinenanlage', questionCount: 7 }
  ],
}
