import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { licenses } from '../data/licenses'
import { categoriesByLicense } from '../data/categories'
import type { Question } from '../types'

const fetchQuestions = async (
  licenseId: string,
  categoryId: string
): Promise<Question[]> => {
  const res = await fetch(
    `/api/questions?licenseId=${licenseId}&categoryId=${categoryId}`
  )
  if (!res.ok) throw new Error('Fehler beim Laden der Fragen')
  return res.json()
}

const QuizPage: React.FC = () => {
  const { licenseId, categoryId } = useParams<{
    licenseId: string
    categoryId: string
  }>()
  const navigate = useNavigate()
  const license = licenses.find((l) => l.id === licenseId)
  const category = licenseId
    ? categoriesByLicense[licenseId]?.find((c) => c.id === categoryId)
    : null

  // React Query Hook
  const { data: questions, isLoading, error } = useQuery<Question[], Error>({
    queryKey: ['questions', licenseId, categoryId],
    queryFn: () => fetchQuestions(licenseId!, categoryId!),
    enabled: Boolean(licenseId && categoryId)
  })

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  if (!license || !category) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Kategorie nicht gefunden.</p>
        <Link to={`/${licenseId}`} className="text-primary-600 underline">
          Zurück zur Kategorien-Auswahl
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lädt Fragen…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Fehler: {error.message}</p>
      </div>
    )
  }
  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Keine Fragen gefunden.</p>
      </div>
    )
  }

  const question = questions[currentIdx]
  const selected = answers[question.id]

  const handleSelect = (optId: string) => {
    setAnswers((a) => ({ ...a, [question.id]: optId }))
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      navigate(`/${licenseId}/${categoryId}/results`, {
        state: { questions, answers }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary-600 text-white py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Link
            to={`/${licenseId}`}
            className="flex items-center text-gray-200 hover:text-white"
          >
            Zurück
          </Link>
          <h1 className="ml-4 text-lg font-semibold">
            {license.name} – {category.name}
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-4 text-gray-700">
          Frage {currentIdx + 1} von {questions.length}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="mb-6 text-xl font-medium">{question.text}</h2>
          <div className="space-y-4">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-4 border rounded-lg
                  ${
                    selected === opt.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {opt.text}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={!selected}
            className="mt-6 bg-primary-600 text-white px-6 py-2 rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentIdx < questions.length - 1
              ? 'Nächste Frage'
              : 'Ergebnis anzeigen'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default QuizPage
