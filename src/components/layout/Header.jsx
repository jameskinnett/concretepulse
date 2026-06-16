import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { Menu, Sun, Moon, LogOut, Truck, ShieldCheck } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header({ onMenuClick }) {
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { role } = useRole();

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: hamburger + logo on mobile */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-muted-foreground hover:text-foreground p-1">
            <Menu className="w-5 h-5" />
          </button>
          {/* Logo — visible on all sizes in header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30 flex-shrink-0">
              <Truck className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold tracking-tight leading-none text-foreground">ConcretePulse</div>
              <div className="text-[9px] text-muted-foreground leading-none mt-0.5">by Conversely.net</div>
            </div>
          </div>
          {/* Page title separator */}
          <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
            <span className="text-border">|</span>
            <span className="text-xs font-medium">{t('dispatch')}</span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1">
          {/* Language toggle — prominent pill */}
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground"
            title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
          >
            <span className="text-base leading-none">{lang === 'en' ? '🇺🇸' : '🇵🇦'}</span>
            <span>{lang === 'en' ? 'EN' : 'ES'}</span>
            <span className="text-muted-foreground">→</span>
            <span>{lang === 'en' ? 'ES' : 'EN'}</span>
          </button>

          <NotificationBell />

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-xs pl-2 pr-3">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
                    {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-28 truncate">{user.full_name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1">
                  <div>{user.email}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="capitalize font-semibold text-foreground">{role}</span>
                  </div>
                </div>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}