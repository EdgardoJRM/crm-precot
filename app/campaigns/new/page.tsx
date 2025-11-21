/**
 * Create/Edit Campaign Page
 * Allows users to create new email campaigns
 */

'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CampaignFilters } from '@/lib/models/types';

function NewCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    bodyHtml: '',
  });
  const [recipientType, setRecipientType] = useState<'all' | 'tags' | 'ids'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get participant IDs from URL if coming from participants page
  useEffect(() => {
    const ids = searchParams.get('participantIds');
    if (ids) {
      const idArray = ids.split(',');
      setSelectedIds(idArray);
      setRecipientType('ids');
    }
  }, [searchParams]);

  // Load available tags
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    // In a real implementation, fetch unique tags from API
    // For now, using empty array
    setAvailableTags([]);
  };

  const handleSubmit = async (e: FormEvent, sendNow: boolean = false) => {
    e.preventDefault();
    
    if (sendNow) {
      setSending(true);
    } else {
      setLoading(true);
    }

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

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          filters,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (sendNow) {
          // Send campaign
          const sendResponse = await fetch(`/api/campaigns/${data.data.id}/send`, {
            method: 'POST',
          });

          const sendData = await sendResponse.json();

          if (sendData.success) {
            alert(`Campaña enviada: ${sendData.data.sentCount} emails enviados`);
            router.push('/campaigns');
          } else {
            alert('Error al enviar campaña: ' + sendData.error);
          }
        } else {
          alert('Campaña guardada como borrador');
          router.push('/campaigns');
        }
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Nueva Campaña</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Detalles de la Campaña</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Campaña Enero 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject del Email *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Invitación al próximo evento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuerpo del Email (HTML) *
              </label>
              <textarea
                required
                rows={12}
                value={formData.bodyHtml}
                onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<html><body><h1>Hola</h1><p>Contenido del email...</p></body></html>"
              />
              <p className="mt-1 text-xs text-gray-500">
                Puedes usar HTML básico para formatear el email
              </p>
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Destinatarios</h2>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipientType"
                  value="all"
                  checked={recipientType === 'all'}
                  onChange={(e) => setRecipientType(e.target.value as 'all')}
                  className="mr-2"
                />
                Todos los participantes
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipientType"
                  value="tags"
                  checked={recipientType === 'tags'}
                  onChange={(e) => setRecipientType(e.target.value as 'tags')}
                  className="mr-2"
                />
                Por tags
              </label>
              {recipientType === 'tags' && (
                <div className="ml-6">
                  <input
                    type="text"
                    placeholder="Escribe tags separados por coma"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) =>
                      setSelectedTags(
                        e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      )
                    }
                  />
                </div>
              )}

              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipientType"
                  value="ids"
                  checked={recipientType === 'ids'}
                  onChange={(e) => setRecipientType(e.target.value as 'ids')}
                  className="mr-2"
                />
                IDs específicos
              </label>
              {recipientType === 'ids' && (
                <div className="ml-6">
                  <input
                    type="text"
                    placeholder="IDs separados por coma"
                    value={selectedIds.join(', ')}
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.value.split(',').map((id) => id.trim()).filter(Boolean)
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedIds.length} participantes seleccionados
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/campaigns')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar como Borrador'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={sending || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar Ahora'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Nueva Campaña</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </main>
      </div>
    }>
      <NewCampaignContent />
    </Suspense>
  );
}


