import React from 'react';
import { Loader2, Sparkles, Wrench, ArrowUpCircle } from 'lucide-react';
import type { IReleaseNote } from '../../types/release.types';

const categoryConfig = {
  NOVIDADE: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <Sparkles size={14} className="text-emerald-600 shrink-0" />, label: 'Novidade' },
  MELHORIA: { color: 'bg-theme-accent/10 text-theme-accent border-theme-accent/20', icon: <ArrowUpCircle size={14} className="text-theme-accent shrink-0" />, label: 'Melhoria' },
  FIX: { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: <Wrench size={14} className="text-rose-600 shrink-0" />, label: 'Correção' }
};

interface ReleaseListProps {
  notes: IReleaseNote[];
  isLoading: boolean;
}

export default function ReleaseList({ notes, isLoading }: ReleaseListProps) {
  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-theme-accent animate-spin" /></div>;
  }

  if (notes.length === 0) {
    return <p className="text-theme-muted text-center py-8">Nenhuma novidade registrada ainda.</p>;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {notes.map((note) => {
        const config = categoryConfig[note.categoria];
        return (
          <div key={note.id} className="bg-theme-panel border border-theme-border rounded-shape-lg p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-theme-accent/50 transition-all">
            
            {/* Responsividade: flex-col no mobile para a data não atropelar as tags */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
                  {config.icon} {config.label}
                </span>
                <span className="text-xs font-bold text-theme-muted bg-theme-base px-2 py-1 rounded">
                  v {note.versao}
                </span>
              </div>
              <span className="text-xs text-theme-muted font-medium self-start sm:self-auto ml-1 sm:ml-0">
                {new Date(note.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-theme-text mb-2 leading-tight">
              {note.titulo}
            </h3>
            <p className="text-sm text-theme-text/80 leading-relaxed whitespace-pre-wrap wrap-break-word">
              {note.descricao}
            </p>
          </div>
        );
      })}
    </div>
  );
}