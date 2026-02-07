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
