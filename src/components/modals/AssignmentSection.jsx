import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Radio, Users } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';

export default function AssignmentSection({
  trucks,
  drivers,
  driverGroups,
  selectedTruck,
  selectedDriver,
  selectedGroupId,
  assignMode,
  onTruckChange,
  onDriverChange,
  onGroupChange,
  onAssignModeChange,
}) {
  const { t } = useI18n();
  const availableTrucks = trucks.filter(tr => tr.status === 'available');
  const availableDrivers = drivers.filter(dr => dr.availability === 'available');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border overflow-hidden flex-1">
          <button
            type="button"
            onClick={() => onAssignModeChange('manual')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
              assignMode === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> {t('manualAssign')}
          </button>
          <button
            type="button"
            onClick={() => onAssignModeChange('broadcast')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
              assignMode === 'broadcast' ? 'bg-emerald-500 text-white' : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> {t('broadcast')}
          </button>
        </div>
        <InfoTooltip
          text={assignMode === 'manual'
            ? "Manually pick a specific truck and driver for this order."
            : "Broadcast to a driver group. First driver to reply YES gets the order automatically."}
          side="top"
        />
      </div>

      {assignMode === 'manual' ? (
        <>
          <Select value={selectedTruck} onValueChange={onTruckChange}>
            <SelectTrigger className="h-11"><SelectValue placeholder={t('selectTruck')} /></SelectTrigger>
            <SelectContent>
              {availableTrucks.map(tr => (
                <SelectItem key={tr.id} value={tr.id}>{tr.truck_id} — {tr.plate} ({tr.capacity_m3} m³)</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDriver} onValueChange={onDriverChange}>
            <SelectTrigger className="h-11"><SelectValue placeholder={t('selectDriver')} /></SelectTrigger>
            <SelectContent>
              {availableDrivers.map(dr => (
                <SelectItem key={dr.id} value={dr.id}>{dr.name} ({dr.type})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : (
        <div className="space-y-2">
          {driverGroups.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">{t('noGroupsYet')}</p>
          ) : (
            <Select value={selectedGroupId} onValueChange={onGroupChange}>
              <SelectTrigger className="h-11"><SelectValue placeholder={t('selectGroup')} /></SelectTrigger>
              <SelectContent>
                {driverGroups.map(g => (
                  <SelectItem key={g.id} value={g.id}>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> {g.name}
                      <span className="text-muted-foreground text-[10px]">({g.driver_ids?.length || 0})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}