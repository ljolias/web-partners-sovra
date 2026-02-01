'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Input, Select, Textarea, Alert } from '@/components/ui';
import { useDeals } from '@/hooks';
import { normalizeDomain } from '@/lib/utils';
import type { DealFormData } from '@/types';

interface DealFormProps {
  locale: string;
  hasCertification: boolean;
  hasSignedLegal: boolean;
}

export function DealForm({ locale, hasCertification, hasSignedLegal }: DealFormProps) {
  const router = useRouter();
  const t = useTranslations('deals');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainConflict, setDomainConflict] = useState(false);
  const { createDeal, validateDomain } = useDeals({ autoFetch: false });

  const [formData, setFormData] = useState<DealFormData>({
    companyName: '',
    companyDomain: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    dealValue: 0,
    currency: 'USD',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DealFormData, string>>>({});

  // Debounced domain validation
  const checkDomain = useCallback(async (domain: string) => {
    if (domain.length < 3) return;
    const normalized = normalizeDomain(domain);
    const result = await validateDomain(normalized);
    setDomainConflict(result.conflict);
  }, [validateDomain]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.companyDomain) {
        checkDomain(formData.companyDomain);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.companyDomain, checkDomain]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DealFormData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = t('validation.required');
    }
    if (!formData.companyDomain.trim()) {
      newErrors.companyDomain = t('validation.required');
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = t('validation.required');
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = t('validation.invalidEmail');
    }
    if (formData.dealValue <= 0) {
      newErrors.dealValue = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;
    if (domainConflict) {
      setError(t('validation.domainConflict'));
      return;
    }

    setIsLoading(true);

    try {
      const deal = await createDeal(formData);
      if (deal) {
        router.push(`/${locale}/partners/portal/deals/${deal.id}`);
      }
    } catch {
      setError('Failed to create deal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof DealFormData, value: string | number) => {
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

  if (!hasSignedLegal) {
    return (
      <Alert variant="warning" title="Legal Documents Required">
        {t('validation.legalRequired')}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label={t('form.companyName')}
          value={formData.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          error={errors.companyName}
          required
        />

        <div>
          <Input
            label={t('form.companyDomain')}
            value={formData.companyDomain}
            onChange={(e) => handleChange('companyDomain', e.target.value)}
            error={errors.companyDomain || (domainConflict ? t('validation.domainConflict') : undefined)}
            placeholder="example.com"
            required
          />
        </div>

        <Input
          label={t('form.contactName')}
          value={formData.contactName}
          onChange={(e) => handleChange('contactName', e.target.value)}
          error={errors.contactName}
          required
        />

        <Input
          label={t('form.contactEmail')}
          type="email"
          value={formData.contactEmail}
          onChange={(e) => handleChange('contactEmail', e.target.value)}
          error={errors.contactEmail}
          required
        />

        <Input
          label={t('form.contactPhone')}
          type="tel"
          value={formData.contactPhone}
          onChange={(e) => handleChange('contactPhone', e.target.value)}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label={t('form.dealValue')}
              type="number"
              value={formData.dealValue || ''}
              onChange={(e) => handleChange('dealValue', parseFloat(e.target.value) || 0)}
              error={errors.dealValue}
              min={0}
              required
            />
          </div>
          <div className="w-32">
            <Select
              label={t('form.currency')}
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'BRL', label: 'BRL' },
              ]}
            />
          </div>
        </div>
      </div>

      <Textarea
        label={t('form.notes')}
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        rows={4}
      />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={domainConflict}
        >
          {t('form.submit')}
        </Button>
      </div>
    </form>
  );
}
