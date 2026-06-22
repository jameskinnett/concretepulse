import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { Package, CheckCircle2, XCircle, Truck, Clock, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/hooks/useLocationStats';
import StatCard from './StatCard';

export default function OverviewTab({ orders, trucks }) {
  const { t } = useI18n();

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const active = orders.filter(o => o.status === 'in_progress' || o.status === 'assigned').length;
    const activeTrucks = trucks.filter(tr => tr.status === 'in_transit' || tr.status === 'loading').length;
    const totalTrucks = trucks.length;
    const utilization = totalTrucks > 0 ? Math.round((activeTrucks / totalTrucks) * 100) : 0;

    const deliveredOrders = orders.filter(o => o.status === 'delivered' && o.departure_time && o.completion_time);
    let totalMinutes = 0;
    deliveredOrders.forEach(o => {
      const mins = (new Date(o.completion_time) - new Date(o.departure_time)) / 60000;
      if (mins > 0 && mins < 600) totalMinutes += mins;
    });
    const avgMinutes = deliveredOrders.length > 0 ? Math.round(totalMinutes / deliveredOrders.length) : 0;

    const totalVolume = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.quantity_m3 || 0), 0);

    return { total, delivered, cancelled, active, activeTrucks, totalTrucks, utilization, avgMinutes, totalVolume };
  }, [orders, trucks]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label={t('totalOrders')} value={stats.total} sub={`${stats.active} ${t('activeDeliveries')}`} />
        <StatCard icon={CheckCircle2} label={t('completedOrders')} value={stats.delivered} sub={`${stats.totalVolume} m³ ${t('totalVolume')}`} color="text-emerald-500" />
        <StatCard icon={XCircle} label={t('cancelledOrders')} value={stats.cancelled} sub={stats.total > 0 ? `${Math.round((stats.cancelled / stats.total) * 100)}% ${t('cancellationRate')}` : '—'} color="text-red-500" />
        <StatCard icon={Truck} label={t('fleetUtilization')} value={`${stats.utilization}%`} sub={`${stats.activeTrucks}/${stats.totalTrucks} ${t('activeTrucks')}`} color="text-blue-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <StatCard icon={Clock} label={t('avgDeliveryTime')} value={formatDuration(stats.avgMinutes) || '—'} sub="across all delivered orders" color="text-amber-500" />
        <StatCard icon={TrendingUp} label={t('activeDeliveries')} value={stats.active} sub="assigned + in progress" color="text-violet-500" />
      </div>
    </div>
  );
}