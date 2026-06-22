import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

const CANCEL_REASONS = ['clientCancelled', 'weatherIssue', 'materialIssue', 'otherReason'];

export default function CancelOrderModal({ open, onClose, order, onConfirm }) {
  const { t } = useI18n();
  const [reason, setReason] = useState('clientCancelled');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!order) return null;

  const canCancel = ['new', 'assigned', 'in_progress'].includes(order.status);
  const isInProgress = order.status === 'in_progress';

  const handleConfirm = async () => {
    setSaving(true);
    await onConfirm({ reason: t(reason), notes });
    setSaving(false);
    setNotes('');
    setReason('clientCancelled');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t('cancelOrder')} — {order.order_number}
          </DialogTitle>
        </DialogHeader>
        {!canCancel ? (
          <div className="text-sm text-muted-foreground py-4">
            {t('cannotCancelDelivered')}
          </div>
        ) : (
          <div className="space-y-3">
            {isInProgress && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Truck may already be loaded or in transit. Cancelling will free up the truck and driver.</span>
              </div>
            )}
            <div>
              <Label className="text-xs">{t('cancelReason')} *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CANCEL_REASONS.map(r => <SelectItem key={r} value={r}>{t(r)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional details..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
              <Button variant="destructive" onClick={handleConfirm} disabled={saving} className="flex-1">{t('confirmCancel')}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}