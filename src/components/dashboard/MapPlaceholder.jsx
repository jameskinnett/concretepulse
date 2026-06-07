import React from 'react';
import { useI18n } from '@/lib/i18n';
import { MapPin, Truck } from 'lucide-react';

export default function MapPlaceholder({ trucks }) {
  const { t } = useI18n();
  const activeTrucks = trucks.filter(tr => tr.status === 'in_transit' || tr.status === 'loading');

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{t('activeMap')}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{activeTrucks.length} active</span>
      </div>
      <div className="relative h-48 bg-gradient-to-br from-emerald-900/10 to-blue-900/10 flex items-center justify-center">
        {/* Panama map placeholder */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path d="M50,100 Q100,50 150,80 T250,70 Q300,60 350,100 Q300,140 250,130 T150,120 Q100,150 50,100Z" 
              fill="currentColor" className="text-primary" />
          </svg>
        </div>
        
        {activeTrucks.length > 0 ? (
          <div className="relative z-10 flex flex-wrap gap-3 px-4">
            {activeTrucks.slice(0, 6).map((tr, i) => (
              <div key={tr.id} className="flex items-center gap-1.5 bg-card/90 backdrop-blur rounded-lg px-2.5 py-1.5 shadow-sm border border-border">
                <Truck className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium">{tr.truck_id}</span>
              </div>
            ))}
            {activeTrucks.length > 6 && (
              <div className="flex items-center bg-card/90 backdrop-blur rounded-lg px-2.5 py-1.5 shadow-sm border border-border">
                <span className="text-xs text-muted-foreground">+{activeTrucks.length - 6} more</span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 text-center">
            <Truck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No active trucks</p>
          </div>
        )}
      </div>
    </div>
  );
}