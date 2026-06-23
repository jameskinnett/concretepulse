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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const creditColors = {
  approved: 'bg-emerald-500/10 text-emerald-600',
  pending: 'bg-amber-500/10 text-amber-600',
  suspended: 'bg-red-500/10 text-red-600',
  cod: 'bg-blue-500/10 text-blue-600',
};

const defaultForm = { name: '', contact_name: '', contact_phone: '', contact_email: '', billing_contact_name: '', billing_contact_phone: '', billing_contact_email: '', credit_status: 'pending', credit_limit: '', notes: '' };

export default function Companies() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: () => base44.entities.Company.list() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['companies'] });

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, contact_name: c.contact_name || '', contact_phone: c.contact_phone || '', contact_email: c.contact_email || '', billing_contact_name: c.billing_contact_name || '', billing_contact_phone: c.billing_contact_phone || '', billing_contact_email: c.billing_contact_email || '', credit_status: c.credit_status || 'pending', credit_limit: c.credit_limit || '', notes: c.notes || '' });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    const data = { ...form, credit_limit: form.credit_limit ? parseFloat(form.credit_limit) : null };
    if (editing) {
      await base44.entities.Company.update(editing.id, data);
      toast.success('Updated');
    } else {
      await base44.entities.Company.create(data);
      toast.success('Created');
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.Company.delete(id);
    toast.success('Deleted');
    refresh();
  };

  const filtered = useMemo(() => companies.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase())), [companies, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          {t('companies')}
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
              <TableHead className="hidden md:table-cell">{t('contactName')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('phone')}</TableHead>
              <TableHead>{t('creditStatus')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('creditLimit')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{c.contact_name || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{c.contact_phone || '—'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={creditColors[c.credit_status]}>{t(c.credit_status)}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{c.credit_limit ? `$${c.credit_limit.toLocaleString()}` : '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
            <DialogTitle>{editing ? t('edit') : t('addNew')} {t('company')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">{t('name')} *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label className="text-xs">{t('contactName')}</Label><Input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">{t('phone')}</Label><Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
              <div><Label className="text-xs">{t('email')}</Label><Input value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{t('creditStatus')}</Label>
                <Select value={form.credit_status} onValueChange={v => setForm({...form, credit_status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['approved','pending','suspended','cod'].map(s => <SelectItem key={s} value={s}>{t(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">{t('creditLimit')}</Label><Input type="number" value={form.credit_limit} onChange={e => setForm({...form, credit_limit: e.target.value})} placeholder="$" /></div>
            </div>
            <div className="border-t border-border pt-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('billingInfo')}</Label>
            </div>
            <div><Label className="text-xs">{t('billingContact')}</Label><Input value={form.billing_contact_name} onChange={e => setForm({...form, billing_contact_name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">{t('billingPhone')}</Label><Input value={form.billing_contact_phone} onChange={e => setForm({...form, billing_contact_phone: e.target.value})} /></div>
              <div><Label className="text-xs">{t('billingEmail')}</Label><Input value={form.billing_contact_email} onChange={e => setForm({...form, billing_contact_email: e.target.value})} /></div>
            </div>
            <div><Label className="text-xs">{t('notes')}</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>
            <Button onClick={handleSave} className="w-full">{t('save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}