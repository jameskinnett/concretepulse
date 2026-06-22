import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Clock, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import { computeLocationStats, formatDuration } from '@/hooks/useLocationStats';
import AssignmentSection from './AssignmentSection';
import InfoTooltip from '@/components/ui/InfoTooltip';

const MIX_TYPES = ['210', '245', '280', '315', '350', '380', '420'];

export default function NewOrderModal({ open, onClose, companies, locations, onRefresh, existingOrders, orders = [], trucks = [], drivers = [], driverGroups = [], onBroadcastOrder }) {
  const { t } = useI18n();
  const [companyId, setCompanyId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [mixType, setMixType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [showAssignment, setShowAssignment] = useState(false);
  const [assignMode, setAssignMode] = useState('manual');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const filteredLocations = locations.filter(l => l.company_id === companyId);
  const selectedCompany = companies.find(c => c.id === companyId);
  const selectedLocation = locations.find(l => l.id === locationId);
  const locationStats = computeLocationStats(orders);
  const locStat = locationId ? locationStats.get(locationId) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !locationId || !mixType || !quantity) {
      return toast.error('Fill all required fields');
    }
    setSaving(true);
    const orderNum = `ORD-${String((existingOrders?.length || 0) + 1).padStart(3, '0')}`;

    let orderData = {
      order_number: orderNum,
      company_id: companyId,
      company_name: selectedCompany?.name || '',
      delivery_location_id: locationId,
      delivery_location_name: selectedLocation?.name || '',
      delivery_address: selectedLocation?.address || '',
      mix_type: mixType,
      quantity_m3: parseFloat(quantity),
      scheduled_time: scheduledTime || new Date().toISOString(),
      status: 'new',
      priority,
      notes,
    };

    if (showAssignment && assignMode === 'manual' && selectedTruck && selectedDriver) {
      const truck = trucks.find(tr => tr.id === selectedTruck);
      const driver = drivers.find(dr => dr.id === selectedDriver);
      orderData.status = 'assigned';
      orderData.assigned_truck_id = truck.id;
      orderData.assigned_truck_plate = truck.plate;
      orderData.assigned_driver_id = driver.id;
      orderData.assigned_driver_name = driver.name;
    }

    const newOrder = await base44.entities.Order.create(orderData);

    if (orderData.status === 'assigned') {
      const truck = trucks.find(tr => tr.id === selectedTruck);
      const driver = drivers.find(dr => dr.id === selectedDriver);
      await base44.entities.Truck.update(truck.id, { status: 'loading', current_driver_id: driver.id, current_driver_name: driver.name });
      await base44.entities.Driver.update(driver.id, { availability: 'on_route' });
      toast.success(`Order created & assigned to ${driver.name}!`);
    } else {
      toast.success('Order created!');
    }

    setSaving(false);
    onRefresh();

    if (showAssignment && assignMode === 'broadcast' && selectedGroupId && onBroadcastOrder) {
      onBroadcastOrder(newOrder);
    }

    onClose();
    setCompanyId(''); setLocationId(''); setMixType(''); setQuantity(''); setScheduledTime(''); setNotes('');
    setShowAssignment(false); setSelectedTruck(''); setSelectedDriver(''); setSelectedGroupId('');
  };

  const submitLabel = showAssignment && assignMode === 'broadcast'
    ? `${t('create')} & ${t('broadcast')}`
    : t('create');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            {t('newOrder')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs">{t('company')} *</Label>
            <Select value={companyId} onValueChange={v => { setCompanyId(v); setLocationId(''); }}>
              <SelectTrigger><SelectValue placeholder={t('selectCompany')} /></SelectTrigger>
              <SelectContent>
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t('location')} *</Label>
            <Select value={locationId} onValueChange={setLocationId} disabled={!companyId}>
              <SelectTrigger><SelectValue placeholder={t('selectLocation')} /></SelectTrigger>
              <SelectContent>
                {filteredLocations.map(l => {
                  const s = locationStats.get(l.id);
                  return (
                    <SelectItem key={l.id} value={l.id}>
                      <span>{l.name}</span>
                      {s && <span className="ml-2 text-muted-foreground text-xs">~{formatDuration(s.avgMinutes)}</span>}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {locStat && (
              <div className="mt-1.5 flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-1.5 text-blue-700 dark:text-blue-400">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Avg delivery: <strong>{formatDuration(locStat.avgMinutes)}</strong>
                  <span className="text-blue-500 ml-1">({formatDuration(locStat.minMinutes)}–{formatDuration(locStat.maxMinutes)} range, {locStat.count} past orders)</span>
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t('mixType')} *</Label>
              <Select value={mixType} onValueChange={setMixType}>
                <SelectTrigger><SelectValue placeholder={t('selectMix')} /></SelectTrigger>
                <SelectContent>
                  {MIX_TYPES.map(m => <SelectItem key={m} value={m}>{m} kg/cm²</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t('quantity')} *</Label>
              <Input type="number" step="0.5" min="0.5" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="m³" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t('scheduledTime')}</Label>
              <Input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('priority')}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t('normal')}</SelectItem>
                  <SelectItem value="urgent">{t('urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('notes')}</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Optional Assignment Section */}
          <div className="space-y-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setShowAssignment(!showAssignment)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              {showAssignment ? <><ChevronUp className="w-3 h-3" /> {t('leaveUnassigned')}</> : <><ChevronDown className="w-3 h-3" /> {t('assignNow')}</>}
            </button>
            {showAssignment && (
              <AssignmentSection
                trucks={trucks}
                drivers={drivers}
                driverGroups={driverGroups}
                selectedTruck={selectedTruck}
                selectedDriver={selectedDriver}
                selectedGroupId={selectedGroupId}
                assignMode={assignMode}
                onTruckChange={setSelectedTruck}
                onDriverChange={setSelectedDriver}
                onGroupChange={setSelectedGroupId}
                onAssignModeChange={setAssignMode}
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? '...' : submitLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}