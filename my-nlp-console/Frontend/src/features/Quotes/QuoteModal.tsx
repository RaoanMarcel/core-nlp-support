import React, { useEffect } from 'react';
import { 
  X, Building, Search, Phone, Mail, MapPin, 
  FileText, CheckSquare, Save, Calculator
} from 'lucide-react';
import { useQuoteModal } from './useQuoteModal'; 
import { MODULOS_DISPONIVEIS } from './utils'; 
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
    isNegotiating,
    setIsNegotiating,
    isLoading,
    handleSave,
    isReadOnly
  } = useQuoteModal(quote, onClose);

  // Garante que o plano seja sempre MENSAL em background
  useEffect(() => {
    if (formData.plano !== 'MENSAL') {
      handleChange('plano', 'MENSAL');
    }
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 sm:p-6 font-sans animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-white rounded-md shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header - Padrão Zendesk */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-none">
              {quote ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Preencha os dados do cliente e configure a proposta comercial.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LADO ESQUERDO: Dados do Cliente */}
            <div className="lg:col-span-7 space-y-6">
              
              <section>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <Building size={16} className="text-gray-500" /> Detalhes do Cliente
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa / Cliente *</label>
                    <input 
                      type="text" 
                      value={formData.nomeCliente}
                      onChange={(e) => handleChange('nomeCliente', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 transition-shadow"
                      placeholder="Ex: Empresa Silva LTDA"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={formData.cnpj}
                          onChange={(e) => handleChange('cnpj', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 transition-shadow"
                          placeholder="00.000.000/0000-00"
                        />
                        <button 
                          title="Buscar CNPJ na Receita"
                          disabled={isReadOnly || formData.cnpj.length < 14}
                          className="bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-3 rounded-md flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Search size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          value={formData.endereco}
                          onChange={(e) => handleChange('endereco', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 transition-shadow"
                          placeholder="Cidade / Estado"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Contato</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 transition-shadow"
                        placeholder="contato@empresa.com.br"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          value={formData.telefonePrincipal}
                          onChange={(e) => handleChange('telefonePrincipal', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 transition-shadow"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Secundário</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          value={(formData as any).telefoneSecundario || ''}
                          onChange={(e) => handleChange('telefoneSecundario', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 transition-shadow"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <FileText size={16} className="text-gray-500" /> Informações Adicionais
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interesses</label>
                    <textarea 
                      value={formData.interesses}
                      onChange={(e) => handleChange('interesses', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full h-20 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 resize-none transition-shadow"
                      placeholder="Descreva brevemente os interesses do cliente..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações Internas</label>
                    <textarea 
                      value={formData.observacoes}
                      onChange={(e) => handleChange('observacoes', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full h-20 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1f73b7] focus:border-[#1f73b7] disabled:bg-gray-50 resize-none transition-shadow"
                      placeholder="Notas e detalhes da negociação..."
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* LADO DIREITO: Configuração, Valores e Infos */}
            <div className="lg:col-span-5 space-y-6">
              
              <section>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <CheckSquare size={16} className="text-gray-500" /> Configuração do Sistema
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Módulos Selecionados</label>
                  <div className="flex flex-col gap-2">
                    {MODULOS_DISPONIVEIS.map(modulo => {
                      const isChecked = selectedModulos.includes(modulo.id);
                      return (
                        <label 
                          key={modulo.id} 
                          className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                            isChecked ? 'bg-[#f0f7fb] border-[#1f73b7]/30' : 'bg-white border-gray-200'
                          } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => handleToggleModulo(modulo.id)} 
                              disabled={isReadOnly}
                              className="rounded-sm border-gray-300 text-[#1f73b7] focus:ring-[#1f73b7] w-4 h-4"
                            />
                            <span className={`text-sm ${isChecked ? 'font-medium text-[#144a75]' : 'text-gray-700'}`}>
                              {modulo.id}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Bloco Integrado de Valores */}
              <section className="bg-gray-50 border border-gray-200 rounded-md p-5">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Calculator size={16} className="text-gray-500" /> Resumo Financeiro
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ciclo de faturamento</span>
                    <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2.5 py-1 rounded-sm uppercase tracking-wide">
                      Mensal
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor de Tabela</span>
                    <span className={`text-sm font-medium ${isNegotiating ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {formatarMoeda(valorTabela)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input 
                        type="checkbox" 
                        checked={isNegotiating}
                        onChange={(e) => {
                          setIsNegotiating(e.target.checked);
                          if (!e.target.checked) handleChange('valorNegociado', '');
                        }}
                        disabled={isReadOnly}
                        className="rounded-sm border-gray-300 text-[#1f73b7] focus:ring-[#1f73b7] w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        Ajustar valor final (Desconto / Acréscimo)
                      </span>
                    </label>

                    {isNegotiating && (
                      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-[#1f73b7] focus-within:border-[#1f73b7] transition-shadow">
                        <span className="text-sm font-medium text-gray-500">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={formData.valorNegociado || ''}
                          onChange={(e) => handleChange('valorNegociado', parseFloat(e.target.value))}
                          disabled={isReadOnly}
                          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400 disabled:text-gray-500"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 flex justify-between items-end border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">Total a pagar / mês</span>
                    <span className="text-xl font-bold text-[#1f73b7]">
                      {isNegotiating && formData.valorNegociado 
                        ? formatarMoeda(formData.valorNegociado) 
                        : formatarMoeda(valorTabela)}
                    </span>
                  </div>

                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 items-center shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 rounded-md transition-colors shadow-sm"
          >
            Cancelar
          </button>
          {!isReadOnly && (
            <button 
              onClick={handleSave}
              disabled={isLoading || !formData.nomeCliente || !formData.telefonePrincipal}
              className="flex items-center gap-2 px-5 py-2 bg-[#1f73b7] hover:bg-[#144a75] text-white text-sm font-medium rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <Save size={16} /> 
              {isLoading ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}