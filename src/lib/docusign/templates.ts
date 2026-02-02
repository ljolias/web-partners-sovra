/**
 * DocuSign Templates Configuration
 *
 * Define the standard document templates available for partners
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  description: Record<string, string>; // Localized descriptions
  category: 'contract' | 'amendment';
  templateId?: string; // DocuSign template ID if using pre-built template
  requiredSigners: Array<'partner' | 'sovra'>;
  defaultExpirationDays?: number;
}

/**
 * Standard document templates available in the system
 */
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'partner_agreement',
    name: 'Partner Agreement',
    description: {
      en: 'Standard partnership agreement establishing the terms of the partner relationship',
      es: 'Acuerdo de socio estándar que establece los términos de la relación de socio',
      pt: 'Acordo de parceria padrão que estabelece os termos do relacionamento de parceiro',
    },
    category: 'contract',
    templateId: process.env.DOCUSIGN_TEMPLATE_PARTNER_AGREEMENT,
    requiredSigners: ['partner', 'sovra'],
    defaultExpirationDays: 365,
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    description: {
      en: 'Mutual non-disclosure agreement to protect confidential information',
      es: 'Acuerdo mutuo de confidencialidad para proteger información confidencial',
      pt: 'Acordo mútuo de confidencialidade para proteger informações confidenciais',
    },
    category: 'contract',
    templateId: process.env.DOCUSIGN_TEMPLATE_NDA,
    requiredSigners: ['partner', 'sovra'],
    defaultExpirationDays: 730, // 2 years
  },
  {
    id: 'data_processing',
    name: 'Data Processing Agreement',
    description: {
      en: 'Agreement governing the processing of personal data in compliance with regulations',
      es: 'Acuerdo que rige el procesamiento de datos personales en cumplimiento con las regulaciones',
      pt: 'Acordo que rege o processamento de dados pessoais em conformidade com os regulamentos',
    },
    category: 'contract',
    templateId: process.env.DOCUSIGN_TEMPLATE_DPA,
    requiredSigners: ['partner', 'sovra'],
    defaultExpirationDays: 365,
  },
  {
    id: 'amendment',
    name: 'Contract Amendment',
    description: {
      en: 'Amendment to an existing contract or agreement',
      es: 'Modificación a un contrato o acuerdo existente',
      pt: 'Alteração de um contrato ou acordo existente',
    },
    category: 'amendment',
    requiredSigners: ['partner', 'sovra'],
  },
  {
    id: 'addendum',
    name: 'Contract Addendum',
    description: {
      en: 'Additional terms and conditions to be added to an existing agreement',
      es: 'Términos y condiciones adicionales a agregar a un acuerdo existente',
      pt: 'Termos e condições adicionais a serem adicionados a um acordo existente',
    },
    category: 'amendment',
    requiredSigners: ['partner', 'sovra'],
  },
];

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.id === templateId);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: 'contract' | 'amendment'): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get localized template description
 */
export function getTemplateDescription(template: DocumentTemplate, locale: string): string {
  return template.description[locale] || template.description.en;
}

/**
 * Upload document categories (documents that don't require bilateral signing)
 */
export interface UploadCategory {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  allowedFor: Array<'partner' | 'sovra'>;
  requiresVerification: boolean;
}

export const UPLOAD_CATEGORIES: UploadCategory[] = [
  {
    id: 'compliance',
    name: {
      en: 'Compliance Documents',
      es: 'Documentos de Cumplimiento',
      pt: 'Documentos de Conformidade',
    },
    description: {
      en: 'KYC/AML documents, registration certificates, tax documents',
      es: 'Documentos KYC/AML, certificados de registro, documentos fiscales',
      pt: 'Documentos KYC/AML, certificados de registro, documentos fiscais',
    },
    allowedFor: ['partner', 'sovra'],
    requiresVerification: true,
  },
  {
    id: 'financial',
    name: {
      en: 'Financial Documents',
      es: 'Documentos Financieros',
      pt: 'Documentos Financeiros',
    },
    description: {
      en: 'Invoices, commission reports, financial statements',
      es: 'Facturas, reportes de comisiones, estados financieros',
      pt: 'Faturas, relatórios de comissões, demonstrações financeiras',
    },
    allowedFor: ['partner', 'sovra'],
    requiresVerification: false,
  },
  {
    id: 'certification',
    name: {
      en: 'Certifications',
      es: 'Certificaciones',
      pt: 'Certificações',
    },
    description: {
      en: 'ISO certifications, training certificates, accreditations',
      es: 'Certificaciones ISO, certificados de capacitación, acreditaciones',
      pt: 'Certificações ISO, certificados de treinamento, acreditações',
    },
    allowedFor: ['partner', 'sovra'],
    requiresVerification: true,
  },
  {
    id: 'policy',
    name: {
      en: 'Policies & Procedures',
      es: 'Políticas y Procedimientos',
      pt: 'Políticas e Procedimentos',
    },
    description: {
      en: 'Brand guidelines, usage guides, operating procedures',
      es: 'Guías de marca, guías de uso, procedimientos operativos',
      pt: 'Diretrizes de marca, guias de uso, procedimentos operacionais',
    },
    allowedFor: ['sovra'],
    requiresVerification: false,
  },
  {
    id: 'correspondence',
    name: {
      en: 'Correspondence',
      es: 'Correspondencia',
      pt: 'Correspondência',
    },
    description: {
      en: 'Official letters, notifications, formal communications',
      es: 'Cartas oficiales, notificaciones, comunicaciones formales',
      pt: 'Cartas oficiais, notificações, comunicações formais',
    },
    allowedFor: ['partner', 'sovra'],
    requiresVerification: false,
  },
];

/**
 * Get upload category by ID
 */
export function getUploadCategory(categoryId: string): UploadCategory | undefined {
  return UPLOAD_CATEGORIES.find((c) => c.id === categoryId);
}

/**
 * Get categories allowed for a specific actor
 */
export function getCategoriesForActor(actor: 'partner' | 'sovra'): UploadCategory[] {
  return UPLOAD_CATEGORIES.filter((c) => c.allowedFor.includes(actor));
}

/**
 * Get localized category name
 */
export function getCategoryName(category: UploadCategory, locale: string): string {
  return category.name[locale] || category.name.en;
}

/**
 * Get localized category description
 */
export function getCategoryDescription(category: UploadCategory, locale: string): string {
  return category.description[locale] || category.description.en;
}
