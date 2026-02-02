'use client';

import { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Briefcase,
  FileText,
} from 'lucide-react';
import type { Deal, Partner } from '@/types';

interface ApprovalQueueProps {
  deals: (Deal & { partner?: Partner })[];
  onApprove: (dealId: string) => Promise<void>;
  onReject: (dealId: string, reason: string) => Promise<void>;
  onRequestInfo: (dealId: string, message: string) => Promise<void>;
}

const governmentLevelLabels: Record<string, string> = {
  municipality: 'Municipio',
  province: 'Provincia/Estado',
  nation: 'Nacional',
};

export default function ApprovalQueue({
  deals,
  onApprove,
  onReject,
  onRequestInfo,
}: ApprovalQueueProps) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [actionDeal, setActionDeal] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'request_info' | null>(null);
  const [actionMessage, setActionMessage] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (dealId: string, action: 'approve' | 'reject' | 'request_info') => {
    if (action === 'approve') {
      setLoading(dealId);
      try {
        await onApprove(dealId);
      } finally {
        setLoading(null);
      }
    } else {
      setActionDeal(dealId);
      setActionType(action === 'reject' ? 'reject' : 'request_info');
      setActionMessage('');
    }
  };

  const submitAction = async () => {
    if (!actionDeal || !actionType || !actionMessage.trim()) return;

    setLoading(actionDeal);
    try {
      if (actionType === 'reject') {
        await onReject(actionDeal, actionMessage);
      } else {
        await onRequestInfo(actionDeal, actionMessage);
      }
    } finally {
      setLoading(null);
      setActionDeal(null);
      setActionType(null);
      setActionMessage('');
    }
  };

  const formatPopulation = (population: number) => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    }
    if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`;
    }
    return population.toString();
  };

  if (deals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay oportunidades pendientes
        </h3>
        <p className="text-gray-500">
          Todas las oportunidades han sido procesadas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => {
        const isExpanded = expandedDeal === deal.id;
        const isActionOpen = actionDeal === deal.id;

        return (
          <div
            key={deal.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{deal.clientName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {deal.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {formatPopulation(deal.population)} hab.
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {governmentLevelLabels[deal.governmentLevel]}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {deal.partner && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{deal.partner.companyName}</p>
                    <p className="text-xs text-gray-500 capitalize">{deal.partner.tier}</p>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Contacto
                    </h4>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{deal.contactName}</span>
                        <span className="text-gray-500">- {deal.contactRole}</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {deal.contactEmail}
                      </p>
                      {deal.contactPhone && (
                        <p className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {deal.contactPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Detalles
                    </h4>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Registrado: {new Date(deal.createdAt).toLocaleDateString('es')}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className={deal.partnerGeneratedLead ? 'text-green-600' : 'text-gray-600'}>
                          {deal.partnerGeneratedLead
                            ? 'Lead generado por partner'
                            : 'Lead proporcionado por Sovra'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Descripcion de la oportunidad
                  </h4>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                    {deal.description}
                  </p>
                </div>

                {/* Action form */}
                {isActionOpen && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      {actionType === 'reject'
                        ? 'Razon del rechazo'
                        : 'Solicitar informacion'}
                    </h4>
                    <textarea
                      value={actionMessage}
                      onChange={(e) => setActionMessage(e.target.value)}
                      placeholder={
                        actionType === 'reject'
                          ? 'Explica el motivo del rechazo...'
                          : 'Que informacion adicional necesitas?'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setActionDeal(null);
                          setActionType(null);
                          setActionMessage('');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={submitAction}
                        disabled={!actionMessage.trim() || loading === deal.id}
                        className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
                          actionType === 'reject'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                      >
                        {loading === deal.id
                          ? 'Procesando...'
                          : actionType === 'reject'
                          ? 'Rechazar'
                          : 'Solicitar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!isActionOpen && (
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => handleAction(deal.id, 'request_info')}
                      disabled={loading === deal.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Pedir mas info
                    </button>
                    <button
                      onClick={() => handleAction(deal.id, 'reject')}
                      disabled={loading === deal.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleAction(deal.id, 'approve')}
                      disabled={loading === deal.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {loading === deal.id ? 'Aprobando...' : 'Aprobar'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
