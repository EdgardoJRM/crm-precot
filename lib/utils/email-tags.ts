/**
 * Email Tags Utility
 * Handles replacement of dynamic tags in email content
 */

import type { Participant } from '../models/types';

export interface TagReplacement {
  nombre: string;
  primerNombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
}

/**
 * Get tag replacements from participant data
 */
export function getTagReplacements(participant: Participant): TagReplacement {
  return {
    nombre: `${participant.firstName} ${participant.lastName}`.trim(),
    primerNombre: participant.firstName,
    apellido: participant.lastName,
    email: participant.email,
    telefono: participant.phone || '',
    ciudad: participant.city || '',
  };
}

/**
 * Replace tags in content with participant data
 */
export function replaceTags(content: string, replacements: TagReplacement): string {
  return content
    .replace(/\{\{nombre\}\}/g, replacements.nombre)
    .replace(/\{\{primerNombre\}\}/g, replacements.primerNombre)
    .replace(/\{\{apellido\}\}/g, replacements.apellido)
    .replace(/\{\{email\}\}/g, replacements.email)
    .replace(/\{\{telefono\}\}/g, replacements.telefono)
    .replace(/\{\{ciudad\}\}/g, replacements.ciudad);
}

/**
 * Get sample data for preview
 */
export function getSampleReplacements(): TagReplacement {
  return {
    nombre: 'Juan Pérez',
    primerNombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@ejemplo.com',
    telefono: '+52 555 123 4567',
    ciudad: 'Ciudad de México',
  };
}

