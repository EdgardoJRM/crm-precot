/**
 * Participants List Page - Improved Version
 * Shows list of participants with search and filters
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import ParticipantsList from './components/ParticipantsList';
import Layout from '@/app/components/Layout';
import Link from 'next/link';

export default async function ParticipantsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Participantes</h1>
            <p className="mt-2 text-sm text-gray-900">
              Busca y gestiona todos los participantes registrados
            </p>
          </div>
          <Link
            href="/participants/import"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importar CSV
          </Link>
        </div>

        {/* Participants List */}
        <ParticipantsList />
      </div>
    </Layout>
  );
}
