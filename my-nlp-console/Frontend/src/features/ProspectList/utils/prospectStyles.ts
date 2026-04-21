export const getCardStyle = (status: string) => {
  // Removi as transparências (/40) e o opacity-80
  // Troquei o tom 50 por 100 para a cor ficar mais presente
  switch (status) {
    case 'PENDENTE': 
      return 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer';
    
    case 'EM_ATENDIMENTO': 
      return 'bg-amber-100 border-amber-300 opacity-100 shadow-sm cursor-not-allowed';
    
    case 'RETORNAR': 
      return 'bg-purple-100 border-purple-300 opacity-100 hover:shadow-md transition-all cursor-pointer';
    
    case 'POSSIBILIDADE': 
      return 'bg-blue-100 border-blue-300 opacity-100 hover:shadow-md transition-all cursor-pointer';
    
    case 'APROVADO': 
      return 'bg-emerald-100 border-emerald-300 opacity-100 hover:shadow-md transition-all cursor-pointer';
    
    case 'REPROVADO': 
      return 'bg-rose-100 border-rose-300 opacity-100 hover:shadow-md transition-all cursor-pointer';
    
    default: 
      return 'bg-white border-slate-200';
  }
};

export const getBadgeStyle = (status: string) => {
  switch (status) {
    case 'PENDENTE': 
      return 'bg-slate-200 text-slate-700 border-slate-300';
    
    case 'EM_ATENDIMENTO': 
      return 'bg-amber-200 text-amber-800 border-amber-400 animate-pulse';
    
    case 'RETORNAR': 
      return 'bg-purple-200 text-purple-800 border-purple-400';
    
    case 'POSSIBILIDADE': 
      return 'bg-blue-200 text-blue-800 border-blue-400';
    
    case 'APROVADO': 
      return 'bg-emerald-200 text-emerald-800 border-emerald-400';
    
    case 'REPROVADO': 
      return 'bg-rose-200 text-rose-800 border-rose-400';
    
    default: 
      return 'bg-slate-200 text-slate-700 border-slate-300';
  }
};