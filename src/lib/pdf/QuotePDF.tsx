import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Quote, Deal, Partner } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  headerRight: {
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  clientInfo: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    marginBottom: 20,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  clientDetail: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4b5563',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
    textAlign: 'right',
  },
  summaryBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  discountLabel: {
    fontSize: 10,
    color: '#059669',
  },
  discountValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  footerNote: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

interface QuotePDFProps {
  quote: Quote;
  deal: Deal;
  partner: Partner;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPopulation(population: number): string {
  if (population >= 1000000) {
    return `${(population / 1000000).toFixed(1)}M`;
  }
  if (population >= 1000) {
    return `${(population / 1000).toFixed(0)}K`;
  }
  return population.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const governmentLevelLabels: Record<string, string> = {
  municipality: 'Municipio',
  province: 'Provincia/Estado',
  nation: 'Nacional',
};

export function QuotePDF({ quote, deal, partner }: QuotePDFProps) {
  const items: { description: string; detail: string; price: number }[] = [];

  if (quote.products.sovraGov.included) {
    items.push({
      description: 'SovraGov - Plataforma de Gobierno Digital',
      detail: `${formatPopulation(deal.population)} hab. x ${formatCurrency(quote.products.sovraGov.pricePerInhabitant)}/hab`,
      price: quote.products.sovraGov.annualPrice,
    });
  }

  if (quote.products.sovraId.included) {
    const planLabels: Record<string, string> = {
      essentials: 'Essentials',
      professional: 'Professional',
      enterprise: 'Enterprise',
    };
    items.push({
      description: `SovraID - Plan ${planLabels[quote.products.sovraId.plan]}`,
      detail: `${formatCurrency(quote.products.sovraId.monthlyPrice)}/mes x 12 meses`,
      price: quote.products.sovraId.annualPrice,
    });
  }

  if (quote.services.walletImplementation) {
    items.push({
      description: 'Implementacion Wallet',
      detail: 'Servicio unico',
      price: quote.services.walletPrice,
    });
  }

  if (quote.services.integrationHours > 0) {
    items.push({
      description: 'Horas de Integracion',
      detail: `${quote.services.integrationHours} horas x ${formatCurrency(quote.services.integrationPricePerHour)}/hora`,
      price: quote.services.integrationTotal,
    });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>SOVRA</Text>
          <View style={styles.headerRight}>
            <Text style={styles.title}>Propuesta Comercial</Text>
            <Text style={styles.date}>{formatDate(quote.createdAt)}</Text>
            <Text style={styles.date}>Cotizacion #{quote.id.split('-')[0]}</Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{deal.clientName}</Text>
          <Text style={styles.clientDetail}>
            {deal.country} - {governmentLevelLabels[deal.governmentLevel]}
          </Text>
          <Text style={styles.clientDetail}>
            Poblacion: {formatPopulation(deal.population)} habitantes
          </Text>
          <Text style={styles.clientDetail}>
            Contacto: {deal.contactName} - {deal.contactRole}
          </Text>
        </View>

        {/* Products & Services Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soluciones y Servicios</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>DESCRIPCION</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>DETALLE</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>PRECIO</Text>
            </View>
            {items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.description}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.detail}</Text>
                <Text style={[styles.tableCellRight, { flex: 1 }]}>{formatCurrency(item.price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>

          {quote.discounts.totalDiscountPercent > 0 && (
            <>
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>
                  Descuento Partner {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)} ({quote.discounts.baseDiscountPercent}%)
                </Text>
                <Text style={styles.discountValue}>
                  -{formatCurrency(quote.subtotal * (quote.discounts.baseDiscountPercent / 100))}
                </Text>
              </View>
              {quote.discounts.leadBonusPercent > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.discountLabel}>
                    Bonus Lead Generado ({quote.discounts.leadBonusPercent}%)
                  </Text>
                  <Text style={styles.discountValue}>
                    -{formatCurrency(quote.subtotal * (quote.discounts.leadBonusPercent / 100))}
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.total)} USD/ano</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Partner: {partner.companyName}</Text>
          <Text style={styles.footerText}>Contacto: {partner.email}</Text>
          <Text style={styles.footerNote}>
            Esta cotizacion es valida por 30 dias. Los precios estan expresados en dolares estadounidenses.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
