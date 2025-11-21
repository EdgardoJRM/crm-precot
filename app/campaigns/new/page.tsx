/**
 * Create/Edit Campaign Page - Improved Version
 * User-friendly email campaign creator with dynamic tags and preview
 */

'use client';

import { useState, useEffect, FormEvent, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CampaignFilters } from '@/lib/models/types';
import EmailTagHelper from '@/app/components/EmailTagHelper';
import EmailPreview from '@/app/components/EmailPreview';
import LayoutClient from '@/app/components/LayoutClient';

function NewCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    bodyHtml: '',
  });
  const [recipientType, setRecipientType] = useState<'all' | 'tags' | 'ids'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

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
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      if (data.success) {
        // Extract unique tags from participants
        const tags = new Set<string>();
        data.data.items?.forEach((p: any) => {
          p.tags?.forEach((tag: string) => tags.add(tag));
        });
        setAvailableTags(Array.from(tags));
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const insertTag = (tag: string) => {
    // Insert tag at cursor position in body
    if (bodyRef.current) {
      const textarea = bodyRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.bodyHtml;
      const newText = text.substring(0, start) + tag + text.substring(end);
      setFormData({ ...formData, bodyHtml: newText });
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      // Fallback: append to end
      setFormData({ ...formData, bodyHtml: formData.bodyHtml + tag });
    }
  };

  const insertTagInSubject = (tag: string) => {
    if (subjectRef.current) {
      const input = subjectRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const text = formData.subject;
      const newText = text.substring(0, start) + tag + text.substring(end);
      setFormData({ ...formData, subject: newText });
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setFormData({ ...formData, subject: formData.subject + tag });
    }
  };

  const handleSendTest = async (email: string) => {
    const response = await fetch('/api/campaigns/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        subject: formData.subject,
        bodyHtml: formData.bodyHtml,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Error al enviar email de prueba');
    }
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
            alert(`✅ Campaña enviada: ${sendData.data.sentCount} emails enviados`);
            router.push('/campaigns');
          } else {
            alert('❌ Error al enviar campaña: ' + sendData.error);
          }
        } else {
          alert('✅ Campaña guardada como borrador');
          router.push('/campaigns');
        }
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    } finally {
      setLoading(false);
      setSending(false);
    }
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
              className="p-2 text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Campaña de Email</h1>
              <p className="mt-2 text-sm text-gray-900">
                Crea y envía campañas personalizadas usando tags dinámicos
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <EmailPreview
              subject={formData.subject}
              bodyHtml={formData.bodyHtml}
              testEmail={testEmail}
              onSendTest={handleSendTest}
            />
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de la Campaña
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nombre de la Campaña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Ej: Campaña Enero 2025"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Asunto del Email <span className="text-red-500">*</span>
                    </label>
                    <EmailTagHelper onInsertTag={insertTagInSubject} />
                  </div>
                  <input
                    ref={subjectRef}
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Ej: Hola {{primerNombre}}, invitación al próximo evento"
                  />
                  <p className="mt-1.5 text-xs text-gray-900">
                    Usa tags dinámicos como <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800">{'{{primerNombre}}'}</code> para personalizar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Body Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Contenido del Email <span className="text-red-500">*</span>
                </h2>
                <p className="mt-1 text-sm text-gray-900">
                  Escribe el contenido HTML de tu email. Usa el botón "Insertar Tag" para agregar información personalizada.
                </p>
              </div>
              <EmailTagHelper onInsertTag={insertTag} />
            </div>

            <div>
              <textarea
                ref={bodyRef}
                required
                rows={16}
                value={formData.bodyHtml}
                onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900 bg-white"
                placeholder={`<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h1>Hola {{primerNombre}},</h1>
    <p>Gracias por tu interés en nuestros eventos.</p>
    <p>Tu ciudad: {{ciudad}}</p>
    <p>Saludos,<br>Equipo PrecoTracks</p>
  </body>
</html>`}
              />
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>💡 Tip:</strong> Puedes usar HTML básico para formatear. Los tags dinámicos como <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800">{'{{nombre}}'}</code>, <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800">{'{{email}}'}</code>, <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800">{'{{ciudad}}'}</code> se reemplazarán automáticamente con la información de cada participante.
                </p>
              </div>
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Destinatarios</h2>

            <div className="space-y-4">
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
                  <div className="text-sm text-gray-900 mt-1">
                    Enviar a todos los participantes en la base de datos
                  </div>
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
                  <div className="text-sm text-gray-900 mt-1 mb-3">
                    Enviar solo a participantes con ciertos tags
                  </div>
                  {recipientType === 'tags' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Escribe tags separados por coma (ej: vip, newsletter, evento-2025)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        onChange={(e) =>
                          setSelectedTags(
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                      />
                      {availableTags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-900 mb-1">Tags disponibles:</p>
                          <div className="flex flex-wrap gap-1">
                            {availableTags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (!selectedTags.includes(tag)) {
                                    setSelectedTags([...selectedTags, tag]);
                                  }
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
                  <div className="text-sm text-gray-900 mt-1 mb-3">
                    Enviar solo a participantes seleccionados manualmente
                  </div>
                  {recipientType === 'ids' && (
                    <div>
                      <input
                        type="text"
                        placeholder="IDs separados por coma"
                        value={selectedIds.join(', ')}
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.value.split(',').map((id) => id.trim()).filter(Boolean)
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <p className="mt-2 text-sm text-gray-900">
                        <strong>{selectedIds.length}</strong> participantes seleccionados
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/campaigns')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || sending}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar como Borrador'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={sending || loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {sending ? 'Enviando...' : 'Enviar Ahora'}
            </button>
          </div>
        </form>
      </div>
    </LayoutClient>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={
      <LayoutClient>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Cargando...</p>
        </div>
      </LayoutClient>
    }>
      <NewCampaignContent />
    </Suspense>
  );
}
