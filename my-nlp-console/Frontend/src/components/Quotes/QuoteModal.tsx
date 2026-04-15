import React from 'react';
import { X, Save, Check, Loader2, Info, Edit3, MessageSquare } from 'lucide-react';
import { useQuoteModal } from './useQuoteModal';
import { MODULOS_DISPONIVEIS, formatCurrency } from './utils';
import type { IQuote } from './types';

interface QuoteModalProps {
  quote?: IQuote | null;
  onClose: () => void;
}

export default function QuoteModal({ quote, onClose }: QuoteModalProps) {
  const {
    formData, setFormData, selectedModulos, handleToggleModulo,
    valorTabela, valorFinal, isNegotiating, setIsNegotiating,
    isLoading, handleSave, isReadOnly
  } = useQuoteModal(quote ?? null, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#f8f9f9] w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {quote ? `Orçamento #${quote.id.split('-')[0]}` : 'Novo Orçamento'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Configure os módulos e negocie os valores.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) - Dividido em 2 colunas no desktop */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Cliente e Anotações */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Cliente</h3>
              {/* Inputs simplificados para o exemplo */}
              <input 
                disabled={isReadOnly}
                value={formData.nomeCliente}
                onChange={e => setFormData({...formData, nomeCliente: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Razão Social / Fantasia"
              />
              <input 
                disabled={isReadOnly}
                value={formData.cnpj}
                onChange={e => setFormData({...formData, cnpj: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                placeholder="CNPJ"
              />
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare size={16} /> Briefing & Alinhamento
              </h3>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Interesses Principais</label>
                <textarea 
                  disabled={isReadOnly}
                  value={formData.interesses}
                  onChange={e => setFormData({...formData, interesses: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none h-20 resize-none"
                  placeholder="Ex: Cliente reclamou muito do emissor atual..."
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Observações Internas</label>
                <textarea 
                  disabled={isReadOnly}
                  value={formData.observacoes}
                  onChange={e => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none h-20 resize-none"
                  placeholder="Anotações sobre a negociação..."
                />
              </div>
            </section>
          </div>

          {/* Coluna Direita: Módulos e Negociação */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Composição do Orçamento</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-extrabold text-slate-500 border-b">
                    <tr>
                      <th className="p-3 w-12 text-center">Sel.</th>
                      <th className="p-3">Módulo</th>
                      <th className="p-3 text-right">Valor Base</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MODULOS_DISPONIVEIS.map(mod => (
                      <tr 
                        key={mod.id}
                        onClick={() => !isReadOnly && handleToggleModulo(mod.id)}
                        className={`cursor-pointer ${selectedModulos.includes(mod.id) ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3 flex justify-center">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedModulos.includes(mod.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                            {selectedModulos.includes(mod.id) && <Check size={12} className="text-white" />}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-900 text-sm">{mod.nome}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700">{formatCurrency(mod.valorBase)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        {/* Footer: Negociação Financeira e Salvar */}
        <div className="p-6 bg-white border-t border-slate-200 flex flex-col md:flex-row justify-between items-center z-10 gap-4">
          <div className="flex gap-6 w-full md:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100 items-center">
            
            {/* Seletor de Plano */}
            <div>
              <p className="text-[10px] uppercase font-extrabold text-slate-400">Plano</p>
              <select 
                disabled={isReadOnly}
                value={formData.plano} 
                onChange={e => setFormData({...formData, plano: e.target.value as 'MENSAL'|'ANUAL'})}
                className="bg-transparent font-black text-slate-900 outline-none"
              >
                <option value="MENSAL">Mensal</option>
                <option value="ANUAL">Anual (10% Desc.)</option>
              </select>
            </div>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            {/* Valor Tabela */}
            <div>
              <p className="text-[10px] uppercase font-extrabold text-slate-400">Valor de Tabela</p>
              <p className={`text-lg font-mono font-bold ${isNegotiating ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                {formatCurrency(valorTabela)}
              </p>
            </div>

            <div className="w-px h-8 bg-slate-200"></div>

            {/* Negociação */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[10px] uppercase font-extrabold text-amber-600 flex items-center gap-1">
                  Valor Fechado <Edit3 size={10} className="cursor-pointer" onClick={() => !isReadOnly && setIsNegotiating(!isNegotiating)} />
                </p>
                {isNegotiating ? (
                  <input 
                    type="number"
                    disabled={isReadOnly}
                    value={formData.valorNegociado}
                    onChange={e => setFormData({...formData, valorNegociado: Number(e.target.value)})}
                    className="w-28 bg-white border border-amber-300 rounded focus:ring-2 focus:ring-amber-500/20 outline-none p-1 text-sm font-bold font-mono text-amber-700"
                  />
                ) : (
                  <p className="text-xl font-black text-blue-600 font-mono tracking-tight">{formatCurrency(valorFinal)}</p>
                )}
              </div>
            </div>
          </div>
          
          {!isReadOnly && (
            <button 
              onClick={handleSave}
              disabled={isLoading || selectedModulos.length === 0 || !formData.nomeCliente}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Orçamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}