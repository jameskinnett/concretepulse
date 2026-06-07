import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const availColors = {
  available: 'bg-emerald-500/10 text-emerald-600',
  on_route: 'bg-amber-500/10 text-amber-600',
  off_duty: 'bg-gray-500/10 text-gray-600',
  vacation: 'bg-purple-500/10 text-purple-600',
};

const defaultForm = { name: '', cedula: '', phone: '', type: 'employee', availability: 'available', rate_per_hour: '', rate_per_order: '', rate_per_km: '', secondary_rate_multiplier: 1.5, license_expiry: '' };

export default function Drivers() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => base44.entities.Driver.list() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['drivers'] });

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name: d.name, cedula: d.cedula, phone: d.phone, type: d.type, availability: d.availability,
      rate_per_hour: d.rate_per_hour || '', rate_per_order: d.rate_per_order || '', rate_per_km: d.rate_per_km || '',
      secondary_rate_multiplier: d.secondary_rate_multiplier || 1.5, license_expiry: d.license_expiry || '',
    });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.cedula || !form.phone) return toast.error('Fill required fields');
    const data = {
      ...form,
      rate_per_hour: form.rate_per_hour ? parseFloat(form.rate_per_hour) : null,
      rate_per_order: form.rate_per_order ? parseFloat(form.rate_per_order) : null,
      rate_per_km: form.rate_per_km ? parseFloat(form.rate_per_km) : null,
      secondary_rate_multiplier: parseFloat(form.secondary_rate_multiplier) || 1.5,
    };
    if (editing) {
      await base44.entities.Driver.update(editing.id, data);
      toast.success('Driver updated');
    } else {
      await base44.entities.Driver.create(data);
      toast.success('Driver created');
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.Driver.delete(id);
    toast.success('Deleted');
    refresh();
  };

  const filtered = drivers.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.cedula?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {t('drivers')} <span className="text-sm font-normal text-muted-foreground">({drivers.length})</span>
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
              <TableHead>{t('cedula')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('phone')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('availability')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('ratePerHour')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('ratePerOrder')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-muted-foreground">{d.cedula}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{d.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={d.type === 'employee' ? 'border-blue-300 text-blue-600' : 'border-orange-300 text-orange-600'}>
                    {t(d.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={availColors[d.availability]}>{d.availability}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">${d.rate_per_hour || '—'}</TableCell>
                <TableCell className="hidden lg:table-cell">${d.rate_per_order || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(d)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(d.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') : t('addNew')} {t('driver')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">{t('name')} *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">{t('cedula')} *</Label><Input value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} /></div>
              <div><Label className="text-xs">{t('phone')} *</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{t('type')}</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">{t('employee')}</SelectItem>
                    <SelectItem value="contractor">{t('contractor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t('availability')}</Label>
                <Select value={form.availability} onValueChange={v => setForm({...form, availability: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['available','on_route','off_duty','vacation'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">{t('ratePerHour')}</Label><Input type="number" value={form.rate_per_hour} onChange={e => setForm({...form, rate_per_hour: e.target.value})} placeholder="$" /></div>
              <div><Label className="text-xs">{t('ratePerOrder')}</Label><Input type="number" value={form.rate_per_order} onChange={e => setForm({...form, rate_per_order: e.target.value})} placeholder="$" /></div>
              <div><Label className="text-xs">{t('ratePerKm')}</Label><Input type="number" value={form.rate_per_km} onChange={e => setForm({...form, rate_per_km: e.target.value})} placeholder="$" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">{t('secondaryMultiplier')}</Label><Input type="number" step="0.1" value={form.secondary_rate_multiplier} onChange={e => setForm({...form, secondary_rate_multiplier: e.target.value})} /></div>
              <div><Label className="text-xs">License Expiry</Label><Input type="date" value={form.license_expiry} onChange={e => setForm({...form, license_expiry: e.target.value})} /></div>
            </div>
            <Button onClick={handleSave} className="w-full">{t('save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}