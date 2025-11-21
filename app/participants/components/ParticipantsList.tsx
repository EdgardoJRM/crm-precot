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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  useEffect(() => {
    loadParticipants();
  }, [search]);

  const loadParticipants = async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (cursor) params.set('cursor', cursor);

      const response = await fetch(`/api/participants?${params}`);
      const data = await response.json();

      if (data.success) {
        if (cursor) {
          setParticipants((prev) => [...prev, ...data.data.items]);
        } else {
          setParticipants(data.data.items);
        }
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar por email, nombre o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {selectedIds.size > 0 && (
            <button
              onClick={createCampaignWithSelected}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Crear Campaña ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : participants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay participantes. <Link href="/participants/import" className="text-blue-600">Importa algunos</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ciudad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                        {participant.firstName} {participant.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.phone || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.city || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {participant.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
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
            {nextCursor && (
              <div className="p-4 border-t border-gray-200 text-center">
                <button
                  onClick={() => loadParticipants(nextCursor)}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Cargar más
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


