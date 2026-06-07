import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function BroadcastModal({ open, onClose, order }) {
  const { t } = useI18n();
  if (!order) return null;

  const message = t('broadcastMsg', {
    company: order.company_name || 'N/A',
    location: order.delivery_location_name || 'N/A',
    mix: order.mix_type || 'N/A',
    qty: order.quantity_m3 || 'N/A',
    time: order.scheduled_time ? new Date(order.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP',
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            {t('broadcastAssignment')}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">ConcretePulse Dispatch</div>
              <div className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">WhatsApp Business</div>
            </div>
          </div>
          <div className="bg-white dark:bg-card rounded-lg p-3 text-sm whitespace-pre-line text-foreground shadow-sm">
            {message}
          </div>
          <div className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 mt-2 text-right">
            Sending to 30 drivers...
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
          <Button 
            onClick={() => { toast.success(t('broadcastAssignment') + ' sent!'); onClose(); }}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
          >
            <Send className="w-4 h-4" />
            {t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}