import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Package, AlertTriangle, Truck, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import NewOrderModal from '@/components/modals/NewOrderModal';
import OrderDetailModal from '@/components/modals/OrderDetailModal';
import BroadcastModal from '@/components/modals/BroadcastModal';

const statusColors = {
  new: 'bg-primary/10 text-primary border-primary/20',
  assigned: 'bg-blue-500/10 text-blue-600 border-blue-200',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-200',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  cancelled: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function Orders() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [broadcastOrder, setBroadcastOrder] = useState(null);

  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => base44.entities.Order.list('-created_date', 200) });
  const { data: trucks = [] } = useQuery({ queryKey: ['trucks'], queryFn: () => base44.entities.Truck.list() });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => base44.entities.Driver.list() });
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: () => base44.entities.Company.list() });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: () => base44.entities.DeliveryLocation.list() });
  const { data: compensations = [] } = useQuery({ queryKey: ['compensations'], queryFn: () => base44.entities.Compensation.list('-created_date', 200) });
  const { data: driverGroups = [] } = useQuery({ queryKey: ['driverGroups'], queryFn: () => base44.entities.DriverGroup.list() });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['trucks'] });
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    queryClient.invalidateQueries({ queryKey: ['compensations'] });
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || 
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.delivery_location_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {t('orders')}
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="w-4 h-4" /> {t('newOrder')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search')} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">{t('new')}</SelectItem>
            <SelectItem value="assigned">{t('assigned')}</SelectItem>
            <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
            <SelectItem value="delivered">{t('delivered')}</SelectItem>
            <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orderNumber')}</TableHead>
              <TableHead>{t('company')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('location')}</TableHead>
              <TableHead>{t('mixType')}</TableHead>
              <TableHead>{t('quantity')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('truck')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('scheduledTime')}</TableHead>
              <TableHead className="hidden xl:table-cell"><DollarSign className="w-3.5 h-3.5 inline" /> Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(order => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrder(order)}>
                <TableCell className="font-semibold text-primary">{order.order_number}</TableCell>
                <TableCell>{order.company_name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{order.delivery_location_name}</TableCell>
                <TableCell>{order.mix_type}</TableCell>
                <TableCell>{order.quantity_m3}m³</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[order.status]}>
                    {order.status === 'new' ? t('new')
                      : order.status === 'assigned' ? t('assigned')
                      : order.status === 'in_progress' ? t('inProgress')
                      : order.status === 'delivered' ? t('delivered')
                      : order.status === 'cancelled' ? t('cancelled')
                      : order.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {order.assigned_truck_plate || '—'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                  {order.scheduled_time ? format(new Date(order.scheduled_time), 'MMM d, HH:mm') : '—'}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs">
                  {(() => {
                    const comp = compensations.find(c => c.order_id === order.id);
                    if (!comp) return <span className="text-muted-foreground">—</span>;
                    return (
                      <span className={`font-semibold ${comp.is_overridden ? 'text-amber-600' : 'text-emerald-600'}`}>
                        ${comp.final_amount?.toFixed(2)}
                        {comp.is_overridden && <span className="text-[9px] ml-1 opacity-70">adj.</span>}
                      </span>
                    );
                  })()}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewOrderModal open={showNew} onClose={() => setShowNew(false)} companies={companies} locations={locations} existingOrders={orders} trucks={trucks} drivers={drivers} driverGroups={driverGroups} onBroadcastOrder={(order) => setBroadcastOrder(order)} onRefresh={refresh} />
      <OrderDetailModal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} trucks={trucks} drivers={drivers} driverGroups={driverGroups} onBroadcastOrder={(order) => setBroadcastOrder(order)} onRefresh={refresh} />
      <BroadcastModal open={!!broadcastOrder} onClose={() => setBroadcastOrder(null)} order={broadcastOrder} drivers={drivers} trucks={trucks} driverGroups={driverGroups} onAssigned={refresh} />
    </div>
  );
}