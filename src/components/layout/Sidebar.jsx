import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import {
  LayoutDashboard, Package, Truck, Users, Building2,
  MapPin, X, BarChart2, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'orders', icon: Package, path: '/orders' },
  { key: 'trucks', icon: Truck, path: '/trucks' },
  { key: 'drivers', icon: Users, path: '/drivers' },
  { key: 'companies', icon: Building2, path: '/companies' },
  { key: 'locations', icon: MapPin, path: '/locations' },
  { key: 'reports', icon: BarChart2, path: '/reports', label: 'Reports' },
  { key: 'driverPerf', icon: TrendingUp, path: '/driver-performance', label: 'Driver Performance' },
];

export default function Sidebar({ open, onClose }) {
  const { t } = useI18n();
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-sidebar-foreground">ConcretePulse</h1>
                <p className="text-[10px] text-sidebar-foreground/50 -mt-0.5">by Conversely.net</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label || t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/40 text-center">
            v1.0 Prototype
          </div>
        </div>
      </aside>
    </>
  );
}