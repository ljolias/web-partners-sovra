import type { DealStatus } from '@/types';

// Estados que requieren cotización
export const POST_QUOTE_STATES: DealStatus[] = [
  'negotiation',
  'contracting',
  'awarded',
  'won',
  'lost'
];

// Estados pre-aprobación (solo Sovra puede cambiar)
export const PRE_APPROVAL_STATES: DealStatus[] = [
  'pending_approval',
  'approved',
  'rejected',
  'more_info'
];

// Estados post-aprobación (partner puede cambiar libremente)
export const PARTNER_CHANGEABLE_STATES: DealStatus[] = [
  'negotiation',
  'contracting',
  'awarded',
  'won',
  'lost'
];

/**
 * Verifica si un estado requiere cotización
 */
export function requiresQuote(status: DealStatus): boolean {
  return POST_QUOTE_STATES.includes(status);
}

/**
 * Verifica si un estado puede ser cambiado por el partner
 */
export function isPartnerChangeableStatus(status: DealStatus): boolean {
  return PARTNER_CHANGEABLE_STATES.includes(status);
}

/**
 * Obtiene todos los estados disponibles para el partner
 * (excluye estados de pre-aprobación que solo Sovra puede cambiar)
 */
export function getPartnerAvailableStates(): DealStatus[] {
  return PARTNER_CHANGEABLE_STATES;
}
