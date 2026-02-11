/**
 * Validation schemas using Zod for input validation
 */

import { z } from 'zod';

/**
 * Deal/Opportunity validation schema
 */
export const dealSchema = z.object({
  clientName: z
    .string()
    .min(1, 'Nombre de cliente requerido')
    .max(200, 'Nombre demasiado largo')
    .regex(
      /^[a-zA-Z0-9\s\-.,áéíóúñÁÉÍÓÚÑüÜ]+$/,
      'Caracteres inválidos en nombre de cliente'
    ),

  country: z
    .string()
    .min(1, 'País requerido')
    .max(100, 'Nombre de país demasiado largo'),

  governmentLevel: z.enum(['municipality', 'province', 'nation'], {
    message: 'Nivel de gobierno inválido',
  }),

  population: z
    .number()
    .positive('La población debe ser positiva')
    .int('La población debe ser un número entero')
    .max(2_000_000_000, 'Población demasiado grande')
    .min(1, 'La población debe ser mayor a 0'),

  contactName: z
    .string()
    .min(1, 'Nombre de contacto requerido')
    .max(200, 'Nombre de contacto demasiado largo'),

  contactRole: z
    .string()
    .min(1, 'Rol de contacto requerido')
    .max(200, 'Rol demasiado largo'),

  contactEmail: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .max(255, 'Email demasiado largo'),

  contactPhone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(5000, 'La descripción es demasiado larga'),

  partnerGeneratedLead: z.boolean(),
});

export type DealInput = z.infer<typeof dealSchema>;

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .max(255, 'Email demasiado largo'),

  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'Contraseña demasiado larga'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Quote validation schema
 */
export const quoteSchema = z.object({
  dealId: z.string().min(1, 'ID de deal requerido'),

  products: z.object({
    sovraGov: z.object({
      included: z.boolean(),
      populationUsed: z.number().positive().int(),
      pricePerInhabitant: z.number().positive(),
      annualPrice: z.number().positive(),
    }),
    sovraId: z.object({
      included: z.boolean(),
      plan: z.enum(['basic', 'standard', 'premium']),
      monthlyLimit: z.number().positive().int(),
      monthlyPrice: z.number().positive(),
      annualPrice: z.number().positive(),
    }),
  }),

  services: z.object({
    implementation: z.object({
      included: z.boolean(),
      hours: z.number().min(0).int(),
      hourlyRate: z.number().min(0),
      total: z.number().min(0),
    }),
    training: z.object({
      included: z.boolean(),
      hours: z.number().min(0).int(),
      hourlyRate: z.number().min(0),
      total: z.number().min(0),
    }),
    support: z.object({
      included: z.boolean(),
      plan: z.enum(['basic', 'standard', 'premium']),
      monthlyPrice: z.number().min(0),
      annualPrice: z.number().min(0),
    }),
  }),

  discounts: z.object({
    volumeDiscount: z.number().min(0).max(100),
    customDiscount: z.number().min(0).max(100),
    totalDiscountPercent: z.number().min(0).max(100),
  }),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/**
 * Partner registration schema
 */
export const partnerRegistrationSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Nombre de empresa requerido')
    .max(200, 'Nombre demasiado largo'),

  country: z.string().min(1, 'País requerido'),

  contactName: z
    .string()
    .min(1, 'Nombre de contacto requerido')
    .max(200, 'Nombre demasiado largo'),

  contactEmail: z.string().email('Email inválido').toLowerCase(),

  contactPhone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Formato de teléfono inválido')
    .optional(),
});

export type PartnerRegistrationInput = z.infer<typeof partnerRegistrationSchema>;

/**
 * Training quiz submission schema
 */
export const quizSubmissionSchema = z.object({
  moduleId: z.string().min(1, 'ID de módulo requerido'),
  answers: z.array(z.number().int().min(0)),
});

export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;

/**
 * Document signature schema
 */
export const signatureSchema = z.object({
  documentId: z.string().min(1, 'ID de documento requerido'),
  signature: z.string().min(1, 'Firma requerida'),
  ipAddress: z.string().optional(),
});

export type SignatureInput = z.infer<typeof signatureSchema>;

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'File is required'),
  category: z.string().min(1, 'Category is required').max(50),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  expirationDate: z.string().datetime().optional(),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;

/**
 * File validation helper
 */
export const fileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
  ],

  validate(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check file extension matches mime type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeToExt: Record<string, string[]> = {
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
    };

    const expectedExts = mimeToExt[file.type];
    if (extension && expectedExts && !expectedExts.includes(extension)) {
      return { valid: false, error: 'File extension does not match content type' };
    }

    return { valid: true };
  },
};

/**
 * Training course creation schema
 */
export const courseCreateSchema = z.object({
  title: z.object({
    en: z.string().min(1, 'English title required').max(200),
    es: z.string().min(1, 'Spanish title required').max(200),
  }),

  description: z.object({
    en: z.string().min(10, 'English description too short').max(5000),
    es: z.string().min(10, 'Spanish description too short').max(5000),
  }),

  category: z.enum(['sales', 'technical', 'legal', 'product'], {
    message: 'Invalid category',
  }),

  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    message: 'Invalid difficulty level',
  }),

  estimatedDuration: z.number().positive('Duration must be positive').int(),

  published: z.boolean().default(false),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

/**
 * Module creation schema
 */
