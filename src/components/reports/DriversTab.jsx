import React, { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Package, Clock, Trophy, Calendar, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportDriverPerformance } from '@/lib/pdfExport';
import { useRole } from '@/lib/useRole';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from 'date-fns';
import StatCard from './StatCard';

function getMonthOptions() {
  const options = [];
  for (let i = 0; i < 6; i++) {
    const d = subMonths(new Date(), i);
    options.push({ value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy'), start: startOfMonth(d), end: endOfMonth(d) });
  }
  return options;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2.5 text-xs space-y-1 min-w-[150px]">
      <p className="font-semibold text-foreground text-sm">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-semibold text-foreground">{p.value}{p.dataKey === 'hours' ? 'h' : ''}</span>
        </div>
      ))}
    </div>
  );
}

const PALETTE = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function DriversTab({ orders, drivers }) {
  const { t } = useI18n();
  const { canExportReports } = useRole();
  const MONTHS = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value);

  const monthRange = useMemo(() => MONTHS.find(m => m.value === selectedMonth), [MONTHS, selectedMonth]);

  const monthOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status !== 'delivered' || !o.assigned_driver_id || !o.completion_time) return false;
      return isWithinInterval(new Date(o.completion_time), { start: monthRange.start, end: monthRange.end });
    });
  }, [orders, monthRange]);

  const driverData = useMemo(() => {
    const map = new Map();
    monthOrders.forEach(o => {
      const id = o.assigned_driver_id;
      const name = o.assigned_driver_name || id;
      if (!map.has(id)) map.set(id, { id, name, orders: 0, hours: 0 });
      const d = map.get(id);
      d.orders += 1;
      if (o.departure_time && o.completion_time) {
        const h = (new Date(o.completion_time) - new Date(o.departure_time)) / 3600000;
        if (h > 0 && h < 24) d.hours += h;
      }
    });
    map.forEach((d) => { const found = drivers.find(dr => dr.id === d.id); if (found) d.name = found.name; });
    return [...map.values()].map(d => ({ ...d, hours: parseFloat(d.hours.toFixed(1)) })).sort((a, b) => b.orders - a.orders);
  }, [monthOrders, drivers]);

  const topDriver = driverData[0];
  const totalOrdersMonth = driverData.reduce((s, d) => s + d.orders, 0);
  const totalHoursMonth = driverData.reduce((s, d) => s + d.hours, 0).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Completed deliveries and hours worked per driver</p>
        <div className="flex items-center gap-2">
          {canExportReports && (
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs"
              onClick={() => exportDriverPerformance(driverData.map(d => ({ ...d, type: drivers.find(dr => dr.id === d.id)?.type || '—' })), monthRange.label)}>
              <Download className="w-3.5 h-3.5" /> Export PDF
            </Button>
          )}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-44 h-9 text-sm gap-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Active Drivers" value={driverData.length} sub="with deliveries this month" />
        <StatCard icon={Package} label="Total Orders" value={totalOrdersMonth} sub="completed this month" color="text-blue-500" />
        <StatCard icon={Clock} label="Total Hours" value={`${totalHoursMonth}h`} sub="across all drivers" color="text-amber-500" />
        <StatCard icon={Trophy} label="Top Driver" value={topDriver?.name || '—'} sub={topDriver ? `${topDriver.orders} orders · ${topDriver.hours}h` : 'No data'} color="text-emerald-500" />
      </div>
      {driverData.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No completed deliveries this month</p>
          <p className="text-sm mt-1">Try selecting a different month or complete some orders first.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary" />Orders Completed</h2>
              <ResponsiveContainer width="100%" height={Math.max(220, driverData.length * 48)}>
                <BarChart data={driverData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 14 ? v.slice(0, 12) + '…' : v} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                  <Bar dataKey="orders" name="Orders" radius={[0, 4, 4, 0]} maxBarSize={26}>{driverData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" />Hours Worked</h2>
              <ResponsiveContainer width="100%" height={Math.max(220, driverData.length * 48)}>
                <BarChart data={[...driverData].sort((a, b) => b.hours - a.hours)} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tickFormatter={v => `${v}h`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 14 ? v.slice(0, 12) + '…' : v} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                  <Bar dataKey="hours" name="Hours" radius={[0, 4, 4, 0]} maxBarSize={26} fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border"><h2 className="font-semibold text-sm">Driver Breakdown — {monthRange.label}</h2></div>
            <div className="divide-y divide-border">
              {driverData.map((d, i) => {
                const avgHoursPerOrder = d.orders > 0 ? (d.hours / d.orders).toFixed(1) : '—';
                return (
                  <div key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-muted/40 transition-colors">
                    <span className="text-xs text-muted-foreground w-5 shrink-0 font-bold">{i + 1}</span>
                    <span className="font-medium text-sm flex-1 min-w-[100px]">{d.name}</span>
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-primary" /><strong>{d.orders}</strong> <span className="text-muted-foreground text-xs">orders</span></span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /><strong>{d.hours}h</strong> <span className="text-muted-foreground text-xs">worked</span></span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">~{avgHoursPerOrder}h / order</Badge>
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