import React from 'react';
import { 
  X, Building, Search, Phone, Mail, MapPin, 
  FileText, CheckSquare, DollarSign, Save 
} from 'lucide-react';
import { useQuoteModal } from './useQuoteModal'; // Ajuste o caminho se necessário
import { MODULOS_DISPONIVEIS } from './utils'; // Ajuste o caminho se necessário
import type { IQuote } from './types';

interface QuoteModalProps {
  quote: IQuote | null;
  onClose: () => void;
}

export default function QuoteModal({ quote, onClose }: QuoteModalProps) {
  const {
    formData,
    setFormData,
    selectedModulos,
    handleToggleModulo,
    valorTabela,
    valorFinal,
    isNegotiating,
    setIsNegotiating,
    isLoading,
    handleSave,
    isReadOnly
  } = useQuoteModal(quote, onClose);

  // Helper para atualizar os campos do form
  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 font-sans animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {quote ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Preencha os dados abaixo para gerar uma nova proposta comercial.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LADO ESQUERDO: Dados do Cliente */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-5">
                  <Building size={14} /> Dados do Cliente
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Nome da Empresa / Cliente *</label>
                    <input 
                      type="text" 
                      value={formData.nomeCliente}
                      onChange={(e) => handleChange('nomeCliente', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                      placeholder="Ex: Empresa Silva LTDA"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">CNPJ</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={formData.cnpj}
                          onChange={(e) => handleChange('cnpj', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                          placeholder="00.000.000/0000-00"
                        />
                        <button 
                          title="Buscar CNPJ na Receita"
                          disabled={isReadOnly || formData.cnpj.length < 14}
                          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-3 rounded-xl flex items-center justify-center transition-colors"
                        >
                          <Search size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Endereço</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.endereco}
                          onChange={(e) => handleChange('endereco', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                          placeholder="Cidade / Estado"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">E-mail de Contato</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                        placeholder="contato@empresa.com.br"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Telefone Principal *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.telefonePrincipal}
                          onChange={(e) => handleChange('telefonePrincipal', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Telefone Secundário</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          // Nota: Como telefoneSecundario não estava no estado inicial do seu hook, 
                          // adicionei como fallback, mas você pode adicioná-lo no useQuoteModal
                          value={(formData as any).telefoneSecundario || ''}
                          onChange={(e) => handleChange('telefoneSecundario', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LADO DIREITO: Configuração, Valores e Infos */}
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-5">
                  <CheckSquare size={14} /> Configuração e Valores
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Módulos Adicionais</label>
                    <div className="flex flex-wrap gap-2">
                      {MODULOS_DISPONIVEIS.map(modulo => {
                        const isChecked = selectedModulos.includes(modulo.id);
                        return (
                          <label key={modulo.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${isChecked ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'} ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}`}>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={isChecked} 
                              onChange={() => handleToggleModulo(modulo.id)} 
                              disabled={isReadOnly} 
                            />
                            {modulo.id}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Plano</label>
                      <select 
                        value={formData.plano}
                        onChange={(e) => handleChange('plano', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                      >
                        <option value="MENSAL">Mensal</option>
                        <option value="ANUAL">Anual (10% Desc)</option>
                      </select>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5 flex flex-col justify-center items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor da Tabela</span>
                      <span className="text-lg font-black text-slate-900">{formatarMoeda(valorTabela)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer mb-3 w-max">
                      <input 
                        type="checkbox" 
                        checked={isNegotiating}
                        onChange={(e) => setIsNegotiating(e.target.checked)}
                        disabled={isReadOnly}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        <DollarSign size={16} className="text-emerald-500" />
                        Aplicar Valor Negociado Diferente
                      </span>
                    </label>

                    {isNegotiating && (
                      <div className="animate-in slide-in-from-top-2 fade-in">
                        <input 
                          type="number" 
                          step="0.01"
                          value={formData.valorNegociado || ''}
                          onChange={(e) => handleChange('valorNegociado', parseFloat(e.target.value))}
                          disabled={isReadOnly}
                          className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-900 outline-none focus:border-emerald-400 transition-colors disabled:bg-slate-50"
                          placeholder="Digite o valor final..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <FileText size={14} /> Informações Adicionais
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Interesses</label>
                    <textarea 
                      value={formData.interesses}
                      onChange={(e) => handleChange('interesses', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full h-20 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 resize-none"
                      placeholder="Descreva brevemente os interesses..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Observações / Detalhes da Negociação</label>
                    <textarea 
                      value={formData.observacoes}
                      onChange={(e) => handleChange('observacoes', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full h-24 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 resize-none"
                      placeholder="Notas internas..."
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3 items-center">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          {!isReadOnly && (
            <button 
              onClick={handleSave}
              disabled={isLoading || !formData.nomeCliente || !formData.telefonePrincipal}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              <Save size={18} /> 
              {isLoading ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}