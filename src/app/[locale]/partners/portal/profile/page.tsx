'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, Camera, Mail, Phone, Briefcase, MapPin, Globe, Linkedin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, SovraLoader } from '@/components/ui';
import { logger } from '@/lib/logger';
import type { User as UserType } from '@/types';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = use(params);
  const t = useTranslations('profile');
  const router = useRouter();

  const [user, setUser] = useState<Partial<UserType> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    jobTitle: '',
    bio: '',
    location: '',
    country: '',
    language: 'es' as 'es' | 'en' | 'pt',
    linkedIn: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/partners/profile');
        if (!res.ok) {
          if (res.status === 401) {
            router.replace(`/${locale}/partners/login`);
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setUser(data.user);

        // Initialize form with existing data
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          jobTitle: data.user.jobTitle || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          country: data.user.country || '',
          language: data.user.language || 'es',
          linkedIn: data.user.linkedIn || '',
        });

        if (data.user.avatarUrl) {
          setAvatarPreview(data.user.avatarUrl);
        }
      } catch (err) {
        logger.error('Failed to fetch profile', { error: err });
        setError(t('errors.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [locale, router, t]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage('');
    setError('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('errors.invalidFileType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('errors.fileTooLarge'));
      return;
    }

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      // Update profile
      const res = await fetch('/api/partners/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await res.json();
      setUser(data.user);
      setMessage(t('success.profileUpdated'));
    } catch (err) {
      logger.error('Failed to update profile', { error: err });
      setError(err instanceof Error ? err.message : t('errors.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview || avatarPreview === user?.avatarUrl) {
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/partners/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: avatarPreview }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload avatar');
      }

      const data = await res.json();
      setUser(data.user);
      setMessage(t('success.avatarUpdated'));
    } catch (err) {
      logger.error('Failed to upload avatar', { error: err });
      setError(err instanceof Error ? err.message : t('errors.uploadFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/partners/profile/avatar', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove avatar');
      }

      const data = await res.json();
      setUser(data.user);
      setAvatarPreview('');
      setMessage(t('success.avatarRemoved'));
    } catch (err) {
      logger.error('Failed to remove avatar', { error: err });
      setError(err instanceof Error ? err.message : t('errors.removeFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('subtitle')}</p>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.avatar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Camera className="h-4 w-4 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isSaving}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                {t('avatarHelp')}
              </p>
              <div className="flex gap-2">
                {avatarPreview && avatarPreview !== user?.avatarUrl && (
                  <Button
                    onClick={handleSaveAvatar}
                    disabled={isSaving}
                    size="sm"
                  >
                    {t('buttons.saveAvatar')}
                  </Button>
                )}
                {user?.avatarUrl && (
                  <Button
                    onClick={handleRemoveAvatar}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                  >
                    {t('buttons.removeAvatar')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.basic')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              <User className="inline h-4 w-4 mr-2" />
              {t('fields.name')}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('placeholders.name')}
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              <Mail className="inline h-4 w-4 mr-2" />
              {t('fields.email')}
            </label>
            <Input value={user?.email || ''} disabled className="bg-gray-100 dark:bg-gray-800" />
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t('emailHelp')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              <Phone className="inline h-4 w-4 mr-2" />
              {t('fields.phone')}
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('placeholders.phone')}
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              <Briefcase className="inline h-4 w-4 mr-2" />
              {t('fields.jobTitle')}
            </label>
            <Input
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder={t('placeholders.jobTitle')}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.additional')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t('fields.bio')}
            </label>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder={t('placeholders.bio')}
              disabled={isSaving}
              rows={4}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {formData.bio.length}/500
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                {t('fields.location')}
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t('placeholders.location')}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <Globe className="inline h-4 w-4 mr-2" />
                {t('fields.country')}
              </label>
              <Input
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder={t('placeholders.country')}
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              <Globe className="inline h-4 w-4 mr-2" />
              {t('fields.language')}
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              disabled={isSaving}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              <Linkedin className="inline h-4 w-4 mr-2" />
              {t('fields.linkedIn')}
            </label>
            <Input
              value={formData.linkedIn}
              onChange={(e) => handleInputChange('linkedIn', e.target.value)}
              placeholder={t('placeholders.linkedIn')}
              disabled={isSaving}
              type="url"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? t('buttons.saving') : t('buttons.save')}
        </Button>
      </div>
    </div>
  );
}
