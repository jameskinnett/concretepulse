import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2, Package, TrendingUp, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const PALETTE = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="w-4 h-4" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold text-foreground">{value}</p>{sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}</div>
    </div>
  );
}

export default function CustomersTab({ orders, companies }) {
  const { t } = useI18n();

  const data = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      const id = o.company_id || 'unknown';
      const name = o.company_name || 'Unknown';
      if (!map.has(id)) map.set(id, { id, name, total: 0, delivered: 0, cancelled: 0, volume: 0 });
      const d = map.get(id);
      d.total += 1;
      if (o.status === 'delivered') { d.delivered += 1; d.volume += o.quantity_m3 || 0; }
      if (o.status === 'cancelled') d.cancelled += 1;
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [orders]);

  const totalOrders = data.reduce((s, d) => s + d.total, 0);
  const totalDelivered = data.reduce((s, d) => s + d.delivered, 0);
  const totalCancelled = data.reduce((s, d) => s + d.cancelled, 0);
  const totalVolume = data.reduce((s, d) => s + d.volume, 0);
  const topCustomer = data[0];
  const overallCancelRate = totalOrders > 0 ? Math.round((totalCancelled / totalOrders) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Building2} label={t('customers')} value={data.length} sub="active companies" />
        <StatCard icon={Package} label={t('completedOrders')} value={totalDelivered} sub={`${totalVolume} m³ total`} color="text-emerald-500" />
        <StatCard icon={XCircle} label={t('cancelledOrders')} value={totalCancelled} sub={`${overallCancelRate}% ${t('cancellationRate')}`} color="text-red-500" />
        <StatCard icon={TrendingUp} label={t('topCustomers')} value={topCustomer?.name || '—'} sub={topCustomer ? `${topCustomer.total} orders` : '—'} color="text-violet-500" />
      </div>

      {data.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No customer data yet</p>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">{t('ordersByCompany')}</h2>
            <ResponsiveContainer width="100%" height={Math.max(220, data.length * 48)}>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 16 ? v.slice(0, 14) + '…' : v} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                <Bar dataKey="total" name="Total Orders" radius={[0, 4, 4, 0]} maxBarSize={26}>
                  {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border"><h2 className="font-semibold text-sm">Customer Breakdown</h2></div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('company')}</TableHead>
                  <TableHead>{t('totalOrders')}</TableHead>
                  <TableHead>{t('completedOrders')}</TableHead>
                  <TableHead>{t('cancelledOrders')}</TableHead>
                  <TableHead>{t('cancellationRate')}</TableHead>
                  <TableHead>{t('totalVolume')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(c => {
                  const cancelRate = c.total > 0 ? Math.round((c.cancelled / c.total) * 100) : 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.total}</TableCell>
                      <TableCell className="text-emerald-600">{c.delivered}</TableCell>
                      <TableCell className="text-red-600">{c.cancelled}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cancelRate > 20 ? 'border-red-300 text-red-600' : 'text-muted-foreground'}>
                          {cancelRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{c.volume} m³</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}