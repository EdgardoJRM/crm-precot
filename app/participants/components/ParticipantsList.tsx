/**
 * Participants List Component
 * Client component for listing and filtering participants
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Participant } from '@/lib/models/types';

export default function ParticipantsList() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setNextCursor(undefined); // Reset pagination when search changes
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadParticipants();
  }, [search]);

  const loadParticipants = async (cursor?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (cursor) params.set('cursor', cursor);
      params.set('limit', '50'); // Load 50 at a time

      const response = await fetch(`/api/participants?${params}`);
      const data = await response.json();

      if (data.success) {
        if (cursor) {
          setParticipants((prev) => [...prev, ...data.data.items]);
        } else {
          setParticipants(data.data.items);
        }
        setNextCursor(data.data.nextCursor);
      } else {
        console.error('Error loading participants:', data.error);
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const createCampaignWithSelected = () => {
    const ids = Array.from(selectedIds);
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('participantIds', id));
    window.location.href = `/campaigns/new?${params}`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {search && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>
                {participants.length} resultado{participants.length !== 1 ? 's' : ''} para "{search}"
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, ciudad o tags..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-700 hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={createCampaignWithSelected}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors text-sm font-medium shadow-sm"
            >
              Crear Campaña ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-900">Buscando participantes...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="p-8 text-center">
            {search ? (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-900 font-medium mb-1">No se encontraron resultados</p>
                <p className="text-sm text-gray-900 mb-4">
                  No hay participantes que coincidan con "{search}"
                </p>
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-900 font-medium mb-1">No hay participantes</p>
                <p className="text-sm text-gray-900 mb-4">
                  Comienza importando participantes desde un archivo CSV
                </p>
                <Link href="/participants/import" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Importar CSV
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === participants.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(participants.map((p) => p.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ciudad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tags
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(participant.id)}
                          onChange={() => toggleSelect(participant.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {participant.firstName} {participant.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.phone || <span className="text-gray-700">—</span>}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.city || <span className="text-gray-700">—</span>}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {participant.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-900 rounded font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(nextCursor || participants.length > 0) && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-900">
                    Mostrando <strong>{participants.length}</strong> participante{participants.length !== 1 ? 's' : ''}
                    {nextCursor && ' de más disponibles'}
                  </div>
                  {nextCursor ? (
                    <button
                      onClick={() => loadParticipants(nextCursor)}
                      disabled={loading}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Cargando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Cargar más participantes
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-sm text-gray-900 font-medium">
                      ✓ Todos los participantes cargados
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


