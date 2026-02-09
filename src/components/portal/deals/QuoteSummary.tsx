'use client';

import { Download, FileText, Calendar, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Quote } from '@/types';

interface QuoteSummaryProps {
  quotes: Quote[];
  locale: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : locale, {
    dateStyle: 'medium',
  }).format(date);
}

export function QuoteSummary({ quotes, locale }: QuoteSummaryProps) {
  if (quotes.length === 0) {
    return null;
  }

  // Mostrar la cotización más reciente
  const latestQuote = quotes[quotes.length - 1];

  const productsSummary = [];
  if (latestQuote.products.sovraGov.included) {
    productsSummary.push({
      name: 'SovraGov',
      detail: `${latestQuote.products.sovraGov.populationUsed.toLocaleString()} habitantes`,
      price: latestQuote.products.sovraGov.annualPrice,
    });
  }
  if (latestQuote.products.sovraId.included) {
    productsSummary.push({
      name: 'SovraID',
      detail: `Plan ${latestQuote.products.sovraId.plan}`,
      price: latestQuote.products.sovraId.annualPrice,
    });
  }

  const servicesSummary = [];
  if (latestQuote.services.walletImplementation) {
    servicesSummary.push({
      name: 'Implementación de Wallet',
      price: latestQuote.services.walletPrice,
    });
  }
  if (latestQuote.services.integrationHours > 0) {
    servicesSummary.push({
      name: 'Integración',
      detail: `${latestQuote.services.integrationHours} horas`,
      price: latestQuote.services.integrationTotal,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Cotización
          </CardTitle>
          <span className="text-sm font-medium text-gray-500">
            Versión {latestQuote.version}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Creada: {formatDate(latestQuote.createdAt, locale)}</span>
        </div>

        {/* Productos incluidos */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Productos</h4>
          <div className="space-y-2">
            {productsSummary.map((product, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  {product.detail && (
                    <p className="text-xs text-gray-500">{product.detail}</p>
                  )}
                </div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios (si hay) */}
        {servicesSummary.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Servicios</h4>
            <div className="space-y-2">
              {servicesSummary.map((service, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.detail && (
                      <p className="text-xs text-gray-500">{service.detail}</p>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(latestQuote.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Descuento ({latestQuote.discounts.totalDiscountPercent}%)
            </span>
            <span className="font-medium text-green-600">
              -{formatCurrency(latestQuote.totalDiscount)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-base font-semibold text-gray-900">Total Anual</span>
            <span className="text-xl font-bold text-blue-600 flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              {formatCurrency(latestQuote.total)}
            </span>
          </div>
        </div>

        {/* PDF Download */}
        {latestQuote.pdfUrl && (
          <div className="pt-3 border-t border-gray-200">
            <a
              href={latestQuote.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Descargar PDF</span>
            </a>
          </div>
        )}

        {/* Versiones anteriores */}
        {quotes.length > 1 && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {quotes.length - 1} versión(es) anterior(es) disponible(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
