import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, MapPin, Pencil, Trash2, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { computeLocationStats, formatDuration } from '@/hooks/useLocationStats';

const defaultForm = { name: '', company_id: '', address: '', lat: '', lng: '', special_instructions: '' };

export default function Locations() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: () => base44.entities.DeliveryLocation.list() });
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: () => base44.entities.Company.list() });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => base44.entities.Order.list('-completion_time', 500) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['locations'] });

  const locationStats = computeLocationStats(orders);

  const openEdit = (l) => {
    setEditing(l);
    setForm({ name: l.name, company_id: l.company_id, address: l.address || '', lat: l.lat || '', lng: l.lng || '', special_instructions: l.special_instructions || '' });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.company_id) return toast.error('Fill required fields');
    const company = companies.find(c => c.id === form.company_id);
    const data = { ...form, company_name: company?.name || '', lat: form.lat ? parseFloat(form.lat) : null, lng: form.lng ? parseFloat(form.lng) : null };
    if (editing) {
      await base44.entities.DeliveryLocation.update(editing.id, data);
      toast.success('Updated');
    } else {
      await base44.entities.DeliveryLocation.create(data);
      toast.success('Created');
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.DeliveryLocation.delete(id);
    toast.success('Deleted');
    refresh();
  };

  const filtered = locations.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.address?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {t('locations')}
        </h1>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> {t('addNew')}</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t('search')} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('company')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('address')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('coordinates')}</TableHead>
              <TableHead className="hidden md:table-cell"><Clock className="w-3.5 h-3.5 inline mr-1" />Avg Delivery</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell className="text-muted-foreground">{l.company_name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground max-w-48 truncate">{l.address}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {l.lat && l.lng ? `${l.lat}, ${l.lng}` : '—'}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs">
                  {(() => {
                    const s = locationStats.get(l.id);
                    if (!s) return <span className="text-muted-foreground">No data</span>;
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground">{formatDuration(s.avgMinutes)}</span>
                        <span className="text-muted-foreground">{s.count} deliveries · {formatDuration(s.minMinutes)}–{formatDuration(s.maxMinutes)}</span>
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(l)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') : t('addNew')} {t('location')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">{t('name')} *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div>
              <Label className="text-xs">{t('company')} *</Label>
              <Select value={form.company_id} onValueChange={v => setForm({...form, company_id: v})}>
                <SelectTrigger><SelectValue placeholder={t('selectCompany')} /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">{t('address')}</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Lat</Label><Input type="number" step="any" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} /></div>
              <div><Label className="text-xs">Lng</Label><Input type="number" step="any" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} /></div>
            </div>
            <div><Label className="text-xs">{t('specialInstructions')}</Label><Textarea value={form.special_instructions} onChange={e => setForm({...form, special_instructions: e.target.value})} rows={2} /></div>
            <Button onClick={handleSave} className="w-full">{t('save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}