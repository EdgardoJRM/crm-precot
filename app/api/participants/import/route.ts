/**
 * API Route: POST /api/participants/import
 * Imports participants from CSV file
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  upsertParticipant,
  getParticipantByEmail,
} from '@/lib/services/participants';
import type { CSVColumnMapping, ImportResult } from '@/lib/models/types';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mappingJson = formData.get('mapping') as string;

    if (!file || !mappingJson) {
      return NextResponse.json(
        { success: false, error: 'Archivo y mapping son requeridos' },
        { status: 400 }
      );
    }

    const mapping: CSVColumnMapping = JSON.parse(mappingJson);

    // Read and parse CSV
    const text = await file.text();
    const parseResult = Papa.parse<any>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Error al parsear CSV', errors: parseResult.errors },
        { status: 400 }
      );
    }

    const rows = parseResult.data;
    const result: ImportResult = {
      importedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errors: [],
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Map CSV columns to participant fields
        const email = mapping.email ? row[mapping.email]?.toLowerCase().trim() : null;
        
        if (!email || !email.includes('@')) {
          result.skippedCount++;
          result.errors?.push(`Fila ${i + 1}: Email inválido`);
          continue;
        }

        // Check if participant exists
        const existing = await getParticipantByEmail(email);

        // Parse tags if provided
        let tags: string[] = [];
        if (mapping.tags && row[mapping.tags]) {
          tags = row[mapping.tags]
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);
        }

        const participantData = {
          id: existing?.id || uuidv4(),
          email,
          firstName: mapping.firstName ? (row[mapping.firstName] || '').trim() : '',
          lastName: mapping.lastName ? (row[mapping.lastName] || '').trim() : '',
          phone: mapping.phone ? (row[mapping.phone] || '').trim() : undefined,
          city: mapping.city ? (row[mapping.city] || '').trim() : undefined,
          tags,
        };

        await upsertParticipant(participantData);

        if (existing) {
          result.updatedCount++;
        } else {
          result.importedCount++;
        }
      } catch (error: any) {
        result.skippedCount++;
        result.errors?.push(`Fila ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al importar participantes' },
      { status: 500 }
    );
  }
}


