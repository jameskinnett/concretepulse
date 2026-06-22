import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Truck, Package, CheckCircle2, Wrench } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const PALETTE = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const statusColors = {
  available: 'bg-emerald-500/10 text-emerald-600',
  in_transit: 'bg-blue-500/10 text-blue-600',
  loading: 'bg-amber-500/10 text-amber-600',
  maintenance: 'bg-red-500/10 text-red-600',
  off_duty: 'bg-muted text-muted-foreground',
};

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="w-4 h-4" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold text-foreground">{value}</p>{sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}</div>
    </div>
  );
}

export default function TrucksTab({ orders, trucks }) {
  const { t } = useI18n();

  const data = useMemo(() => {
    const map = new Map();
    trucks.forEach(tr => {
      map.set(tr.id, { id: tr.id, name: tr.truck_id, plate: tr.plate, capacity: tr.capacity_m3, status: tr.status, deliveries: 0, volume: 0 });
    });
    orders.forEach(o => {
      if (o.status === 'delivered' && o.assigned_truck_id && map.has(o.assigned_truck_id)) {
        const d = map.get(o.assigned_truck_id);
        d.deliveries += 1;
        d.volume += o.quantity_m3 || 0;
      }
    });
    return [...map.values()].sort((a, b) => b.deliveries - a.deliveries);
  }, [orders, trucks]);

  const totalDeliveries = data.reduce((s, d) => s + d.deliveries, 0);
  const totalVolume = data.reduce((s, d) => s + d.volume, 0);
  const activeTrucks = trucks.filter(tr => tr.status === 'in_transit' || tr.status === 'loading').length;
  const maintenanceTrucks = trucks.filter(tr => tr.status === 'maintenance').length;
  const utilization = trucks.length > 0 ? Math.round((activeTrucks / trucks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Truck} label={t('trucks')} value={trucks.length} sub={`${utilization}% ${t('fleetUtilization')}`} />
        <StatCard icon={Package} label={t('deliveriesCompleted')} value={totalDeliveries} sub="all trucks" color="text-emerald-500" />
        <StatCard icon={CheckCircle2} label={t('totalVolume')} value={`${totalVolume} m³`} sub="delivered" color="text-blue-500" />
        <StatCard icon={Wrench} label={t('downtime')} value={maintenanceTrucks} sub="in maintenance" color="text-red-500" />
      </div>

      {data.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No truck data yet</p>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">{t('deliveriesCompleted')} {t('perTruck')}</h2>
            <ResponsiveContainer width="100%" height={Math.max(220, data.length * 48)}>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                <Bar dataKey="deliveries" name="Deliveries" radius={[0, 4, 4, 0]} maxBarSize={26}>
                  {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border"><h2 className="font-semibold text-sm">Truck Breakdown</h2></div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('truck')}</TableHead>
                  <TableHead>{t('plate')}</TableHead>
                  <TableHead>{t('capacity')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('deliveriesCompleted')}</TableHead>
                  <TableHead>{t('totalVolume')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(tr => (
                  <TableRow key={tr.id}>
                    <TableCell className="font-medium">{tr.name}</TableCell>
                    <TableCell className="text-muted-foreground">{tr.plate}</TableCell>
                    <TableCell>{tr.capacity} m³</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColors[tr.status]}>{t(tr.status)}</Badge></TableCell>
                    <TableCell className="font-semibold">{tr.deliveries}</TableCell>
                    <TableCell className="text-muted-foreground">{tr.volume} m³</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}