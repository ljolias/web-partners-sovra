'use client';

import { AlertCircle, Clock, FileWarning } from 'lucide-react';
import { Alert } from '@/components/ui';

interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

interface AlertsListProps {
  alerts: AlertItem[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return null;
  }

  const getIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'warning':
        return Clock;
      case 'error':
        return AlertCircle;
      default:
        return FileWarning;
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.type} title={alert.title}>
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}
