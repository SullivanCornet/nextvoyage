'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">App Voyage</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/places" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition">
            Voir les lieux
          </Link>
          <Link href="/places/add" className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center transition">
            Ajouter un lieu
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">Outils de développement</h2>
          <div className="space-y-2">
            <Link href="/diagnostic" className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium transition">
              Centre de diagnostic 🔧
            </Link>
            <Link href="/init-db" className="inline-block ml-2 px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded text-blue-800 font-medium transition">
              Initialiser la BD 🗃️
            </Link>
            <Link href="/upload-test" className="inline-block ml-2 px-4 py-2 bg-green-200 hover:bg-green-300 rounded text-green-800 font-medium transition">
              Test Upload Unifié 📤
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 