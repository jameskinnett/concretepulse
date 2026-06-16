import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Package, Truck, Clock, MapPin, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { format } from 'date-fns';
import CompensationCalculator from './CompensationCalculator';

const statusColorMap = {
  new: 'bg-primary/10 text-primary border-primary/20',
  assigned: 'bg-blue-500/10 text-blue-600 border-blue-200',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-200',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  cancelled: 'bg-red-500/10 text-red-600 border-red-200',
};

const statusLabel = { new: 'New', assigned: 'Assigned', in_progress: 'In Progress', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function OrderDetailModal({ open, onClose, order, trucks, drivers, onRefresh }) {
  const { t } = useI18n();
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [saving, setSaving] = useState(false);

  if (!order) return null;

  const availableTrucks = trucks.filter(tr => tr.status === 'available');
  const availableDrivers = drivers.filter(dr => dr.availability === 'available');
  const assignedDriver = drivers.find(d => d.id === order.assigned_driver_id);
  const estimatedKm = Math.round(10 + Math.random() * 35);

  const handleAssign = async () => {
    const truck = trucks.find(tr => tr.id === selectedTruck);
    const driver = drivers.find(dr => dr.id === selectedDriver);
    if (!truck || !driver) return toast.error('Select both truck and driver');
    setSaving(true);
    await base44.entities.Order.update(order.id, {
      status: 'assigned',
      assigned_truck_id: truck.id,
      assigned_truck_plate: truck.plate,
      assigned_driver_id: driver.id,
      assigned_driver_name: driver.name,
    });
    await base44.entities.Truck.update(truck.id, { status: 'loading', current_driver_id: driver.id, current_driver_name: driver.name });
    await base44.entities.Driver.update(driver.id, { availability: 'on_route' });
    toast.success('Order assigned!');
    setSaving(false);
    onRefresh();
    onClose();
  };

  const handleStartDelivery = async () => {
    setSaving(true);
    await base44.entities.Order.update(order.id, { status: 'in_progress', departure_time: new Date().toISOString() });
    if (order.assigned_truck_id) {
      await base44.entities.Truck.update(order.assigned_truck_id, { status: 'in_transit' });
    }
    toast.success('Delivery started!');
    setSaving(false);
    onRefresh();
    onClose();
  };

  const handleMarkDelivered = async (compData) => {
    setSaving(true);
    const completionTime = new Date().toISOString();
    const distanceKm = compData.distanceKm || estimatedKm;
    await base44.entities.Order.update(order.id, { status: 'delivered', completion_time: completionTime, distance_km: distanceKm });
    if (order.assigned_truck_id) {
      await base44.entities.Truck.update(order.assigned_truck_id, { status: 'available', current_driver_id: '', current_driver_name: '' });
    }
    if (order.assigned_driver_id) {
      await base44.entities.Driver.update(order.assigned_driver_id, { availability: 'available' });
      await base44.entities.Compensation.create({
        order_id: order.id,
        order_number: order.order_number,
        driver_id: order.assigned_driver_id,
        driver_name: order.assigned_driver_name,
        time_hours: compData.timeHours,
        orders_count: 1,
        distance_km: distanceKm,
        primary_rate: compData.primaryRate,
        secondary_rate: compData.secondaryRate,
        calculated_amount: Math.round(compData.calculatedAmount * 100) / 100,
        final_amount: Math.round(compData.finalAmount * 100) / 100,
        is_overridden: compData.isOverridden,
        override_note: compData.overrideNote || '',
        calculation_method: compData.calculationMethod,
      });
    }
    toast.success('Delivered! Compensation saved.');
    setSaving(false);
    onRefresh();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package className="w-5 h-5 text-primary" />
            {order.order_number}
            <Badge className={`${statusColorMap[order.status]} border ml-1`}>
              {statusLabel[order.status] || order.status}
            </Badge>
            {order.priority === 'urgent' && (
              <Badge variant="destructive" className="gap-1 ml-0.5">
                <AlertTriangle className="w-3 h-3" /> Urgent
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm bg-muted/40 rounded-xl p-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('company')}</div>
              <div className="font-semibold">{order.company_name}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('location')}</div>
              <div className="font-semibold truncate">{order.delivery_location_name}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('mixType')}</div>
              <div className="font-semibold">{order.mix_type} kg/cm²</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('quantity')}</div>
              <div className="font-semibold">{order.quantity_m3} m³</div>
            </div>
            {order.scheduled_time && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('scheduledTime')}</div>
                <div className="font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(order.scheduled_time), 'MMM d, HH:mm')}
                </div>
              </div>
            )}
            {order.assigned_driver_name && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Driver</div>
                <div className="font-semibold">{order.assigned_driver_name}</div>
              </div>
            )}
            {order.assigned_truck_plate && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Truck</div>
                <div className="font-semibold flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {order.assigned_truck_plate}
                </div>
              </div>
            )}
            {order.delivery_address && (
              <div className="col-span-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Address</div>
                <div className="text-xs text-muted-foreground flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {order.delivery_address}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions by status */}
          {order.status === 'new' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" /> Assign Truck & Driver
              </h4>
              <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('selectTruck')} />
                </SelectTrigger>
                <SelectContent>
                  {availableTrucks.map(tr => (
                    <SelectItem key={tr.id} value={tr.id}>
                      {tr.truck_id} — {tr.plate} ({tr.capacity_m3} m³)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('selectDriver')} />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.map(dr => (
                    <SelectItem key={dr.id} value={dr.id}>
                      {dr.name} ({dr.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssign}
                disabled={saving || !selectedTruck || !selectedDriver}
                className="w-full h-12 text-sm font-semibold gap-2"
              >
                <Truck className="w-4 h-4" /> Assign to Truck & Driver
              </Button>
            </div>
          )}

          {order.status === 'assigned' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Truck is loading. Ready to depart?</p>
              <Button
                onClick={handleStartDelivery}
                disabled={saving}
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold gap-2"
              >
                <ArrowRight className="w-4 h-4" /> Start Delivery
              </Button>
            </div>
          )}

          {order.status === 'in_progress' && (
            <CompensationCalculator
              order={order}
              driver={assignedDriver}
              distanceKm={String(estimatedKm)}
              onMarkDelivered={handleMarkDelivered}
              saving={saving}
            />
          )}

          {order.status === 'delivered' && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-300">
              <Zap className="w-4 h-4" />
              Order completed. Compensation recorded.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}