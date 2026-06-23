import React, { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const defaultForm = { name: '', description: '', driver_ids: [] };

export default function DriverGroups() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: groups = [] } = useQuery({ queryKey: ['driverGroups'], queryFn: () => base44.entities.DriverGroup.list() });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => base44.entities.Driver.list() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['driverGroups'] });

  const openEdit = (g) => {
    setEditing(g);
    setForm({ name: g.name, description: g.description || '', driver_ids: g.driver_ids || [] });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };

  const toggleDriver = (driverId) => {
    setForm(prev => {
      const ids = prev.driver_ids || [];
      return {
        ...prev,
        driver_ids: ids.includes(driverId) ? ids.filter(id => id !== driverId) : [...ids, driverId],
      };
    });
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    const driverNames = (form.driver_ids || []).map(id => drivers.find(d => d.id === id)?.name).filter(Boolean);
    const data = { ...form, driver_names: driverNames };
    if (editing) {
      await base44.entities.DriverGroup.update(editing.id, data);
      toast.success('Updated');
    } else {
      await base44.entities.DriverGroup.create(data);
      toast.success('Created');
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.DriverGroup.delete(id);
    toast.success('Deleted');
    refresh();
  };

  const filtered = useMemo(() => groups.filter(g => !search || g.name?.toLowerCase().includes(search.toLowerCase())), [groups, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {t('driverGroups')}
        </h1>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> {t('addNew')}</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t('search')} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {groups.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm">{t('noGroupsYet')}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('groupName')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('groupDescription')}</TableHead>
                <TableHead>{t('driversInGroup')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(g => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{g.description || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{g.driver_ids?.length || 0} {t('drivers')}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(g)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(g.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') : t('addNew')} {t('driverGroups')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">{t('groupName')} *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label className="text-xs">{t('groupDescription')}</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div>
              <Label className="text-xs">{t('selectDrivers')}</Label>
              <div className="mt-1.5 space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-2">
                {drivers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">{t('noData')}</p>
                ) : drivers.map(d => (
                  <label key={d.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={form.driver_ids?.includes(d.id) || false}
                      onCheckedChange={() => toggleDriver(d.id)}
                    />
                    <span className="text-sm flex-1">{d.name}</span>
                    <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{form.driver_ids?.length || 0} {t('driversInGroup')}</p>
            </div>
            <Button onClick={handleSave} className="w-full">{t('save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}