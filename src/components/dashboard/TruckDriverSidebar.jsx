import React from 'react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Truck, Users } from 'lucide-react';

const statusColors = {
  available: 'bg-emerald-500',
  in_transit: 'bg-amber-500',
  loading: 'bg-blue-500',
  maintenance: 'bg-red-500',
  off_duty: 'bg-gray-400',
  on_route: 'bg-amber-500',
  vacation: 'bg-purple-400',
};

const statusLabels = {
  en: { available: 'Available', in_transit: 'In Transit', loading: 'Loading', maintenance: 'Maint.', off_duty: 'Off Duty', on_route: 'On Route', vacation: 'Vacation' },
  es: { available: 'Disponible', in_transit: 'En Tránsito', loading: 'Cargando', maintenance: 'Mant.', off_duty: 'F. Servicio', on_route: 'En Ruta', vacation: 'Vacaciones' },
};

export default function TruckDriverSidebar({ trucks, drivers }) {
  const { t, lang } = useI18n();

  const truckGroups = {};
  trucks.forEach(tr => {
    truckGroups[tr.status] = (truckGroups[tr.status] || 0) + 1;
  });

  const driverGroups = {};
  drivers.forEach(dr => {
    driverGroups[dr.availability] = (driverGroups[dr.availability] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">{t('trucksSummary')}</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(truckGroups).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", statusColors[status] || 'bg-gray-400')} />
                <span className="text-xs text-muted-foreground">
                  {statusLabels[lang]?.[status] || status}
                </span>
              </div>
              <span className="text-sm font-semibold">{count}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{t('total')}</span>
          <span className="text-sm font-bold">{trucks.length}</span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">{t('driversSummary')}</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(driverGroups).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", statusColors[status] || 'bg-gray-400')} />
                <span className="text-xs text-muted-foreground">
                  {statusLabels[lang]?.[status] || status}
                </span>
              </div>
              <span className="text-sm font-semibold">{count}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{t('total')}</span>
          <span className="text-sm font-bold">{drivers.length}</span>
        </div>
      </div>
    </div>
  );
}