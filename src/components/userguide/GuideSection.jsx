import React from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function GuideSection({ section, lang, index }) {
  const Icon = section.icon;
  const content = section[lang];

  return (
    <section id={section.id} className="scroll-mt-20 py-12 border-b border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', section.color || 'bg-orange-500')}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wide mb-1">
            {String(index + 1).padStart(2, '0')} · {content.tagline}
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{content.title}</h2>
        </div>
      </div>

      <p className="text-gray-600 leading-relaxed mb-6 max-w-3xl">{content.description}</p>

      {section.image && (
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-8 max-w-3xl">
          <img src={section.image} alt={content.title} className="w-full h-auto" />
        </div>
      )}

      <div className="space-y-4 max-w-3xl">
        {content.steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-900">{step.title} — </span>
              <span className="text-sm text-gray-600">{step.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {content.tips && (
        <div className="mt-6 flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-3xl">
          <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-sm text-amber-900">{lang === 'en' ? 'Tip' : 'Consejo'}: </span>
            <span className="text-sm text-amber-800">{content.tips}</span>
          </div>
        </div>
      )}
    </section>
  );
}