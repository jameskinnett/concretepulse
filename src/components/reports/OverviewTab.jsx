import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { Package, CheckCircle2, XCircle, Truck, Clock, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/hooks/useLocationStats';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import StatCard from './StatCard';

const STATUS_COLORS = {
  new: 'hsl(var(--chart-4))',
  assigned: 'hsl(var(--chart-2))',
  in_progress: 'hsl(var(--chart-3))',
  delivered: 'hsl(var(--chart-2))',
  cancelled: 'hsl(var(--destructive))',
};

const MIX_PALETTE = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#a78bfa', '#60a5fa'];

export default function OverviewTab({ orders, trucks }) {
  const { t } = useI18n();

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const active = orders.filter((o) => o.status === 'in_progress' || o.status === 'assigned').length;
    const activeTrucks = trucks.filter((tr) => tr.status === 'in_transit' || tr.status === 'loading').length;
    const totalTrucks = trucks.length;
    const utilization = totalTrucks > 0 ? Math.round((activeTrucks / totalTrucks) * 100) : 0;

    const deliveredOrders = orders.filter((o) => o.status === 'delivered' && o.departure_time && o.completion_time);
    let totalMinutes = 0;
    deliveredOrders.forEach((o) => {
      const mins = (new Date(o.completion_time) - new Date(o.departure_time)) / 60000;
      if (mins > 0 && mins < 600) totalMinutes += mins;
    });
    const avgMinutes = deliveredOrders.length > 0 ? Math.round(totalMinutes / deliveredOrders.length) : 0;

    const totalVolume = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (o.quantity_m3 || 0), 0);

    return { total, delivered, cancelled, active, activeTrucks, totalTrucks, utilization, avgMinutes, totalVolume };
  }, [orders, trucks]);

  const dailyTrend = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const dateStr = (o.scheduled_time || o.created_date || '').slice(0, 10);
      if (!dateStr) return;
      if (!map.has(dateStr)) map.set(dateStr, { date: dateStr, total: 0, delivered: 0, volume: 0 });
      const d = map.get(dateStr);
      d.total += 1;
      if (o.status === 'delivered') {
        d.delivered += 1;
        d.volume += o.quantity_m3 || 0;
      }
    });
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [orders]);

  const statusData = useMemo(() => {
    const counts = { new: 0, assigned: 0, in_progress: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: t(key), value, key }));
  }, [orders, t]);

  const mixData = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      if (!o.mix_type) return;
      map.set(o.mix_type, (map.get(o.mix_type) || 0) + 1);
    });
    return [...map.entries()].map(([mix, count]) => ({ mix, count })).sort((a, b) => b.count - a.count);
  }, [orders]);

  const trendTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-xs space-y-1">
        <p className="font-semibold text-sm">{format(parseISO(d.date), 'MMM d, yyyy')}</p>
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Total</span><span className="font-semibold">{d.total}</span></div>
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Delivered</span><span className="font-semibold text-emerald-600">{d.delivered}</span></div>
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Volume</span><span className="font-semibold">{d.volume} m³</span></div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label={t('totalOrders')} value={stats.total} sub={`${stats.active} ${t('activeDeliveries')}`} />
        <StatCard icon={CheckCircle2} label={t('completedOrders')} value={stats.delivered} sub={`${stats.totalVolume} m³ ${t('totalVolume')}`} color="text-emerald-500" />
        <StatCard icon={XCircle} label={t('cancelledOrders')} value={stats.cancelled} sub={stats.total > 0 ? `${Math.round((stats.cancelled / stats.total) * 100)}% ${t('cancellationRate')}` : '—'} color="text-red-500" />
        <StatCard icon={Truck} label={t('fleetUtilization')} value={`${stats.utilization}%`} sub={`${stats.activeTrucks}/${stats.totalTrucks} ${t('activeTrucks')}`} color="text-blue-500" />
      </div>

      {stats.total === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t('noDataInFilter')}</p>
        </div>
      ) : (
        <>
          {/* Daily trend */}
          {dailyTrend.length > 1 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-4">{t('dailyTrend')}</h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dailyTrend} margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(v) => format(parseISO(v), 'MMM d')} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={trendTooltip} />
                  <Area type="monotone" dataKey="total" name="Total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradTotal)" />
                  <Area type="monotone" dataKey="delivered" name="Delivered" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#gradDelivered)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status distribution */}
            {statusData.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-sm mb-4">{t('statusDistribution')}</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {statusData.map((entry) => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || 'hsl(var(--muted))'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Mix distribution */}
            {mixData.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-sm mb-4">{t('mixDistribution')}</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mixData} margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="mix" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                    <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {mixData.map((_, i) => (
                        <Cell key={i} fill={MIX_PALETTE[i % MIX_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <StatCard icon={Clock} label={t('avgDeliveryTime')} value={formatDuration(stats.avgMinutes) || '—'} sub="across all delivered orders" color="text-amber-500" />
            <StatCard icon={TrendingUp} label={t('activeDeliveries')} value={stats.active} sub="assigned + in progress" color="text-violet-500" />
          </div>
        </>
      )}
    </div>
  );
}