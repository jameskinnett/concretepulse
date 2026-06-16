import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, CheckCheck, Clock, Trophy, Zap, HelpCircle } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { toast } from 'sonner';

const DRIVER_NAMES = [
  'Miguel Rodríguez', 'José Hernández', 'Diego López', 'Fernando Vega',
  'Esteban Rios', 'Gabriel Peña', 'Ramón Torres', 'Carlos Martínez',
];

const DRIVER_RESPONSES = [
  'SÍ', 'YES', 'Si, acepto', 'Voy', 'Confirmed', 'Ok jefe', 'Acepto 👍', 'Sí señor',
];

function WhatsAppBubble({ message, sender, time, isSystem }) {
  return (
    <div className={`flex ${isSystem ? 'justify-center' : sender === 'Dispatch' ? 'justify-start' : 'justify-end'} mb-2`}>
      {isSystem ? (
        <span className="text-[10px] bg-black/10 dark:bg-white/10 rounded-full px-3 py-0.5 text-foreground/50">{message}</span>
      ) : (
        <div className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
          sender === 'Dispatch'
            ? 'bg-white dark:bg-zinc-800 rounded-tl-sm text-foreground'
            : 'bg-emerald-500 text-white rounded-tr-sm'
        }`}>
          {sender !== 'Dispatch' && (
            <div className="text-[10px] font-semibold mb-0.5 opacity-80">{sender}</div>
          )}
          <p className="text-xs whitespace-pre-line leading-relaxed">{message}</p>
          <div className={`text-[9px] mt-1 flex items-center gap-1 justify-end ${
            sender === 'Dispatch' ? 'text-muted-foreground' : 'text-white/70'
          }`}>
            {time}
            {sender !== 'Dispatch' && <CheckCheck className="w-3 h-3" />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BroadcastModal({ open, onClose, order }) {
  const { t, lang } = useI18n();
  const [phase, setPhase] = useState('preview'); // preview | broadcasting | racing | won
  const [messages, setMessages] = useState([]);
  const [winner, setWinner] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!open) {
      setPhase('preview');
      setMessages([]);
      setWinner(null);
      setCountdown(null);
    }
  }, [open]);

  if (!order) return null;

  const now = new Date();
  const timeStr = order.scheduled_time
    ? new Date(order.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'ASAP';

  const broadcastText = lang === 'es'
    ? `📋 *Nueva Entrega de Concreto*\n\n🏗️ Empresa: ${order.company_name}\n📍 Lugar: ${order.delivery_location_name}\n🧱 Mezcla: ${order.mix_type} kg/cm²\n📦 Cantidad: ${order.quantity_m3} m³\n⏰ Hora: ${timeStr}\n\n🚨 *Primer conductor en responder gana el pedido*\nResponda: *SÍ*`
    : `📋 *New Concrete Delivery*\n\n🏗️ Company: ${order.company_name}\n📍 Location: ${order.delivery_location_name}\n🧱 Mix: ${order.mix_type} kg/cm²\n📦 Qty: ${order.quantity_m3} m³\n⏰ Time: ${timeStr}\n\n🚨 *First driver to reply wins the order*\nReply: *YES*`;

  const handleBroadcast = () => {
    const initTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPhase('broadcasting');
    setMessages([
      { id: 0, message: `${order.order_number} broadcast started`, sender: null, time: null, isSystem: true },
      { id: 1, message: broadcastText, sender: 'Dispatch', time: initTime, isSystem: false },
    ]);

    // Simulate drivers responding with random delays
    const shuffled = [...DRIVER_NAMES].sort(() => Math.random() - 0.5).slice(0, 5);
    let delay = 800;
    shuffled.forEach((name, idx) => {
      const responseDelay = delay + Math.random() * 2000;
      delay = responseDelay;
      setTimeout(() => {
        const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const response = DRIVER_RESPONSES[Math.floor(Math.random() * DRIVER_RESPONSES.length)];
        setMessages(prev => [...prev, {
          id: Date.now() + idx,
          message: response,
          sender: name,
          time: responseTime,
          isSystem: false,
        }]);
        if (idx === 0) {
          // First responder wins
          setWinner(name);
          setPhase('racing');
          setTimeout(() => {
            setPhase('won');
          }, 1500);
        }
      }, responseDelay);
    });
  };

  const handleConfirmWinner = () => {
    toast.success(`✅ ${winner} assigned to ${order.order_number}! Truck dispatched.`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            {t('broadcastAssignment')} — {order.order_number}
            <InfoTooltip
              text="This simulates sending the order to a WhatsApp driver group. The first driver to reply wins the order — no manual assignment needed."
              side="bottom"
            />
          </DialogTitle>
        </DialogHeader>

        {/* WhatsApp group chat UI */}
        <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900 bg-[#e5ddd5] dark:bg-zinc-900">
          {/* Group header */}
          <div className="bg-[#128c7e] text-white px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">ConcretePulse Drivers 🚛</div>
              <div className="text-[10px] opacity-75">30 conductores • First responder wins</div>
            </div>
            {phase === 'broadcasting' && (
              <div className="ml-auto flex items-center gap-1 text-[10px] bg-white/20 rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                Live
              </div>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[220px] max-h-[320px]">
            {phase === 'preview' && (
              <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-emerald-400/50" />
                <p className="text-xs text-muted-foreground">Press "Send to Group" to broadcast this order to all 30 drivers</p>
              </div>
            )}
            {messages.map(msg => (
              <WhatsAppBubble key={msg.id} {...msg} />
            ))}
            {phase === 'won' && winner && (
              <div className="flex justify-center mt-2">
                <div className="bg-emerald-500 text-white rounded-2xl px-4 py-2 text-center shadow-lg">
                  <Trophy className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-bold">🏆 {winner}</div>
                  <div className="text-[10px] opacity-90">First responder — Order won!</div>
                </div>
              </div>
            )}
          </div>

          {/* Message preview box */}
          {phase === 'preview' && (
            <div className="p-3 border-t border-emerald-200/50 dark:border-emerald-900/50 flex-shrink-0">
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-sm">
                <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{broadcastText}</p>
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                Sending to ~30 drivers • Grupo ConcretePulse
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        {phase === 'racing' && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">First responder detected! Locking order…</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11">
            {t('cancel')}
          </Button>
          {phase === 'preview' && (
            <Button onClick={handleBroadcast} className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Send className="w-4 h-4" />
              Send to Group
            </Button>
          )}
          {phase === 'won' && winner && (
            <Button onClick={handleConfirmWinner} className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Trophy className="w-4 h-4" />
              Confirm {winner.split(' ')[0]}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}