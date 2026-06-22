import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Users, X, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subDays, startOfMonth, format } from 'date-fns';

const PRESETS = [
  { key: '7d', labelKey: 'last7Days', getFrom: () => format(subDays(new Date(), 7), 'yyyy-MM-dd') },
  { key: '30d', labelKey: 'last30Days', getFrom: () => format(subDays(new Date(), 30), 'yyyy-MM-dd') },
  { key: '90d', labelKey: 'last90Days', getFrom: () => format(subDays(new Date(), 90), 'yyyy-MM-dd') },
  { key: 'month', labelKey: 'thisMonth', getFrom: () => format(startOfMonth(new Date()), 'yyyy-MM-dd') },
  { key: 'all', labelKey: 'allTime', getFrom: () => null },
];

export default function ReportFilters({ filters, onChange, companies, drivers }) {
  const { t } = useI18n();

  const applyPreset = (preset) => {
    onChange({
      ...filters,
      dateFrom: preset.getFrom(),
      dateTo: preset.key === 'all' ? null : format(new Date(), 'yyyy-MM-dd'),
      _preset: preset.key,
    });
  };

  const clearAll = () => {
    onChange({ dateFrom: null, dateTo: null, companyId: 'all', driverId: 'all', _preset: 'all' });
  };

  const hasActiveFilters =
    filters.dateFrom || filters.dateTo || filters.companyId !== 'all' || filters.driverId !== 'all';

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mr-1">
          <CalendarDays className="w-4 h-4" />
          {t('quickRanges')}:
        </div>
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            variant={filters._preset === p.key ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => applyPreset(p)}
          >
            {t(p.labelKey)}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {t('from')}
          </label>
          <Input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || null, _preset: 'custom' })}
            className="h-9 w-[150px] text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {t('to')}
          </label>
          <Input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || null, _preset: 'custom' })}
            className="h-9 w-[150px] text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="w-3 h-3" /> {t('company')}
          </label>
          <Select
            value={filters.companyId}
            onValueChange={(v) => onChange({ ...filters, companyId: v })}
          >
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCompanies')}</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" /> {t('driver')}
          </label>
          <Select
            value={filters.driverId}
            onValueChange={(v) => onChange({ ...filters, driverId: v })}
          >
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allDrivers')}</SelectItem>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-xs gap-1" onClick={clearAll}>
            <X className="w-3.5 h-3.5" /> {t('clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
}