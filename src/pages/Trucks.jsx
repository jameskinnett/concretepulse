import React, { useState, useMemo } from 'react';
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
import { Plus, Truck as TruckIcon, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusColors = {
  available: 'bg-emerald-500/10 text-emerald-600',
  in_transit: 'bg-amber-500/10 text-amber-600',
  loading: 'bg-blue-500/10 text-blue-600',
  maintenance: 'bg-red-500/10 text-red-600',
  off_duty: 'bg-gray-500/10 text-gray-600',
};

export default function Trucks() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ truck_id: '', plate: '', capacity_m3: 8, status: 'available', model: '', year: '' });

  const { data: trucks = [] } = useQuery({ queryKey: ['trucks'], queryFn: () => base44.entities.Truck.list() });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['trucks'] });

  const openEdit = (tr) => {
    setEditing(tr);
    setForm({ truck_id: tr.truck_id, plate: tr.plate, capacity_m3: tr.capacity_m3, status: tr.status, model: tr.model || '', year: tr.year || '' });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ truck_id: '', plate: '', capacity_m3: 8, status: 'available', model: '', year: '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.truck_id || !form.plate) return toast.error('Fill required fields');
    if (editing) {
      await base44.entities.Truck.update(editing.id, form);
      toast.success('Truck updated');
    } else {
      await base44.entities.Truck.create(form);
      toast.success('Truck created');
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.Truck.delete(id);
    toast.success('Truck deleted');
    refresh();
  };

  const filtered = useMemo(() => trucks.filter(tr =>
    !search || tr.truck_id?.toLowerCase().includes(search.toLowerCase()) || tr.plate?.toLowerCase().includes(search.toLowerCase())
  ), [trucks, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <TruckIcon className="w-5 h-5 text-primary" />
          {t('trucks')} <span className="text-sm font-normal text-muted-foreground">({trucks.length})</span>
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
              <TableHead>ID</TableHead>
              <TableHead>{t('plate')}</TableHead>
              <TableHead>{t('capacity')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('driver')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('model')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(tr => (
              <TableRow key={tr.id}>
                <TableCell className="font-semibold">{tr.truck_id}</TableCell>
                <TableCell>{tr.plate}</TableCell>
                <TableCell>{tr.capacity_m3}m³</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[tr.status]}>{tr.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{tr.current_driver_name || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{tr.model} {tr.year}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tr)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(tr.id)}>
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') : t('addNew')} {t('truck')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Truck ID *</Label><Input value={form.truck_id} onChange={e => setForm({...form, truck_id: e.target.value})} placeholder="T-01" /></div>
            <div><Label className="text-xs">{t('plate')} *</Label><Input value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} /></div>
            <div><Label className="text-xs">{t('capacity')}</Label><Input type="number" value={form.capacity_m3} onChange={e => setForm({...form, capacity_m3: parseFloat(e.target.value)})} /></div>
            <div>
              <Label className="text-xs">{t('status')}</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['available','in_transit','loading','maintenance','off_duty'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">{t('model')}</Label><Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
              <div><Label className="text-xs">{t('year')}</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} /></div>
            </div>
            <Button onClick={handleSave} className="w-full">{t('save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}