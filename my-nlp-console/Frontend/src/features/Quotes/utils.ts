import type { IModulo } from '../Quotes/types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const getQuoteStatusBadge = (status: string) => {
  switch (status) {
    case 'RASCUNHO': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'EM_NEGOCIACAO': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'APROVADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REJEITADO': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};