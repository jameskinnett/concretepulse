import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from '@/lib/i18n';

const pinIcon = L.divIcon({
  className: '',
  html: '<div style="background: hsl(16, 94%, 69%); width: 22px; height: 22px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function ClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 0.8 });
  }, [position]);
  return null;
}

export default function MapPicker({ lat, lng, onChange }) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const position = (lat && lng) ? [lat, lng] : null;
  const defaultCenter = [8.9824, -79.5199]; // Panama City

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=pa`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        onChange({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } catch (e) {
      // ignore
    }
    setSearching(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder={t('searchAddress')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
            className="text-xs pl-8 h-9"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-3 h-9 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="rounded-lg overflow-hidden border border-border" style={{ height: '260px' }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <ClickHandler onClick={(latlng) => onChange({ lat: parseFloat(latlng.lat.toFixed(6)), lng: parseFloat(latlng.lng.toFixed(6)) })} />
          {position && <Marker position={position} icon={pinIcon} />}
          <FlyTo position={position} />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {position ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : t('setLocationOnMap')}
      </p>
    </div>
  );
}