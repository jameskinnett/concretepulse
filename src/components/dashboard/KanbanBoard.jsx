import React from 'react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Clock, Truck, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const columnConfig = {
  new: { color: 'border-t-primary', icon: Clock, dotColor: 'bg-primary' },
  assigned: { color: 'border-t-blue-500', icon: Truck, dotColor: 'bg-blue-500' },
  in_progress: { color: 'border-t-amber-500', icon: ArrowRight, dotColor: 'bg-amber-500' },
  delivered: { color: 'border-t-emerald-500', icon: CheckCircle2, dotColor: 'bg-emerald-500' },
};

function OrderCard({ order, onClick }) {
  return (
    <button
      onClick={() => onClick(order)}
      className="w-full text-left bg-card border border-border rounded-lg p-3 hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-primary">{order.order_number}</span>
        {order.priority === 'urgent' && (
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
        )}
      </div>
      <div className="text-sm font-medium text-foreground truncate">{order.company_name}</div>
      <div className="text-xs text-muted-foreground mt-1 truncate">{order.delivery_location_name}</div>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {order.mix_type} kg/cm²
        </Badge>
        <span className="text-[10px] text-muted-foreground">{order.quantity_m3}m³</span>
      </div>
      {order.assigned_truck_plate && (
        <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
          <Truck className="w-3 h-3" />
          {order.assigned_truck_plate} • {order.assigned_driver_name}
        </div>
      )}
      {order.scheduled_time && (
        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(order.scheduled_time), 'HH:mm')}
        </div>
      )}
    </button>
  );
}

export default function KanbanBoard({ orders, onOrderClick }) {
  const { t } = useI18n();
  const columns = ['new', 'assigned', 'in_progress', 'delivered'];
  const columnLabels = { new: t('new'), assigned: t('assigned'), in_progress: t('inProgress'), delivered: t('delivered') };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map(col => {
        const config = columnConfig[col];
        const colOrders = orders.filter(o => o.status === col);
        return (
          <div key={col} className={cn("bg-muted/50 rounded-xl border-t-2 p-3 min-h-[300px]", config.color)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                <span className="text-sm font-semibold text-foreground">{columnLabels[col]}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full">
                {colOrders.length}
              </span>
            </div>
            <div className="space-y-2">
              {colOrders.map(order => (
                <OrderCard key={order.id} order={order} onClick={onOrderClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}