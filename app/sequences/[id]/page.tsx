/**
 * Sequence Detail Page
 * Shows sequence details and allows starting it for participants
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { EmailSequence, CampaignFilters } from '@/lib/models/types';
import LayoutClient from '@/app/components/LayoutClient';
import Link from 'next/link';

function SequenceDetailContent() {
  const router = useRouter();
  const params = useParams();
  const sequenceId = params.id as string;
  
  const [sequence, setSequence] = useState<EmailSequence | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [recipientType, setRecipientType] = useState<'all' | 'tags' | 'ids'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadSequence();
  }, [sequenceId]);

  const loadSequence = async () => {
    try {
      const response = await fetch(`/api/sequences/${sequenceId}`);
      const data = await response.json();

      if (data.success) {
        setSequence(data.data);
      }
    } catch (error) {
      console.error('Error loading sequence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!sequence) return;

    setStarting(true);

    try {
      // Build filters
      const filters: CampaignFilters = {};
      
      if (recipientType === 'all') {
        filters.allParticipants = true;
      } else if (recipientType === 'tags') {
        filters.tags = selectedTags;
      } else if (recipientType === 'ids') {
        filters.participantIds = selectedIds;
      }

      const response = await fetch(`/api/sequences/${sequenceId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Secuencia iniciada para ${data.data.participantsAdded} participantes`);
        router.push('/sequences');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <LayoutClient>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando secuencia...</p>
        </div>
      </LayoutClient>
    );
  }

  if (!sequence) {
    return (
      <LayoutClient>
        <div className="text-center py-12">
          <p className="text-gray-900 font-medium mb-4">Secuencia no encontrada</p>
          <Link href="/sequences" className="text-blue-600 hover:text-blue-700">
            Volver a Secuencias
          </Link>
        </div>
      </LayoutClient>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      active: 'Activa',
      paused: 'Pausada',
      completed: 'Completada',
    };
    return labels[status] || status;
  };

  return (
    <LayoutClient>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{sequence.name}</h1>
              {sequence.description && (
                <p className="mt-2 text-sm text-gray-600">{sequence.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(sequence.status)}`}>
              {getStatusLabel(sequence.status)}
            </span>
          </div>
        </div>

        {/* Sequence Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pasos de la Secuencia ({sequence.steps.length})
          </h2>
          <div className="space-y-4">
            {sequence.steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {step.stepNumber}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{step.subject}</div>
                      {index > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Espera: {step.delayDays} día(s) {step.delayHours ? `y ${step.delayHours} hora(s)` : ''} después del paso anterior
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: step.bodyHtml.substring(0, 200) + '...' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Start Sequence */}
        {sequence.status === 'draft' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Iniciar Secuencia
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona los participantes para los que quieres iniciar esta secuencia. El primer email se enviará inmediatamente.
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="recipientType"
                  value="all"
                  checked={recipientType === 'all'}
                  onChange={(e) => setRecipientType(e.target.value as 'all')}
                  className="mt-0.5 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Todos los participantes</div>
                </div>
              </label>

              <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="recipientType"
                  value="tags"
                  checked={recipientType === 'tags'}
                  onChange={(e) => setRecipientType(e.target.value as 'tags')}
                  className="mt-0.5 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Por tags</div>
                  {recipientType === 'tags' && (
                    <input
                      type="text"
                      placeholder="Tags separados por coma"
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      onChange={(e) =>
                        setSelectedTags(
                          e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                        )
                      }
                    />
                  )}
                </div>
              </label>

              <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="recipientType"
                  value="ids"
                  checked={recipientType === 'ids'}
                  onChange={(e) => setRecipientType(e.target.value as 'ids')}
                  className="mt-0.5 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Participantes específicos</div>
                  {recipientType === 'ids' && (
                    <input
                      type="text"
                      placeholder="IDs separados por coma"
                      value={selectedIds.join(', ')}
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.value.split(',').map((id) => id.trim()).filter(Boolean)
                        )
                      }
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  )}
                </div>
              </label>
            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors text-sm font-medium"
            >
              {starting ? 'Iniciando...' : 'Iniciar Secuencia'}
            </button>
          </div>
        )}

        {/* Sequence Info */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p><strong>Creada:</strong> {new Date(sequence.createdAt).toLocaleString('es-ES')}</p>
          <p><strong>Creada por:</strong> {sequence.createdBy}</p>
        </div>
      </div>
    </LayoutClient>
  );
}

export default function SequenceDetailPage() {
  return (
    <Suspense fallback={
      <LayoutClient>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </LayoutClient>
    }>
      <SequenceDetailContent />
    </Suspense>
  );
}

