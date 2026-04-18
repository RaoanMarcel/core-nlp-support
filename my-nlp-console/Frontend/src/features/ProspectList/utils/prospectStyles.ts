export const getCardStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-white border-transparent hover:border-blue-300 hover:shadow-sm hover:ring-1 hover:ring-blue-100 cursor-pointer';
    case 'EM_ATENDIMENTO': return 'bg-amber-50/40 border-amber-200 opacity-90 cursor-not-allowed';
    case 'RETORNAR': return 'bg-purple-50/40 border-purple-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    case 'POSSIBILIDADE': return 'bg-blue-50/40 border-blue-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    case 'APROVADO': return 'bg-emerald-50/40 border-emerald-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    case 'REPROVADO': return 'bg-rose-50/40 border-rose-200 opacity-80 hover:opacity-100 hover:shadow-sm transition-all cursor-pointer';
    default: return 'bg-white border-transparent';
  }
};

export const getBadgeStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'EM_ATENDIMENTO': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
    case 'RETORNAR': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'POSSIBILIDADE': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'APROVADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REPROVADO': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};