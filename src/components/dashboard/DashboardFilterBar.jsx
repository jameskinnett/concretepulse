import React from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Orders' },
  { value: 'active', label: 'Active', statuses: ['new', 'assigned', 'in_progress'] },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CHIP_STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delivered', label: 'Delivered' },
];

export default function DashboardFilterBar({ filters, onChange, trucks, companies, orders }) {
  const hasActiveFilters = filters.status !== 'all' || filters.truckId !== '' || filters.companyId !== '';

  const clearAll = () => onChange({ status: 'all', truckId: '', companyId: '' });

  // Trucks that have at least one order
  const trucksWithOrders = trucks.filter(tr =>
    orders.some(o => o.assigned_truck_id === tr.id)
  );

  // Count per chip status
  const countFor = (chip) => {
    if (chip === 'all') return orders.length;
    if (chip === 'active') return orders.filter(o => ['new', 'assigned', 'in_progress'].includes(o.status)).length;
    return orders.filter(o => o.status === chip).length;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
      <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5">
        {CHIP_STATUSES.map(chip => (
          <button
            key={chip.value}
            onClick={() => onChange({ ...filters, status: chip.value })}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
              filters.status === chip.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {chip.label}
            <span className={cn(
              'rounded-full text-[10px] px-1 min-w-[16px] text-center',
              filters.status === chip.value ? 'bg-white/20' : 'bg-background'
            )}>
              {countFor(chip.value)}
            </span>
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border hidden sm:block" />

      {/* Truck filter */}
      <Select value={filters.truckId || '__all__'} onValueChange={v => onChange({ ...filters, truckId: v === '__all__' ? '' : v })}>
        <SelectTrigger className="h-8 text-xs w-36 border-dashed">
          <SelectValue placeholder="All Trucks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Trucks</SelectItem>
          {trucksWithOrders.map(tr => (
            <SelectItem key={tr.id} value={tr.id}>
              {tr.truck_id} · {tr.plate}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Company filter */}
      <Select value={filters.companyId || '__all__'} onValueChange={v => onChange({ ...filters, companyId: v === '__all__' ? '' : v })}>
        <SelectTrigger className="h-8 text-xs w-40 border-dashed">
          <SelectValue placeholder="All Companies" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Companies</SelectItem>
          {companies.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 gap-1 text-xs text-muted-foreground ml-auto">
          <X className="w-3 h-3" /> Clear
        </Button>
      )}
    </div>
  );
}