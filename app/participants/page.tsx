/**
 * Participants List Page
 * Shows list of participants with search and filters
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import ParticipantsList from './components/ParticipantsList';

export default async function ParticipantsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Participantes</h1>
            <a
              href="/participants/import"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Importar CSV
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ParticipantsList />
      </main>
    </div>
  );
}


