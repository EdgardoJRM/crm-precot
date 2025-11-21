/**
 * Email Tag Helper Component
 * Provides buttons to insert dynamic tags into email content
 */

'use client';

import { useState } from 'react';

export interface EmailTag {
  label: string;
  tag: string;
  description: string;
}

const AVAILABLE_TAGS: EmailTag[] = [
  { label: 'Nombre', tag: '{{nombre}}', description: 'Nombre completo del participante' },
  { label: 'Primer Nombre', tag: '{{primerNombre}}', description: 'Solo el primer nombre' },
  { label: 'Apellido', tag: '{{apellido}}', description: 'Solo el apellido' },
  { label: 'Email', tag: '{{email}}', description: 'Dirección de email' },
  { label: 'Teléfono', tag: '{{telefono}}', description: 'Número de teléfono' },
  { label: 'Ciudad', tag: '{{ciudad}}', description: 'Ciudad del participante' },
];

interface EmailTagHelperProps {
  onInsertTag: (tag: string) => void;
  className?: string;
}

export default function EmailTagHelper({ onInsertTag, className = '' }: EmailTagHelperProps) {
  const [showTags, setShowTags] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setShowTags(!showTags)}
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        Insertar Tag
      </button>

      {showTags && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowTags(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-20 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Tags Dinámicos Disponibles
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Haz clic en un tag para insertarlo
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {AVAILABLE_TAGS.map((emailTag) => (
                <button
                  key={emailTag.tag}
                  type="button"
                  onClick={() => {
                    onInsertTag(emailTag.tag);
                    setShowTags(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                        {emailTag.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {emailTag.description}
                      </p>
                    </div>
                    <code className="ml-2 px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded group-hover:bg-blue-100 group-hover:text-blue-800">
                      {emailTag.tag}
                    </code>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

