'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Mail, Phone, Building2, MapPin, Users, FileText, Calendar } from 'lucide-react';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Deal } from '@/types';

interface DealDetailProps {
  deal: Deal;
  locale: string;
}

const governmentLevelLabels: Record<string, string> = {
  municipality: 'Municipio',
  province: 'Provincia / Estado',
  nation: 'Nacional',
};

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  more_info: 'warning',
  closed_won: 'success',
  closed_lost: 'danger',
};

const statusLabels: Record<string, string> = {
  pending_approval: 'Pendiente de Aprobacion',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  more_info: 'Mas Informacion Requerida',
  closed_won: 'Cerrada Ganada',
  closed_lost: 'Cerrada Perdida',
};

export function DealDetail({ deal, locale }: DealDetailProps) {
  const t = useTranslations('deals');

  const basePath = `/${locale}/partners/portal/deals`;

  const formatPopulation = (pop: number): string => {
    return pop.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={basePath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Deal Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{deal.clientName}</CardTitle>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge variant={statusVariants[deal.status]}>
                      {statusLabels[deal.status]}
                    </Badge>
                    <span className="text-gray-500">
                      {governmentLevelLabels[deal.governmentLevel]}
                    </span>
                  </div>
                </div>
                {deal.status === 'approved' && (
                  <Link href={`${basePath}/${deal.id}/quote`}>
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Crear Cotizacion
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{deal.country}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span>{formatPopulation(deal.population)} habitantes</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span>Creado: {formatDate(deal.createdAt, locale)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <span>
                    {deal.partnerGeneratedLead ? 'Lead generado por partner' : 'Lead de Sovra'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informacion de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{deal.contactName}</p>
                  <p className="text-sm text-gray-500">{deal.contactRole}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${deal.contactEmail}`} className="hover:text-indigo-600">
                    {deal.contactEmail}
                  </a>
                </div>
                {deal.contactPhone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${deal.contactPhone}`} className="hover:text-indigo-600">
                      {deal.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripcion de la Oportunidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-600">{deal.description}</p>
            </CardContent>
          </Card>

          {/* Status Message */}
          {deal.rejectionReason && (deal.status === 'rejected' || deal.status === 'more_info') && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {deal.status === 'rejected' ? 'Razon del Rechazo' : 'Informacion Solicitada'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  deal.status === 'rejected' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                }`}>
                  <p>{deal.rejectionReason}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Estado actual</p>
                <Badge variant={statusVariants[deal.status]} className="mt-1">
                  {statusLabels[deal.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ultimo cambio</p>
                <p className="font-medium">{formatDate(deal.statusChangedAt, locale)}</p>
              </div>
              {deal.status === 'approved' && (
                <div className="pt-4 border-t border-gray-200">
                  <Link href={`${basePath}/${deal.id}/quote`}>
                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Crear Cotizacion
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
