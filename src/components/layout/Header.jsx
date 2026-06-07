import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { Menu, Sun, Moon, Globe, LogOut } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-muted-foreground hover:text-foreground">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold text-foreground hidden sm:block">
          {t('dispatch')}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          className="gap-1.5 text-xs font-medium"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === 'en' ? 'ES' : 'EN'}
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8">
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-24 truncate">{user.full_name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-3.5 h-3.5 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}