import React, { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Clock, TrendingUp, TrendingDown, AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { computeLocationStats, formatDuration } from '@/hooks/useLocationStats';
import StatCard from './StatCard';

const SORT_OPTIONS = [
  { value: 'avg_desc', label: 'Slowest first' },
  { value: 'avg_asc', label: 'Fastest first' },
  { value: 'count_desc', label: 'Most deliveries' },
  { value: 'name_asc', label: 'Name (A–Z)' },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2.5 text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-foreground text-sm truncate max-w-[180px]">{d.name}</p>
      <div className="flex justify-between gap-4"><span className="text-muted-foreground">Avg time</span><span className="font-semibold text-foreground">{formatDuration(d.avgMinutes)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-muted-foreground">Range</span><span className="text-foreground">{formatDuration(d.minMinutes)} – {formatDuration(d.maxMinutes)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-muted-foreground">Deliveries</span><span className="text-foreground">{d.count}</span></div>
    </div>
  );
}

export default function LocationsTab({ orders }) {
  const { t } = useI18n();
  const [sortBy, setSortBy] = useState('avg_desc');

  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);
  const locationStats = useMemo(() => computeLocationStats(orders), [orders]);

  const chartData = useMemo(() => {
    const rows = [];
    locationStats.forEach((s, locId) => rows.push({ locId, name: s.locationName || locId, ...s }));
    switch (sortBy) {
      case 'avg_asc': return rows.sort((a, b) => a.avgMinutes - b.avgMinutes);
      case 'count_desc': return rows.sort((a, b) => b.count - a.count);
      case 'name_asc': return rows.sort((a, b) => a.name.localeCompare(b.name));
      default: return rows.sort((a, b) => b.avgMinutes - a.avgMinutes);
    }
  }, [locationStats, sortBy]);

  const overallAvg = useMemo(() => chartData.length === 0 ? 0 : Math.round(chartData.reduce((s, d) => s + d.avgMinutes, 0) / chartData.length), [chartData]);
  const sortedByAvg = [...chartData].sort((a, b) => b.avgMinutes - a.avgMinutes);
  const fastestLoc = sortedByAvg[sortedByAvg.length - 1];
  const slowestLoc = sortedByAvg[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">{deliveredOrders.length} completed orders</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={MapPin} label="Total Deliveries" value={deliveredOrders.length} sub="with timing data" />
        <StatCard icon={Clock} label="Overall Avg Time" value={formatDuration(overallAvg) || '—'} sub="across all locations" color="text-blue-500" />
        <StatCard icon={TrendingUp} label="Slowest Location" value={slowestLoc ? formatDuration(slowestLoc.avgMinutes) : '—'} sub={slowestLoc?.name || '—'} color="text-red-500" />
        <StatCard icon={TrendingDown} label="Fastest Location" value={fastestLoc ? formatDuration(fastestLoc.avgMinutes) : '—'} sub={fastestLoc?.name || '—'} color="text-emerald-500" />
      </div>
      {chartData.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No delivery timing data yet</p>
          <p className="text-sm mt-1">Complete orders with departure and completion times to see analytics.</p>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Average Delivery Time by Location</h2>
            <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 52)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={v => `${v}min`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 20 ? v.slice(0, 18) + '…' : v} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                <ReferenceLine x={overallAvg} stroke="hsl(var(--primary))" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `Avg ${formatDuration(overallAvg)}`, position: 'top', fontSize: 10, fill: 'hsl(var(--primary))' }} />
                <Bar dataKey="avgMinutes" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {chartData.map((entry) => <Cell key={entry.locId} fill={entry.avgMinutes > overallAvg ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.45)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border"><h2 className="font-semibold text-sm">Location Breakdown</h2></div>
            <div className="divide-y divide-border">
              {chartData.map((d, i) => {
                const isAboveAvg = d.avgMinutes > overallAvg;
                const pct = overallAvg > 0 ? Math.round(((d.avgMinutes - overallAvg) / overallAvg) * 100) : 0;
                return (
                  <div key={d.locId} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-muted/40 transition-colors">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                    <span className="font-medium text-sm flex-1 min-w-[120px]">{d.name}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold tabular-nums">{formatDuration(d.avgMinutes)}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${isAboveAvg ? 'border-red-300 text-red-600 bg-red-50 dark:bg-red-950/20' : 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'}`}>
                        {isAboveAvg ? <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />}
                        {isAboveAvg ? '+' : ''}{pct}% vs avg
                      </Badge>
                      <span className="text-xs text-muted-foreground">Range: {formatDuration(d.minMinutes)}–{formatDuration(d.maxMinutes)}</span>
                      <span className="text-xs text-muted-foreground">{d.count} order{d.count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}