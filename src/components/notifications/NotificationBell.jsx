import React, { useState } from 'react';
import { Bell, CheckCheck, Package, Truck, CheckCircle2, AlertTriangle, MessageCircle, Info } from 'lucide-react';
import { useNotifications } from '@/lib/NotificationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  order_new:         { icon: Package,       color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
  order_assigned:    { icon: Truck,         color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950/30' },
  order_in_progress: { icon: Truck,         color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
  order_delivered:   { icon: CheckCircle2,  color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  order_cancelled:   { icon: AlertTriangle, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-950/30' },
  driver_comm:       { icon: MessageCircle, color: 'text-primary',     bg: 'bg-primary/5' },
  system:            { icon: Info,          color: 'text-gray-500',    bg: 'bg-gray-50 dark:bg-gray-950/30' },
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative w-9 h-9"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
              {notifications.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No notifications yet
                </div>
              )}
              {notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); }}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/60 transition-colors",
                      !n.is_read && "bg-primary/5"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg mt-0.5 flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn("text-xs font-semibold truncate", !n.is_read && "text-foreground")}>{n.title}</span>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      {n.created_date && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}