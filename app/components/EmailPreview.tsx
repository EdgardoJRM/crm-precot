/**
 * Email Preview Component
 * Shows a preview of how the email will look with sample data
 */

'use client';

import { useState } from 'react';
import { replaceTags, getSampleReplacements } from '@/lib/utils/email-tags';

interface EmailPreviewProps {
  subject: string;
  bodyText: string; // Plain text instead of HTML
  testEmail?: string;
  onSendTest?: (email: string) => Promise<void>;
}

import { textToHtml } from '@/lib/utils/text-to-html';

export default function EmailPreview({
  subject,
  bodyText,
  testEmail,
  onSendTest,
}: EmailPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState(testEmail || '');
  const [sendingTest, setSendingTest] = useState(false);

  // Replace tags with sample data and convert to HTML
  const sampleData = getSampleReplacements();
  const textWithTags = replaceTags(bodyText, sampleData);
  const previewHtml = textToHtml(textWithTags);
  const previewSubject = replaceTags(subject, sampleData);

  const handleSendTest = async () => {
    if (!testEmailInput || !onSendTest) return;
    
    setSendingTest(true);
    try {
      await onSendTest(testEmailInput);
      alert('Email de prueba enviado exitosamente');
    } catch (error) {
      alert('Error al enviar email de prueba');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Vista Previa
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Vista Previa del Email
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Test Email Section */}
                {onSendTest && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Enviar Email de Prueba
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={testEmailInput}
                        onChange={(e) => setTestEmailInput(e.target.value)}
                        placeholder="tu-email@ejemplo.com"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendTest}
                        disabled={!testEmailInput || sendingTest}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sendingTest ? 'Enviando...' : 'Enviar Prueba'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="text-sm text-gray-900">
                      <strong className="text-gray-900">De:</strong> <span className="text-gray-900">noreply@precotracks.org</span>
                    </div>
                    <div className="text-sm text-gray-900 mt-1">
                      <strong className="text-gray-900">Para:</strong> <span className="text-gray-900 font-semibold">{sampleData.email}</span>
                    </div>
                    <div className="text-sm text-gray-900 mt-1">
                      <strong className="text-gray-900">Asunto:</strong> <span className="text-gray-900">{previewSubject || '(sin asunto)'}</span>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div
                    className="p-6 bg-white"
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-gray-900 italic">No hay contenido</p>' }}
                  />
                </div>

                {/* Sample Data Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-900 mb-2">
                    Datos de ejemplo usados:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-900">
                    {Object.entries(sampleData).map(([key, value]) => (
                      <div key={key} className="text-gray-900">
                        <span className="font-medium text-gray-900">{key}:</span> <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

