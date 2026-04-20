import React from 'react';
import { Loader2, Sparkles, Wrench, ArrowUpCircle } from 'lucide-react';
import type { IReleaseNote } from '../../types/release.types';

const categoryConfig = {
  NOVIDADE: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Sparkles size={14} className="text-emerald-600" />, label: 'Novidade' },
  MELHORIA: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <ArrowUpCircle size={14} className="text-blue-600" />, label: 'Melhoria' },
  FIX: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <Wrench size={14} className="text-rose-600" />, label: 'Correção' }
};

interface ReleaseListProps {
  notes: IReleaseNote[];
  isLoading: boolean;
}

export default function ReleaseList({ notes, isLoading }: ReleaseListProps) {
  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>;
  }

  if (notes.length === 0) {
    return <p className="text-slate-500 text-center py-8">Nenhuma novidade registrada ainda.</p>;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {notes.map((note) => {
        const config = categoryConfig[note.categoria];
        return (
          <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
                  {config.icon} {config.label}
                </span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">v {note.versao}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{note.titulo}</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{note.descricao}</p>
          </div>
        );
      })}
    </div>
  );
}