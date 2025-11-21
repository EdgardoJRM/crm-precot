/**
 * Create Email Sequence Page
 * Allows users to create email sequences (drip campaigns) with multiple steps
 */

'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { EmailSequenceStep, CampaignFilters } from '@/lib/models/types';
import EmailTagHelper from '@/app/components/EmailTagHelper';
import LayoutClient from '@/app/components/LayoutClient';

function NewSequenceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [steps, setSteps] = useState<EmailSequenceStep[]>([
    {
      stepNumber: 1,
      subject: '',
      bodyHtml: '',
      delayDays: 0,
      delayHours: 0,
    },
  ]);
  const [recipientType, setRecipientType] = useState<'all' | 'tags' | 'ids'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      if (data.success) {
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

  const addStep = () => {
    const newStep: EmailSequenceStep = {
      stepNumber: steps.length + 1,
      subject: '',
      bodyHtml: '',
      delayDays: 1,
      delayHours: 0,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) {
      alert('Debes tener al menos un paso en la secuencia');
      return;
    }
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    newSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof EmailSequenceStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const insertTagInStep = (stepIndex: number, field: 'subject' | 'bodyHtml', tag: string) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    if (field === 'subject') {
      step.subject = (step.subject || '') + tag;
    } else {
      step.bodyHtml = (step.bodyHtml || '') + tag;
    }
    setSteps(newSteps);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (steps.some((s) => !s.subject || !s.bodyHtml)) {
      alert('Todos los pasos deben tener subject y contenido');
      return;
    }

    setLoading(true);

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

      const response = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          steps,
          filters,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Secuencia creada exitosamente');
        router.push('/sequences');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutClient>
      <div className="space-y-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900">Nueva Secuencia de Emails</h1>
            <p className="mt-2 text-sm text-gray-900">
              Crea una secuencia automatizada de emails con delays configurables entre cada paso
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sequence Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Información de la Secuencia</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nombre de la Secuencia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Ej: Secuencia de Bienvenida"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Describe el propósito de esta secuencia..."
              />
            </div>
          </div>

          {/* Email Steps */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Pasos de la Secuencia
              </h2>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Paso
              </button>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900">
                    Paso {step.stepNumber}
                  </h3>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Delay Configuration */}
                  {index > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Tiempo de espera después del paso anterior
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-900 mb-1">Días</label>
                          <input
                            type="number"
                            min="0"
                            value={step.delayDays}
                            onChange={(e) => updateStep(index, 'delayDays', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-900 mb-1">Horas</label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={step.delayHours || 0}
                            onChange={(e) => updateStep(index, 'delayHours', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-900">
                        Este email se enviará {step.delayDays} día(s) y {step.delayHours || 0} hora(s) después del paso anterior
                      </p>
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Asunto del Email <span className="text-red-500">*</span>
                      </label>
                      <EmailTagHelper onInsertTag={(tag) => insertTagInStep(index, 'subject', tag)} />
                    </div>
                    <input
                      type="text"
                      required
                      value={step.subject}
                      onChange={(e) => updateStep(index, 'subject', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="Ej: Bienvenido {{primerNombre}}!"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Contenido del Email <span className="text-red-500">*</span>
                      </label>
                      <EmailTagHelper onInsertTag={(tag) => insertTagInStep(index, 'bodyHtml', tag)} />
                    </div>
                    <textarea
                      required
                      rows={8}
                      value={step.bodyHtml}
                      onChange={(e) => updateStep(index, 'bodyHtml', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900 bg-white"
                      placeholder={`<html>
  <body style="font-family: Arial, sans-serif;">
    <h1>Hola {{primerNombre}},</h1>
    <p>Contenido del email...</p>
  </body>
</html>`}
                    />
                  </div>
                </div>
              </div>
            ))}
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
                    La secuencia se iniciará para todos los participantes
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
                    Solo participantes con ciertos tags
                  </div>
                  {recipientType === 'tags' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Tags separados por coma"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        onChange={(e) =>
                          setSelectedTags(
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                      />
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
                    Solo participantes seleccionados manualmente
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
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
              onClick={() => router.push('/sequences')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium"
            >
              {loading ? 'Guardando...' : 'Guardar Secuencia'}
            </button>
          </div>
        </form>
      </div>
    </LayoutClient>
  );
}

export default function NewSequencePage() {
  return (
    <Suspense fallback={
      <LayoutClient>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Cargando...</p>
        </div>
      </LayoutClient>
    }>
      <NewSequenceContent />
    </Suspense>
  );
}

