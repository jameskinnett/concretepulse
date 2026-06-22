import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function GuideSidebar({ sections, activeId, onNavigate, lang, setLang, labels }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">ConcretePulse</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = activeId === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => onNavigate(s.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{s[lang].title}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-2">
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
          <button
            onClick={() => setLang('en')}
            className={cn('flex-1 py-1.5 transition-colors', lang === 'en' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50')}
          >EN</button>
          <button
            onClick={() => setLang('es')}
            className={cn('flex-1 py-1.5 transition-colors', lang === 'es' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50')}
          >ES</button>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> {labels.backToApp}
          </Button>
        </Link>
      </div>
    </aside>
  );
}