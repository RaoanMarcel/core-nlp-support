// utils.ts

/**
 * Converte um valor bruto de módulos em um array de strings válido.
 */
export const parseModulos = (modulosRaw: unknown): string[] => {
  if (!modulosRaw) return [];
  if (Array.isArray(modulosRaw)) return modulosRaw;
  if (typeof modulosRaw === 'string') {
    return modulosRaw.split(',').map(m => m.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Formata uma string de data para o padrão brasileiro (DD/MM/YYYY HH:mm).
 */
export const formatarData = (dataStr?: string): string => {
  if (!dataStr) return '';
  return new Date(dataStr).toLocaleString('pt-BR', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
};

/**
 * Retorna classes utilitárias do Tailwind baseadas no status/situação cadastral.
 */
export const getSituacaoColor = (status?: string): string => {
  if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
  
  const text = status.toLowerCase();
  
  if (text.includes('ativa')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  
  if (text.includes('baixa') || text.includes('inapta')) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  
  return 'bg-amber-50 text-amber-700 border-amber-200';
};