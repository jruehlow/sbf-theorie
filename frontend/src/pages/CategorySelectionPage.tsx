import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { categoriesByLicense } from '../data/categories'
import { licenses } from '../data/licenses'

const CategorySelectionPage: React.FC = () => {
  const { licenseId } = useParams<{ licenseId: string }>()
  const license = licenses.find((l) => l.id === licenseId)
  const categories = licenseId
    ? categoriesByLicense[licenseId] || []
    : []

  if (!license) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Lizenz nicht gefunden.</p>
        <Link to="/" className="text-primary-600 underline">
          Zurück zur Auswahl
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary-600 text-white py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Link to="/" className="mr-4 text-gray-200 hover:text-white">
            ◀ Zurück
          </Link>
          <h1 className="text-xl font-semibold">
            {license.name} – Kategorien
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 space-y-4">
        {categories.map((cat) => {
          const progress = 0 // später aus API/State holen
          return (
            <Link
              to={`/${licenseId}/${cat.id}/quiz`}
              key={cat.id}
              className="block bg-white p-4 rounded-lg shadow
                         hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">
                  {cat.name} • {cat.questionCount} Fragen
                </h2>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded mb-1">
                <div
                  className="bg-red-500 h-2 rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{progress}%</p>
            </Link>
          )
        })}
      </main>
    </div>
  )
}

export default CategorySelectionPage
