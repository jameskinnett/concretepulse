import React from 'react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Clock, Truck, ArrowRight, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const columnConfig = {
  new: { color: 'border-t-primary', headerBg: 'bg-primary/5', icon: Clock, dotColor: 'bg-primary' },
  assigned: { color: 'border-t-blue-500', headerBg: 'bg-blue-500/5', icon: Truck, dotColor: 'bg-blue-500' },
  in_progress: { color: 'border-t-amber-500', headerBg: 'bg-amber-500/5', icon: ArrowRight, dotColor: 'bg-amber-500' },
  delivered: { color: 'border-t-emerald-500', headerBg: 'bg-emerald-500/5', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
};

const statusCardBorder = {
  new: 'hover:border-primary/40',
  assigned: 'hover:border-blue-400/40',
  in_progress: 'hover:border-amber-400/40 border-amber-200/50 dark:border-amber-900/30',
  delivered: 'hover:border-emerald-400/40',
};

function OrderCard({ order, onClick, selected, onToggleSelect }) {
  const isInProgress = order.status === 'in_progress';
  const isSelectable = order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <div
      className={cn(
        "relative w-full text-left bg-card border border-border rounded-xl p-3.5 hover:shadow-md transition-all duration-200 group",
        statusCardBorder[order.status] || '',
        isInProgress && 'ring-1 ring-amber-400/30',
        selected && 'ring-2 ring-emerald-500 border-emerald-400'
      )}
    >
      {isSelectable && (
        <div
          className="absolute top-2.5 right-2.5 z-10"
          onClick={e => { e.stopPropagation(); onToggleSelect(order.id); }}
        >
          <Checkbox
            checked={selected}
            className="h-4 w-4 border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
        </div>
      )}
      <button
        onClick={() => onClick(order)}
        className="w-full text-left active:scale-[0.98]"
      >
        <div className="flex items-center justify-between mb-2 pr-5">
          <span className="text-xs font-bold text-primary tracking-wide">{order.order_number}</span>
          <div className="flex items-center gap-1">
            {isInProgress && <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
            {order.priority === 'urgent' && (
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            )}
          </div>
        </div>
        <div className="text-sm font-semibold text-foreground truncate">{order.company_name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{order.delivery_location_name}</div>
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold">
            {order.mix_type} kg/cm²
          </Badge>
          <span className="text-[11px] font-medium text-muted-foreground">{order.quantity_m3} m³</span>
          {order.priority === 'urgent' && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">🚨 URGENT</Badge>
          )}
        </div>
        {order.assigned_truck_plate && (
          <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
            <Truck className="w-3 h-3" />
            {order.assigned_truck_plate} · {order.assigned_driver_name}
          </div>
        )}
        {order.scheduled_time && (
          <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(order.scheduled_time), 'HH:mm')}
          </div>
        )}
      </button>
    </div>
  );
}

export default function KanbanBoard({ orders, onOrderClick, selectedIds, onToggleSelect }) {
  const { t } = useI18n();
  const columns = ['new', 'assigned', 'in_progress', 'delivered'];
  const columnLabels = { new: t('new'), assigned: t('assigned'), in_progress: t('inProgress'), delivered: t('delivered') };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:grid-cols-2">
      {columns.map(col => {
        const config = columnConfig[col];
        const colOrders = orders.filter(o => o.status === col);
        const Icon = config.icon;
        return (
          <div key={col} className={cn("bg-muted/40 rounded-xl border-t-[3px] p-3 min-h-[280px]", config.color)}>
            <div className={cn("flex items-center justify-between mb-3 -mx-3 -mt-3 px-3 py-2.5 rounded-t-xl", config.headerBg)}>
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">{columnLabels[col]}</span>
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                colOrders.length > 0 ? 'bg-foreground/10 text-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {colOrders.length}
              </span>
            </div>
            <div className="space-y-2">
              {colOrders.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground/50 italic">Empty</div>
              )}
              {colOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={onOrderClick}
                  selected={selectedIds.has(order.id)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}