import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const MIX_TYPES = ['210', '245', '280', '315', '350', '380', '420'];

export default function NewOrderModal({ open, onClose, companies, locations, onRefresh, existingOrders }) {
  const { t } = useI18n();
  const [companyId, setCompanyId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [mixType, setMixType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredLocations = locations.filter(l => l.company_id === companyId);
  const selectedCompany = companies.find(c => c.id === companyId);
  const selectedLocation = locations.find(l => l.id === locationId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !locationId || !mixType || !quantity) {
      return toast.error('Fill all required fields');
    }
    setSaving(true);
    const orderNum = `ORD-${String((existingOrders?.length || 0) + 1).padStart(3, '0')}`;
    await base44.entities.Order.create({
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
    });
    toast.success('Order created!');
    setSaving(false);
    onRefresh();
    onClose();
    setCompanyId(''); setLocationId(''); setMixType(''); setQuantity(''); setScheduledTime(''); setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
                {filteredLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name} — {l.address}</SelectItem>)}
              </SelectContent>
            </Select>
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
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
            <Button type="submit" disabled={saving} className="flex-1">{t('create')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}