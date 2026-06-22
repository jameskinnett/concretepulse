import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, CheckCheck, Clock, Trophy, Zap, Users, AlertCircle, Radio } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNotifications } from '@/lib/NotificationContext';

const DRIVER_RESPONSES = ['SÍ', 'YES', 'Si, acepto', 'Voy', 'Confirmed', 'Ok jefe', 'Acepto 👍', 'Sí señor'];

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
          {sender !== 'Dispatch' && <div className="text-[10px] font-semibold mb-0.5 opacity-80">{sender}</div>}
          <p className="text-xs whitespace-pre-line leading-relaxed">{message}</p>
          <div className={`text-[9px] mt-1 flex items-center gap-1 justify-end ${sender === 'Dispatch' ? 'text-muted-foreground' : 'text-white/70'}`}>
            {time}
            {sender !== 'Dispatch' && <CheckCheck className="w-3 h-3" />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BroadcastModal({ open, onClose, order, drivers = [], trucks = [], driverGroups = [], onAssigned }) {
  const { t, lang } = useI18n();
  const { addNotification } = useNotifications();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [phase, setPhase] = useState('select'); // select | broadcasting | racing | won | timeout | escalated | noresponse
  const [messages, setMessages] = useState([]);
  const [winner, setWinner] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const timersRef = useRef([]);

  useEffect(() => {
    if (!open) {
      setPhase('select');
      setMessages([]);
      setWinner(null);
      setSelectedGroupId('');
      setCountdown(15);
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current = [];
    }
  }, [open]);

  useEffect(() => {
    return () => { timersRef.current.forEach(id => clearTimeout(id)); };
  }, []);

  if (!order) return null;

  const now = new Date();
  const timeStr = order.scheduled_time
    ? new Date(order.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'ASAP';

  const broadcastText = lang === 'es'
    ? `📋 *Nueva Entrega de Concreto*\n\n🏗️ Empresa: ${order.company_name}\n📍 Lugar: ${order.delivery_location_name}\n🧱 Mezcla: ${order.mix_type} kg/cm²\n📦 Cantidad: ${order.quantity_m3} m³\n⏰ Hora: ${timeStr}\n\n🚨 *Primer conductor en responder gana el pedido*\nResponda: *SÍ*`
    : `📋 *New Concrete Delivery*\n\n🏗️ Company: ${order.company_name}\n📍 Location: ${order.delivery_location_name}\n🧱 Mix: ${order.mix_type} kg/cm²\n📦 Qty: ${order.quantity_m3} m³\n⏰ Time: ${timeStr}\n\n🚨 *First driver to reply wins the order*\nReply: *YES*`;

  const getGroupDrivers = () => {
    const group = driverGroups.find(g => g.id === selectedGroupId);
    if (!group || !group.driver_ids?.length) return [];
    return drivers.filter(d => group.driver_ids.includes(d.id) && d.availability === 'available');
  };

  const getAllAvailableDrivers = () => drivers.filter(d => d.availability === 'available');

  const startBroadcast = (driverList, isEscalation = false) => {
    if (driverList.length === 0) {
      setPhase('noresponse');
      return;
    }

    const initTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPhase('broadcasting');
    setMessages(prev => [...prev,
      { id: Date.now(), message: isEscalation ? 'Escalating to ALL available drivers...' : `${order.order_number} broadcast to ${driverList.length} drivers`, sender: null, time: null, isSystem: true },
      { id: Date.now() + 1, message: broadcastText, sender: 'Dispatch', time: initTime, isSystem: false },
    ]);

    // Simulate 2-4 drivers responding
    const responders = [...driverList].sort(() => Math.random() - 0.5).slice(0, Math.min(4, driverList.length));
    let delay = 1500;

    responders.forEach((driver, idx) => {
      const responseDelay = delay + Math.random() * 2000;
      delay = responseDelay;
      const timerId = setTimeout(() => {
        const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const response = DRIVER_RESPONSES[Math.floor(Math.random() * DRIVER_RESPONSES.length)];
        setMessages(prev => [...prev, {
          id: Date.now() + idx,
          message: response,
          sender: driver.name,
          time: responseTime,
          isSystem: false,
        }]);
        if (idx === 0) {
          setWinner(driver);
          setPhase('racing');
          const winTimer = setTimeout(() => setPhase('won'), 1500);
          timersRef.current.push(winTimer);
        }
      }, responseDelay);
      timersRef.current.push(timerId);
    });

    // Timeout: if no winner after 10 seconds, escalate or show no response
    const timeoutId = setTimeout(() => {
      setWinner(prev => {
        if (!prev) {
          if (!isEscalation) {
            // Escalate to all drivers
            setPhase('escalated');
            const allDrivers = getAllAvailableDrivers();
            const escalateTimer = setTimeout(() => startBroadcast(allDrivers, true), 2000);
            timersRef.current.push(escalateTimer);
          } else {
            setPhase('noresponse');
          }
        }
        return prev;
      });
    }, 10000);
    timersRef.current.push(timeoutId);
  };

  const handleBroadcast = () => {
    const groupDrivers = getGroupDrivers();
    setCountdown(15);
    startBroadcast(groupDrivers, false);
  };

  const handleConfirmWinner = async () => {
    if (!winner) return;
    const availableTruck = trucks.find(tr => tr.status === 'available');
    if (!availableTruck) {
      toast.error('No available trucks to assign!');
      return;
    }
    await base44.entities.Order.update(order.id, {
      status: 'assigned',
      assigned_truck_id: availableTruck.id,
      assigned_truck_plate: availableTruck.plate,
      assigned_driver_id: winner.id,
      assigned_driver_name: winner.name,
    });
    await base44.entities.Truck.update(availableTruck.id, { status: 'loading', current_driver_id: winner.id, current_driver_name: winner.name });
    await base44.entities.Driver.update(winner.id, { availability: 'on_route' });
    await addNotification({
      title: `Order Assigned: ${order.order_number}`,
      message: `${winner.name} won broadcast · Truck ${availableTruck.truck_id} · ${order.company_name}`,
      type: 'order_assigned',
      order_id: order.id,
      order_number: order.order_number,
      target_roles: ['admin', 'dispatcher'],
    });
    toast.success(`✅ ${winner.name} assigned to ${order.order_number}!`);
    if (onAssigned) onAssigned();
    onClose();
  };

  const groupDriverCount = selectedGroupId ? getGroupDrivers().length : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            {t('broadcastAssignment')} — {order.order_number}
            <InfoTooltip
              text="Broadcasts the order to a driver group via WhatsApp. First driver to reply YES wins the order. If no response in 15 min, escalates to all available drivers."
              side="bottom"
            />
          </DialogTitle>
        </DialogHeader>

        {/* Group selector */}
        {phase === 'select' && (
          <div className="space-y-3 p-2">
            {driverGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t('noGroupsYet')}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t('selectGroup')}</label>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
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
                </div>
                {selectedGroupId && (
                  <div className="text-xs bg-muted/40 rounded-lg p-2.5 text-muted-foreground">
                    {groupDriverCount} available driver{groupDriverCount !== 1 ? 's' : ''} in this group
                  </div>
                )}
                <Button
                  onClick={handleBroadcast}
                  disabled={!selectedGroupId || groupDriverCount === 0}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                >
                  <Send className="w-4 h-4" /> Send to Group
                </Button>
              </>
            )}
          </div>
        )}

        {/* WhatsApp chat UI */}
        {phase !== 'select' && (
          <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900 bg-[#e5ddd5] dark:bg-zinc-900">
            <div className="bg-[#128c7e] text-white px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {driverGroups.find(g => g.id === selectedGroupId)?.name || 'All Drivers'} 🚛
                </div>
                <div className="text-[10px] opacity-75">
                  {groupDriverCount || getAllAvailableDrivers().length} drivers • First responder wins
                </div>
              </div>
              {phase === 'broadcasting' && (
                <div className="ml-auto flex items-center gap-1 text-[10px] bg-white/20 rounded-full px-2 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  Live
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[200px] max-h-[300px]">
              {messages.map(msg => <WhatsAppBubble key={msg.id} {...msg} />)}
              {phase === 'won' && winner && (
                <div className="flex justify-center mt-2">
                  <div className="bg-emerald-500 text-white rounded-2xl px-4 py-2 text-center shadow-lg">
                    <Trophy className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-bold">🏆 {winner.name}</div>
                    <div className="text-[10px] opacity-90">First responder — Order won!</div>
                  </div>
                </div>
              )}
              {phase === 'escalated' && (
                <div className="flex justify-center mt-2">
                  <div className="bg-amber-500 text-white rounded-2xl px-4 py-2 text-center shadow-lg">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-bold">{t('escalateToAll')}</div>
                  </div>
                </div>
              )}
              {phase === 'noresponse' && (
                <div className="flex justify-center mt-2">
                  <div className="bg-red-500 text-white rounded-2xl px-4 py-2 text-center shadow-lg">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-bold">{t('noResponse')}</div>
                    <div className="text-[10px] opacity-90">Try assigning manually</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
          {phase === 'won' && winner && (
            <Button onClick={handleConfirmWinner} className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Trophy className="w-4 h-4" />
              Confirm {winner.name.split(' ')[0]}
            </Button>
          )}
          {phase === 'noresponse' && (
            <Button onClick={onClose} className="flex-1 h-11 gap-2">
              <Radio className="w-4 h-4" /> Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}