export const moduleCreateSchema = z.object({
  courseId: z.string().min(1, 'Course ID required'),

  title: z.object({
    en: z.string().min(1).max(200),
    es: z.string().min(1).max(200),
  }),

  description: z.object({
    en: z.string().min(10).max(5000),
    es: z.string().min(10).max(5000),
  }),

  order: z.number().int().min(0),

  estimatedDuration: z.number().positive().int(),
});

export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;

/**
 * Lesson creation schema
 */
export const lessonCreateSchema = z.object({
  moduleId: z.string().min(1, 'Module ID required'),

  title: z.object({
    en: z.string().min(1).max(200),
    es: z.string().min(1).max(200),
  }),

  content: z.object({
    en: z.string().min(10, 'Content too short'),
    es: z.string().min(10, 'Content too short'),
  }),

  type: z.enum(['text', 'video', 'interactive'], {
    message: 'Invalid lesson type',
  }),

  videoUrl: z.string().url('Invalid video URL').optional(),

  order: z.number().int().min(0),

  estimatedDuration: z.number().positive().int(),
});

export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;

/**
 * Team member creation schema
 */
export const teamMemberSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase().max(255),

  name: z
    .string()
    .min(1, 'Name required')
    .max(200, 'Name too long')
    .regex(/^[a-zA-Z\s\-'áéíóúñÁÉÍÓÚÑüÜ]+$/, 'Invalid characters in name'),

  role: z.enum(['partner_admin', 'partner_user'], {
    message: 'Invalid role',
  }),

  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

/**
 * Credential issuance schema
 */
export const credentialIssuanceSchema = z.object({
  partnerId: z.string().min(1, 'Partner ID required'),

  holderEmail: z.string().email('Invalid email').toLowerCase(),

  holderName: z
    .string()
    .min(1, 'Holder name required')
    .max(200)
    .regex(/^[a-zA-Z\s\-'áéíóúñÁÉÍÓÚÑüÜ]+$/, 'Invalid characters'),

  role: z.enum(['admin', 'sales', 'legal', 'admin_secondary'], {
    message: 'Invalid role',
  }),

  expirationDate: z.string().datetime().optional(),
});

export type CredentialIssuanceInput = z.infer<typeof credentialIssuanceSchema>;

/**
 * User profile update schema
 */
export const userProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name required')
    .max(200)
    .regex(/^[a-zA-Z\s\-'áéíóúñÁÉÍÓÚÑüÜ]+$/, 'Invalid characters')
    .optional(),

  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),

  jobTitle: z
    .string()
    .max(100, 'Job title too long')
    .optional()
    .or(z.literal('')),

  bio: z
    .string()
    .max(500, 'Bio too long')
    .optional()
    .or(z.literal('')),

  location: z
    .string()
    .max(100, 'Location too long')
    .optional()
    .or(z.literal('')),

  country: z
    .string()
    .max(100, 'Country too long')
    .optional()
    .or(z.literal('')),

  language: z
    .enum(['es', 'en', 'pt'])
    .optional(),

  linkedIn: z
    .string()
    .url('Invalid LinkedIn URL')
    .optional()
    .or(z.literal('')),

  avatarUrl: z.string().url('Invalid URL').optional(),
});

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

/**
 * Contract send schema
 */
export const contractSendSchema = z.object({
  partnerId: z.string().min(1, 'Partner ID required'),

  templateId: z.string().min(1, 'Template ID required').optional(),

  title: z.string().min(1, 'Title required').max(200),

  description: z.string().max(5000).optional(),

  partnerSignerEmail: z.string().email('Invalid partner signer email').toLowerCase(),

  partnerSignerName: z.string().min(1, 'Partner signer name required').max(200),

  sovraSignerEmail: z.string().email('Invalid Sovra signer email').toLowerCase(),

  sovraSignerName: z.string().min(1, 'Sovra signer name required').max(200),

  effectiveDate: z.string().datetime().optional(),

  expirationDays: z.number().int().positive().max(3650).optional(), // Max 10 years
});

export type ContractSendInput = z.infer<typeof contractSendSchema>;

/**
 * Deal approval/rejection schema
 */
export const dealActionSchema = z.object({
  notes: z
    .string()
    .min(10, 'Notes must be at least 10 characters')
    .max(5000, 'Notes too long'),

  internalNotes: z.string().max(5000).optional(),
});

export type DealActionInput = z.infer<typeof dealActionSchema>;

/**
 * Deal status update schema
 */
export const dealStatusUpdateSchema = z.object({
  status: z.enum([
    'pending_approval',
    'approved',
    'rejected',
    'more_info',
    'negotiation',
    'contracting',
    'awarded',
    'won',
    'lost'
  ]),
  notes: z.string().max(1000).optional(),
});

export type DealStatusUpdateInput = z.infer<typeof dealStatusUpdateSchema>;

/**
 * Copilot chat message schema
 */
export const copilotMessageSchema = z.object({
  sessionId: z.string().min(1).optional(),

  dealId: z.string().min(1, 'Deal ID required'),

  message: z
    .string()
    .min(1, 'Message required')
    .max(4000, 'Message too long'),
});

export type CopilotMessageInput = z.infer<typeof copilotMessageSchema>;

/**
 * Sanitizes and trims text input
 */
export function sanitizeTextInput(text: string, maxLength = 10000): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes an object against a schema
 */
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { _error: 'Validation failed' },
    };
  }
}
