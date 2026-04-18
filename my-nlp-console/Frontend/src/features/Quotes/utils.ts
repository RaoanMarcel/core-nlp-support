import type { IModulo } from '../Quotes/types';

export const MODULOS_DISPONIVEIS: IModulo[] = [
  { id: 'NFE', nome: 'NF-e', descricao: 'Emissão de Notas Fiscais', valorBase: 89.90 },
  { id: 'NFCE', nome: 'NFC-e', descricao: 'Venda Rápida de Balcão', valorBase: 45.00 },
  { id: 'FINANCEIRO', nome: 'Financeiro Pro', descricao: 'Contas, DRE e Fluxo', valorBase: 150.00 },
  { id: 'ESTOQUE', nome: 'Estoque Avançado', descricao: 'Lotes, Grade e Kardex', valorBase: 110.00 },
  { id: 'MDFE', nome: 'MDF-e / CTe', descricao: 'Manifesto e Transporte', valorBase: 95.00 },
];

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