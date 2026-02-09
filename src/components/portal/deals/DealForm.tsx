'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircle, FileText } from 'lucide-react';
import { Button, Input, Select, Textarea, Alert } from '@/components/ui';
import type { DealFormData, GovernmentLevel } from '@/types';

interface DealFormProps {
  locale: string;
  hasCertification: boolean;
  hasSignedLegal: boolean;
  userRole: string;
}

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'El Salvador',
  'Guatemala',
  'Honduras',
  'Mexico',
  'Nicaragua',
  'Panama',
  'Paraguay',
  'Peru',
  'Republica Dominicana',
  'Uruguay',
  'Venezuela',
];

const GOVERNMENT_LEVELS: { value: GovernmentLevel; label: string }[] = [
  { value: 'municipality', label: 'Municipio' },
  { value: 'province', label: 'Provincia / Estado' },
  { value: 'nation', label: 'Nacional' },
];

export function DealForm({ locale, hasCertification, hasSignedLegal, userRole }: DealFormProps) {
  const router = useRouter();
  const t = useTranslations('deals');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLegalReminder, setShowLegalReminder] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);

  const [formData, setFormData] = useState<DealFormData>({
    clientName: '',
    country: '',
    governmentLevel: 'municipality',
    population: 0,
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
    partnerGeneratedLead: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DealFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DealFormData, string>> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = t('validation.required');
    }
    if (!formData.country) {
      newErrors.country = t('validation.required');
    }
    if (!formData.governmentLevel) {
      newErrors.governmentLevel = t('validation.required');
    }
    if (formData.population <= 0) {
      newErrors.population = t('validation.required');
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = t('validation.required');
    }
    if (!formData.contactRole.trim()) {
      newErrors.contactRole = t('validation.required');
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = t('validation.invalidEmail');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/partners/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();

        // If we have validation errors, show them field by field
        if (data.errors && typeof data.errors === 'object') {
          const errorMessages = Object.entries(data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }

        throw new Error(data.error || 'Failed to create deal');
      }

      const { deal, hasUnsignedDocs, userRole: responseUserRole } = await response.json();

      // Show legal reminder only for admins with unsigned docs
      if (hasUnsignedDocs && (userRole === 'admin' || responseUserRole === 'admin')) {
        setCreatedDealId(deal.id);
        setShowLegalReminder(true);
        setIsLoading(false);
      } else {
        router.push(`/${locale}/partners/portal/deals/${deal.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof DealFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!hasCertification) {
    return (
      <Alert variant="warning" title="Certification Required">
        {t('validation.certRequired')}
      </Alert>
    );
  }

  // Show legal reminder modal after deal creation (admin only)
  if (showLegalReminder && createdDealId) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Oportunidad Creada Exitosamente
              </h3>
              <p className="text-amber-800 mb-4">
                Tu oportunidad ha sido registrada correctamente. Sin embargo, tienes documentos legales pendientes de firma.
              </p>
              <div className="bg-white border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">
                    Recordatorio: Documentos Legales Pendientes
                  </span>
                </div>
                <p className="text-sm text-amber-700">
                  Para continuar operando sin restricciones, te recomendamos completar la firma de los documentos legales requeridos.
                  Puedes hacerlo desde la seccion de Documentos Legales en el menu principal.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/${locale}/partners/portal/legal`)}
                  variant="outline"
                >
                  Ir a Documentos Legales
                </Button>
                <Button
                  onClick={() => router.push(`/${locale}/partners/portal/deals/${createdDealId}`)}
                >
                  Ver Oportunidad
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          <div className="whitespace-pre-wrap">{error}</div>
        </Alert>
      )}

      {/* Client Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informacion del Cliente
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="Nombre del Gobierno / Entidad"
            value={formData.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
            error={errors.clientName}
            placeholder="Ej: Gobierno de San Juan"
            required
          />

          <Select
            label="Pais"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            error={errors.country}
            options={[
              { value: '', label: 'Seleccionar pais...' },
              ...COUNTRIES.map(c => ({ value: c, label: c })),
            ]}
            required
          />

          <Select
            label="Nivel de Gobierno"
            value={formData.governmentLevel}
            onChange={(e) => handleChange('governmentLevel', e.target.value as GovernmentLevel)}
            error={errors.governmentLevel}
            options={GOVERNMENT_LEVELS}
            required
          />

          <Input
            label="Poblacion"
            type="number"
            value={formData.population || ''}
            onChange={(e) => handleChange('population', parseInt(e.target.value) || 0)}
            error={errors.population}
            placeholder="Ej: 800000"
            min={0}
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Contacto Principal
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="Nombre del Contacto"
            value={formData.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            error={errors.contactName}
            placeholder="Ej: Juan Perez"
            required
          />

          <Input
            label="Cargo / Rol"
            value={formData.contactRole}
            onChange={(e) => handleChange('contactRole', e.target.value)}
            error={errors.contactRole}
            placeholder="Ej: Director de Innovacion"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            error={errors.contactEmail}
            placeholder="contacto@gobierno.gob"
            required
          />

          <Input
            label="Telefono (opcional)"
            type="tel"
            value={formData.contactPhone || ''}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
          />
        </div>
      </div>

      {/* Opportunity Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Detalles de la Oportunidad
        </h3>

        <Textarea
          label="Descripcion"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Describe la oportunidad, necesidades del cliente, contexto del proyecto..."
          rows={4}
          required
        />

        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.partnerGeneratedLead}
              onChange={(e) => handleChange('partnerGeneratedLead', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Yo genere este lead
              </span>
              <p className="text-sm text-gray-500">
                Marca esta opcion si tu encontraste esta oportunidad (no fue proporcionada por Sovra)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Una vez enviada, la oportunidad sera revisada por el equipo de Sovra.
          Te notificaremos cuando sea aprobada y podras crear una cotizacion.
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Enviar para Aprobacion
        </Button>
      </div>
    </form>
  );
}
