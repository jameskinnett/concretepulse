import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Package, Truck, Users, Clock, MapPin, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const statusColorMap = {
  new: 'bg-primary/10 text-primary',
  assigned: 'bg-blue-500/10 text-blue-600',
  in_progress: 'bg-amber-500/10 text-amber-600',
  delivered: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
};

export default function OrderDetailModal({ open, onClose, order, trucks, drivers, onRefresh }) {
  const { t } = useI18n();
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [compOverride, setCompOverride] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [saving, setSaving] = useState(false);

  if (!order) return null;

  const availableTrucks = trucks.filter(tr => tr.status === 'available');
  const availableDrivers = drivers.filter(dr => dr.availability === 'available');

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

  const handleMarkDelivered = async () => {
    setSaving(true);
    const completionTime = new Date().toISOString();
    const distanceKm = Math.round(10 + Math.random() * 40);
    await base44.entities.Order.update(order.id, { status: 'delivered', completion_time: completionTime, distance_km: distanceKm });
    if (order.assigned_truck_id) {
      await base44.entities.Truck.update(order.assigned_truck_id, { status: 'available', current_driver_id: '', current_driver_name: '' });
    }
    if (order.assigned_driver_id) {
      await base44.entities.Driver.update(order.assigned_driver_id, { availability: 'available' });
      const driver = drivers.find(d => d.id === order.assigned_driver_id);
      if (driver) {
        const timeHours = 1 + Math.random() * 3;
        const primaryRate = driver.rate_per_order || driver.rate_per_hour || 25;
        const secondaryRate = primaryRate * (driver.secondary_rate_multiplier || 1.5);
        const calcAmount = driver.rate_per_order ? primaryRate : primaryRate * timeHours;
        const finalAmount = compOverride ? parseFloat(compOverride) : calcAmount;
        await base44.entities.Compensation.create({
          order_id: order.id,
          order_number: order.order_number,
          driver_id: driver.id,
          driver_name: driver.name,
          time_hours: Math.round(timeHours * 100) / 100,
          orders_count: 1,
          distance_km: distanceKm,
          primary_rate: primaryRate,
          secondary_rate: secondaryRate,
          calculated_amount: Math.round(calcAmount * 100) / 100,
          final_amount: Math.round(finalAmount * 100) / 100,
          is_overridden: !!compOverride,
          override_note: overrideNote || '',
          calculation_method: driver.rate_per_order ? 'per_order' : 'hourly',
        });
      }
    }
    toast.success('Delivered! Compensation calculated.');
    setSaving(false);
    onRefresh();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {order.order_number} — {t('orderDetail')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={statusColorMap[order.status]}>{order.status}</Badge>
            {order.priority === 'urgent' && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" /> {t('urgent')}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-muted-foreground text-xs">{t('company')}</Label>
              <p className="font-medium">{order.company_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">{t('location')}</Label>
              <p className="font-medium">{order.delivery_location_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">{t('mixType')}</Label>
              <p className="font-medium">{order.mix_type} kg/cm²</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">{t('quantity')}</Label>
              <p className="font-medium">{order.quantity_m3} m³</p>
            </div>
            {order.scheduled_time && (
              <div>
                <Label className="text-muted-foreground text-xs">{t('scheduledTime')}</Label>
                <p className="font-medium">{format(new Date(order.scheduled_time), 'MMM d, HH:mm')}</p>
              </div>
            )}
            {order.assigned_truck_plate && (
              <div>
                <Label className="text-muted-foreground text-xs">{t('truck')}</Label>
                <p className="font-medium">{order.assigned_truck_plate}</p>
              </div>
            )}
            {order.assigned_driver_name && (
              <div>
                <Label className="text-muted-foreground text-xs">{t('driver')}</Label>
                <p className="font-medium">{order.assigned_driver_name}</p>
              </div>
            )}
          </div>

          <Separator />

          {order.status === 'new' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4" /> {t('assignTruck')}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                  <SelectTrigger><SelectValue placeholder={t('selectTruck')} /></SelectTrigger>
                  <SelectContent>
                    {availableTrucks.map(tr => (
                      <SelectItem key={tr.id} value={tr.id}>{tr.truck_id} — {tr.plate} ({tr.capacity_m3}m³)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger><SelectValue placeholder={t('selectDriver')} /></SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map(dr => (
                      <SelectItem key={dr.id} value={dr.id}>{dr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssign} disabled={saving} className="w-full">{t('assignTruck')}</Button>
            </div>
          )}

          {order.status === 'assigned' && (
            <Button onClick={handleStartDelivery} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {t('startDelivery')}
            </Button>
          )}

          {order.status === 'in_progress' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" /> {t('compensation')}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t('overrideCompensation')}</Label>
                  <Input type="number" placeholder="$ Override" value={compOverride} onChange={e => setCompOverride(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">{t('overrideNote')}</Label>
                  <Input placeholder="Note..." value={overrideNote} onChange={e => setOverrideNote(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleMarkDelivered} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                <CheckCircle2 className="w-4 h-4 mr-2" /> {t('markDelivered')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}