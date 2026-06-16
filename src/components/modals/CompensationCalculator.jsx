import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Clock, Package, MapPin, AlertCircle, CheckCircle2, Edit3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { useI18n } from '@/lib/i18n';

function RateRow({ icon: RowIcon, label, rate, hours, km, method, color }) {
  const Icon = RowIcon;
  let amount = 0;
  let detail = '';
  if (method === 'hourly') { amount = rate * (hours || 0); detail = `$${rate}/h × ${(hours || 0).toFixed(1)}h`; }
  if (method === 'per_order') { amount = rate; detail = `flat $${rate}/order`; }
  if (method === 'per_km') { amount = rate * (km || 0); detail = `$${rate}/km × ${(km || 0).toFixed(0)}km`; }
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${color}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
        <div className="min-w-0">
          <div className="text-xs font-semibold">{label}</div>
          <div className="text-[10px] text-muted-foreground">{detail}</div>
        </div>
      </div>
      <div className="text-sm font-bold">${amount.toFixed(2)}</div>
    </div>
  );
}

export default function CompensationCalculator({ order, driver, distanceKm, onMarkDelivered, saving }) {
  const { lang } = useI18n();
  const [timeHours, setTimeHours] = useState('2.0');
  const [overrideAmount, setOverrideAmount] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  const hours = parseFloat(timeHours) || 0;
  const km = parseFloat(distanceKm) || 0;

  const primaryRate = driver?.rate_per_order || driver?.rate_per_hour || 25;
  const ratePerKm = driver?.rate_per_km || 0;
  const secondaryMult = driver?.secondary_rate_multiplier || 1.5;

  const method = driver?.rate_per_order ? 'per_order' : 'hourly';

  const primaryAmount = useMemo(() => {
    if (method === 'per_order') return primaryRate;
    return primaryRate * hours;
  }, [method, primaryRate, hours]);

  const kmAmount = useMemo(() => ratePerKm * km, [ratePerKm, km]);

  const secondaryAmount = useMemo(() => {
    // Secondary = overtime/bonus, 20% of time above 3h
    const overtimeH = Math.max(0, hours - 3);
    if (method === 'hourly') return overtimeH * primaryRate * (secondaryMult - 1);
    return 0;
  }, [hours, method, primaryRate, secondaryMult]);

  const calculatedTotal = primaryAmount + kmAmount + secondaryAmount;
  const finalAmount = overrideAmount ? parseFloat(overrideAmount) : calculatedTotal;
  const isOverridden = !!overrideAmount && parseFloat(overrideAmount) !== calculatedTotal;

  const handleSubmit = () => {
    onMarkDelivered({
      timeHours: hours,
      distanceKm: km,
      primaryRate,
      secondaryRate: primaryRate * secondaryMult,
      calculatedAmount: calculatedTotal,
      finalAmount,
      isOverridden,
      overrideNote,
      calculationMethod: method === 'per_order' ? 'per_order' : km > 0 ? 'mixed' : 'hourly',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold">
          {lang === 'es' ? 'Calculadora de Compensación' : 'Compensation Calculator'}
        </h4>
        {driver && <Badge variant="outline" className="text-[10px]">{driver.type === 'contractor' ? (lang === 'es' ? 'Contratista' : 'Contractor') : (lang === 'es' ? 'Empleado' : 'Employee')}</Badge>}
        <InfoTooltip
          text="Rates are pulled from the driver's profile. Primary rate applies first; overtime bonus kicks in after 3 hours. Distance rate charges per km driven."
          side="top"
        />
      </div>

      {driver ? (
        <>
          {/* Input row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3" /> {lang === 'es' ? 'Tiempo (horas)' : 'Time (hours)'}
              </Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={timeHours}
                onChange={e => setTimeHours(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" /> {lang === 'es' ? 'Distancia (km)' : 'Distance (km)'}
              </Label>
              <Input
                type="number"
                value={distanceKm}
                readOnly
                className="h-9 bg-muted/50"
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5">
            <RateRow
              icon={method === 'per_order' ? Package : Clock}
              label={method === 'per_order' ? 'Per-Order Rate (Primary)' : 'Hourly Rate (Primary)'}
              rate={primaryRate}
              hours={hours}
              km={km}
              method={method}
              color="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"
            />
            {ratePerKm > 0 && (
              <RateRow
                icon={MapPin}
                label="Distance Rate"
                rate={ratePerKm}
                km={km}
                method="per_km"
                color="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20"
              />
            )}
            {secondaryAmount > 0 && (
              <RateRow
                icon={Clock}
                label={`Overtime Bonus (×${secondaryMult})`}
                rate={primaryRate * (secondaryMult - 1)}
                hours={Math.max(0, hours - 3)}
                method="hourly"
                color="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
              />
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between bg-muted/60 rounded-lg px-3 py-2.5">
            <span className="text-sm font-semibold">Calculated Total</span>
            <span className="text-lg font-bold text-primary">${calculatedTotal.toFixed(2)}</span>
          </div>

          {/* Override toggle */}
          <button
            onClick={() => setShowOverride(v => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            {showOverride
              ? (lang === 'es' ? 'Ocultar ajuste' : 'Hide override')
              : (lang === 'es' ? 'Ajustar monto manualmente' : 'Override amount manually')}
          </button>

          {showOverride && (
            <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {lang === 'es' ? 'Ajuste Manual' : 'Manual Override'}
                <InfoTooltip
                  text="Use this to adjust the final pay for special situations: difficult access, extra wait time, or agreed bonuses. The override is saved with a note in the compensation record."
                  side="top"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">{lang === 'es' ? 'Monto Ajustado ($)' : 'Override Amount ($)'}</Label>
                  <Input
                    type="number"
                    placeholder={`Default: $${calculatedTotal.toFixed(2)}`}
                    value={overrideAmount}
                    onChange={e => setOverrideAmount(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">{lang === 'es' ? 'Razón / Nota' : 'Reason / Note'}</Label>
                  <Input
                    placeholder={lang === 'es' ? 'Ej. Acceso difícil...' : 'e.g. Difficult access...'}
                    value={overrideNote}
                    onChange={e => setOverrideNote(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              {isOverridden && (
                <div className="flex items-center justify-between text-xs bg-amber-100 dark:bg-amber-900/40 rounded px-2 py-1">
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    {lang === 'es' ? 'Monto Final (ajustado)' : 'Final (overridden)'}
                  </span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">${finalAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {lang === 'es' ? `Marcar Entregado — Pagar $${finalAmount.toFixed(2)}` : `Mark Delivered — Pay $${finalAmount.toFixed(2)}`}
          </Button>
        </>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No driver assigned — cannot calculate compensation.
        </div>
      )}
    </div>
  );
}