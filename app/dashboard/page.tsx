/**
 * Dashboard Page
 * Shows overview statistics and quick access to main features
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import Link from 'next/link';

async function getStats() {
  // In a real implementation, you'd fetch these from API
  // For now, return placeholder data
  return {
    totalParticipants: 0,
    totalCampaigns: 0,
  };
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PrecoTracks CRM
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {session.name || session.email}
              </p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Participantes
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalParticipants}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Campañas Enviadas
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalCampaigns}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/participants/import"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">
                Importar Participantes
              </h3>
              <p className="text-sm text-gray-600">
                Sube un archivo CSV con participantes
              </p>
            </Link>
            <Link
              href="/participants"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">
                Ver Participantes
              </h3>
              <p className="text-sm text-gray-600">
                Busca y gestiona participantes
              </p>
            </Link>
            <Link
              href="/campaigns/new"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">
                Crear Campaña
              </h3>
              <p className="text-sm text-gray-600">
                Crea y envía una nueva campaña
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

