import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { BarChart2, Clock, TrendingUp, TrendingDown, AlertTriangle, Package, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { computeLocationStats, formatDuration } from '@/hooks/useLocationStats';

const SORT_OPTIONS = [
  { value: 'avg_desc', label: 'Slowest first' },
  { value: 'avg_asc', label: 'Fastest first' },
  { value: 'count_desc', label: 'Most deliveries' },
  { value: 'name_asc', label: 'Name (A–Z)' },
];

// Custom tooltip for the bar chart
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2.5 text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-foreground text-sm truncate max-w-[180px]">{d.name}</p>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Avg time</span>
        <span className="font-semibold text-foreground">{formatDuration(d.avgMinutes)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Range</span>
        <span className="text-foreground">{formatDuration(d.minMinutes)} – {formatDuration(d.maxMinutes)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Deliveries</span>
        <span className="text-foreground">{d.count}</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-muted ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Reports() {
  const [sortBy, setSortBy] = useState('avg_desc');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-completion_time', 500),
  });

  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);
  const locationStats = useMemo(() => computeLocationStats(orders), [orders]);

  // Build flat array for chart
  const chartData = useMemo(() => {
    const rows = [];
    locationStats.forEach((s, locId) => {
      rows.push({ locId, name: s.locationName || locId, ...s });
    });

    switch (sortBy) {
      case 'avg_asc':  return rows.sort((a, b) => a.avgMinutes - b.avgMinutes);
      case 'count_desc': return rows.sort((a, b) => b.count - a.count);
      case 'name_asc': return rows.sort((a, b) => a.name.localeCompare(b.name));
      default:         return rows.sort((a, b) => b.avgMinutes - a.avgMinutes);
    }
  }, [locationStats, sortBy]);

  const overallAvg = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(chartData.reduce((s, d) => s + d.avgMinutes, 0) / chartData.length);
  }, [chartData]);

  const slowest = chartData[sortBy === 'avg_desc' ? 0 : [...chartData].sort((a, b) => b.avgMinutes - a.avgMinutes)[0] === chartData[0] ? 0 : -1];
  const sortedByAvg = [...chartData].sort((a, b) => b.avgMinutes - a.avgMinutes);
  const fastestLoc = sortedByAvg[sortedByAvg.length - 1];
  const slowestLoc = sortedByAvg[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Delivery Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Average completion times per delivery location · based on {deliveredOrders.length} completed orders
          </p>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Deliveries" value={deliveredOrders.length} sub="with timing data" />
        <StatCard icon={Clock} label="Overall Avg Time" value={formatDuration(overallAvg) || '—'} sub="across all locations" color="text-blue-500" />
        <StatCard
          icon={TrendingUp}
          label="Slowest Location"
          value={slowestLoc ? formatDuration(slowestLoc.avgMinutes) : '—'}
          sub={slowestLoc?.name || '—'}
          color="text-red-500"
        />
        <StatCard
          icon={TrendingDown}
          label="Fastest Location"
          value={fastestLoc ? formatDuration(fastestLoc.avgMinutes) : '—'}
          sub={fastestLoc?.name || '—'}
          color="text-emerald-500"
        />
      </div>

      {chartData.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No delivery timing data yet</p>
          <p className="text-sm mt-1">Complete orders with departure and completion times to see location analytics.</p>
        </div>
      ) : (
        <>
          {/* Main bar chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Average Delivery Time by Location</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-sm bg-primary/40 border border-primary/60" />
                Below avg
                <div className="w-3 h-3 rounded-sm bg-primary ml-1" />
                Above avg
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 52)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tickFormatter={v => `${v}min`}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v.length > 20 ? v.slice(0, 18) + '…' : v}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                <ReferenceLine
                  x={overallAvg}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{ value: `Avg ${formatDuration(overallAvg)}`, position: 'top', fontSize: 10, fill: 'hsl(var(--primary))' }}
                />
                <Bar dataKey="avgMinutes" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.locId}
                      fill={entry.avgMinutes > overallAvg ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.45)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detail table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Location Breakdown</h2>
            </div>
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