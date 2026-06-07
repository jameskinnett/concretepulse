import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Package, Truck, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsCards({ orders, trucks }) {
  const { t } = useI18n();

  const totalOrders = orders.length;
  const activeDeliveries = orders.filter(o => o.status === 'in_progress').length;
  const trucksAvailable = trucks.filter(tr => tr.status === 'available').length;
  const todayDelivered = orders.filter(o => o.status === 'delivered').length;

  const stats = [
    { label: t('totalOrders'), value: totalOrders, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('activeDeliveries'), value: activeDeliveries, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t('trucksAvailable'), value: `${trucksAvailable}/${trucks.length}`, icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: t('todayDelivered'), value: todayDelivered, icon: CheckCircle2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", s.bg)}>
              <s.icon className={cn("w-4.5 h-4.5", s.color)} />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}