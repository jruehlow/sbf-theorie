import React from 'react'

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-gray-400 py-6">
    <div className="container mx-auto px-6 text-center">
      © {new Date().getFullYear()} SBF Binnen Trainer. All rights
      reserved.
    </div>
  </footer>
)

export default Footer
