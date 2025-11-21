/**
 * CSV Import Page - Improved Version
 * Allows users to upload CSV and map columns to participant fields
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import type { CSVColumnMapping } from '@/lib/models/types';
import LayoutClient from '@/app/components/LayoutClient';
import Link from 'next/link';

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<CSVColumnMapping>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    importedCount: number;
    updatedCount: number;
    skippedCount: number;
  } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Parse CSV for preview
    const text = await selectedFile.text();
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.slice(0, 20) as any[];
        setPreview(rows);
        if (rows.length > 0) {
          setColumns(Object.keys(rows[0]));
        }
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    try {
      const response = await fetch('/api/participants/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setTimeout(() => {
          router.push('/participants');
        }, 2000);
      } else {
        alert(data.error || 'Error al importar');
      }
    } catch (error) {
      alert('Error de conexión');
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
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Importar Participantes</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sube un archivo CSV para importar participantes a la base de datos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Archivo CSV <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            />
            <p className="mt-2 text-xs text-gray-600">
              El archivo debe estar en formato CSV con columnas para email, nombre, apellido, etc.
            </p>
          </div>

          {/* Column Mapping */}
          {columns.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mapear Columnas del CSV
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona qué columna del CSV corresponde a cada campo del participante
              </p>
              <div className="space-y-4">
                {['email', 'firstName', 'lastName', 'phone', 'city', 'tags'].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {field === 'email' && 'Email *'}
                        {field === 'firstName' && 'Nombre'}
                        {field === 'lastName' && 'Apellido'}
                        {field === 'phone' && 'Teléfono'}
                        {field === 'city' && 'Ciudad'}
                        {field === 'tags' && 'Tags (separados por coma)'}
                      </label>
                      <select
                        value={mapping[field as keyof CSVColumnMapping] || ''}
                        onChange={(e) =>
                          setMapping({ ...mapping, [field]: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      >
                        <option value="">Seleccionar columna...</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vista Previa (primeras 20 filas)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-2 text-gray-900">
                            {row[col] || <span className="text-gray-400">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Importación Completada
              </h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li><strong>Importados:</strong> {result.importedCount}</li>
                <li><strong>Actualizados:</strong> {result.updatedCount}</li>
                <li><strong>Omitidos:</strong> {result.skippedCount}</li>
              </ul>
              <p className="mt-3 text-sm text-green-700">
                Redirigiendo a la lista de participantes...
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/participants"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !file || !mapping.email}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium"
            >
              {loading ? 'Importando...' : 'Importar Ahora'}
            </button>
          </div>
        </form>
      </div>
    </LayoutClient>
  );
}
