import React from 'react'
import { Link } from 'react-router-dom'
import { licenses } from '../data/licenses'

const LicenseSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="text-black py-6">
        <h1 className="text-2xl text-center font-bold">
          Wähle deine Prüfung
        </h1>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 space-y-4">
        {licenses.map(({ id, name, desc, icon: Icon }) => (
          <Link
            to={`/${id}`}
            key={id}
            className="flex items-center justify-between p-4
                       bg-white rounded-lg shadow hover:shadow-md
                       transition"
          >
            <div className="flex items-center space-x-4">
              <Icon className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="font-semibold">{name}</h2>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}

export default LicenseSelectionPage
