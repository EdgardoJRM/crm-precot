/**
 * Campaigns List Page - Improved Version
 * Shows all campaigns with their status
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import CampaignsList from './components/CampaignsList';
import Layout from '@/app/components/Layout';
import Link from 'next/link';

export default async function CampaignsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
            <p className="mt-2 text-sm text-gray-900">
              Gestiona todas tus campañas de email
            </p>
          </div>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Campaña
          </Link>
        </div>

        {/* Campaigns List */}
        <CampaignsList />
      </div>
    </Layout>
  );
}
