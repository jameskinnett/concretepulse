import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { ArrowLeft, Truck, Menu, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GUIDE_SECTIONS } from '@/lib/userGuideContent';
import GuideSidebar from '@/components/userguide/GuideSidebar';
import GuideSection from '@/components/userguide/GuideSection';

const LABELS = {
  en: { backToApp: 'Back to App', guideTitle: 'User Guide', guideSub: 'Learn every feature of ConcretePulse step by step', mobileNav: 'Sections' },
  es: { backToApp: 'Volver a la App', guideTitle: 'Guía de Usuario', guideSub: 'Aprenda cada función de ConcretePulse paso a paso', mobileNav: 'Secciones' },
};

export default function UserGuide() {
  const { lang, setLang } = useI18n();
  const [activeId, setActiveId] = useState(GUIDE_SECTIONS[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const labels = LABELS[lang] || LABELS.en;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    GUIDE_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-body flex">

      {/* Desktop Sidebar */}
      <GuideSidebar
        sections={GUIDE_SECTIONS}
        activeId={activeId}
        onNavigate={setActiveId}
        lang={lang}
        setLang={setLang}
        labels={labels}
      />

      <div className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">{labels.guideTitle}</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
              <button onClick={() => setLang('en')} className={cn('px-2 py-1.5', lang === 'en' ? 'bg-orange-500 text-white' : 'text-gray-500')}>EN</button>
              <button onClick={() => setLang('es')} className={cn('px-2 py-1.5', lang === 'es' ? 'bg-orange-500 text-white' : 'text-gray-500')}>ES</button>
            </div>
            <button onClick={() => setMobileNavOpen(v => !v)} className="p-2 rounded-md hover:bg-gray-100">
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3 grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
            {GUIDE_SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                    activeId === s.id ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s[lang].title}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Hero */}
        <div className="bg-gray-950 text-white px-6 py-12 text-center">
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs font-bold uppercase tracking-widest mb-3">
            {labels.guideTitle}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="text-white">Concrete</span><span className="text-orange-400">Pulse</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">{labels.guideSub}</p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6">
          {GUIDE_SECTIONS.map((s, i) => (
            <GuideSection key={s.id} section={s} lang={lang} index={i} />
          ))}
        </div>

        {/* Footer */}
        <footer className="bg-gray-950 text-gray-500 py-6 text-center text-xs">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <Truck className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-400 font-semibold">ConcretePulse</span>
          </div>
          <span>v2.0 · {labels.guideTitle} · © 2026</span>
        </footer>
      </div>
    </div>
  );
}