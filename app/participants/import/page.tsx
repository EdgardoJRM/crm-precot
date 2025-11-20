/**
 * CSV Import Page
 * Allows users to upload CSV and map columns to participant fields
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import type { CSVColumnMapping } from '@/lib/models/types';

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Importar Participantes
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Column Mapping */}
          {columns.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Mapear Columnas
              </h2>
              <div className="space-y-4">
                {['email', 'firstName', 'lastName', 'phone', 'city', 'tags'].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Vista Previa (primeras 20 filas)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, i) => (
                      <tr key={i}>
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-2 text-gray-700">
                            {row[col] || '—'}
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
                Importación Completada
              </h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>Importados: {result.importedCount}</li>
                <li>Actualizados: {result.updatedCount}</li>
                <li>Omitidos: {result.skippedCount}</li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file || !mapping.email}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importando...' : 'Importar Ahora'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

