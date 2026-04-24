import React, { useEffect } from 'react';
import { 
  X, Building, Search, Phone, Mail, MapPin, 
  FileText, CheckSquare, Save, Calculator, Users, Loader2
} from 'lucide-react';
import { useQuoteModal } from './useQuoteModal'; 
import type { IQuote } from './types';
import type { Plan } from '../../types/plan.types';

interface QuoteModalProps {
  quote: IQuote | null;
  onClose: () => void;
}

export default function QuoteModal({ quote, onClose }: QuoteModalProps) {
  const {
    formData,
    setFormData,
    plans,
    selectedPlanIds,
    togglePlanSelection,
    valorTabela,
    isNegotiating,
    setIsNegotiating,
    isLoading,
    handleSave,
    isReadOnly,
    isLoadingCnpj,
    isLoadingCep,
    buscarCNPJ,
    buscarCEP
  } = useQuoteModal(quote, onClose);

  useEffect(() => {
    if (formData.plano !== 'MENSAL') {
      handleChange('plano', 'MENSAL');
    }
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Função dedicada para o CEP para acionar a busca automaticamente
  const handleCepChange = (value: string) => {
    handleChange('cep', value);
    const cepLimpo = value.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCEP(cepLimpo);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6 font-sans animate-in fade-in duration-200 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-theme-panel border border-theme-border rounded-shape-lg shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] transition-colors">
        
        <div className="px-6 py-4 border-b border-theme-border bg-theme-panel flex justify-between items-center shrink-0 transition-colors">
          <div>
            <h2 className="text-lg font-semibold text-theme-text leading-none transition-colors">
              {quote ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
            <p className="text-sm text-theme-muted mt-1.5 transition-colors">
              Preencha os dados do cliente e configure a proposta comercial.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-theme-muted hover:text-rose-500 hover:bg-theme-base rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-theme-panel transition-colors custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LADO ESQUERDO: Dados do Cliente */}
            <div className="lg:col-span-7 space-y-6">
              
              <section>
                <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2 mb-4 border-b border-theme-border pb-2 transition-colors">
                  <Building size={16} className="text-theme-muted" /> Detalhes do Cliente
                </h3>
                
                <div className="space-y-4">
                  
                  {/* CNPJ e Nome */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">CNPJ</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={formData.cnpj || ''}
                          onChange={(e) => handleChange('cnpj', e.target.value)}
                          disabled={isReadOnly || isLoadingCnpj}
                          className="w-full bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent disabled:opacity-60 transition-all"
                          placeholder="Somente números"
                        />
                        <button 
                          onClick={buscarCNPJ}
                          title="Buscar CNPJ na Receita"
                          disabled={isReadOnly || !formData.cnpj || formData.cnpj.length < 14 || isLoadingCnpj}
                          className="bg-theme-panel border border-theme-border hover:bg-theme-base disabled:opacity-50 text-theme-text px-3 rounded-md flex items-center justify-center transition-colors shadow-sm min-w-[42px]"
                        >
                          {isLoadingCnpj ? <Loader2 size={16} className="animate-spin text-theme-accent" /> : <Search size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">Nome da Empresa / Cliente *</label>
                      <input 
                        type="text" 
                        value={formData.nomeCliente || ''}
                        onChange={(e) => handleChange('nomeCliente', e.target.value)}
                        disabled={isReadOnly || isLoadingCnpj}
                        className="w-full bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent disabled:opacity-60 transition-all"
                        placeholder="Ex: Empresa Silva LTDA"
                      />
                    </div>
                  </div>

                  {/* ✨ NOVO GRID DE ENDEREÇO ESTUTURADO ✨ */}
                  <div className="p-4 rounded-md border border-theme-border bg-theme-base/50 space-y-4 transition-colors">
                    <h4 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin size={14} /> Endereço
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-theme-text mb-1">CEP</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            maxLength={9}
                            value={formData.cep || ''}
                            onChange={(e) => handleCepChange(e.target.value)}
                            disabled={isReadOnly || isLoadingCnpj}
                            className="w-full bg-theme-panel border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent disabled:opacity-60 pr-8"
                            placeholder="00000-000"
                          />
                          {isLoadingCep && <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-theme-accent" />}
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-medium text-theme-text mb-1">Logradouro (Rua/Av)</label>
                        <input 
                          type="text" 
                          value={formData.logradouro || ''}
                          onChange={(e) => handleChange('logradouro', e.target.value)}
                          disabled={isReadOnly || isLoadingCnpj || isLoadingCep}
                          className="w-full bg-theme-panel border border-theme-border text-theme-text rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-medium text-theme-text mb-1">Número</label>
                        <input 
                          type="text" 
                          value={formData.numero || ''}
                          onChange={(e) => handleChange('numero', e.target.value)}
                          disabled={isReadOnly || isLoadingCnpj}
                          className="w-full bg-theme-panel border border-theme-border text-theme-text rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent disabled:opacity-60"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-medium text-theme-text mb-1">Complemento</label>
                        <input 
                          type="text" 
                          value={formData.complemento || ''}
                          onChange={(e) => handleChange('complemento', e.target.value)}
                          disabled={isReadOnly || isLoadingCnpj}
                          className="w-full bg-theme-panel border border-theme-border text-theme-text rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent disabled:opacity-60"
                          placeholder="Sala, Andar..."
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-medium text-theme-text mb-1">Bairro</label>
                        <input 
                          type="text" 
                          value={formData.bairro || ''}
                          onChange={(e) => handleChange('bairro', e.target.value)}
                          disabled={isReadOnly || isLoadingCnpj || isLoadingCep}
                          className="w-full bg-theme-panel border border-theme-border text-theme-text rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-medium text-theme-text mb-1">Cidade</label>
                        <input 
                          type="text" 
                          value={formData.cidade || ''}
                          onChange={(e) => handleChange('cidade', e.target.value)}
                          disabled={isReadOnly || isLoadingCnpj || isLoadingCep}
                          className="w-full bg-theme-panel border border-theme-border text-theme-text rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent disabled:opacity-60"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-theme-text mb-1">UF</label>
                        <input 
                          type="text" 
                          maxLength={2}
                          value={formData.uf || ''}
                          onChange={(e) => handleChange('uf', e.target.value.toUpperCase())}
                          disabled={isReadOnly || isLoadingCnpj || isLoadingCep}
                          className="w-full bg-theme-panel border border-theme-border text-theme-text rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent disabled:opacity-60 uppercase"
                          placeholder="SP"
                        />
                      </div>
                    </div>
                  </div>
                  {/* FIM DO GRID DE ENDEREÇO */}

                  {/* Contatos */}
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">E-mail de Contato</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted transition-colors" />
                      <input 
                        type="email" 
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled={isReadOnly || isLoadingCnpj}
                        className="w-full pl-9 pr-3 py-2 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent disabled:opacity-60 transition-all"
                        placeholder="contato@empresa.com.br"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">Telefone Principal *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted transition-colors" />
                        <input 
                          type="text" 
                          value={formData.telefonePrincipal || ''}
                          onChange={(e) => handleChange('telefonePrincipal', e.target.value)}
                          disabled={isReadOnly || isLoadingCnpj}
                          className="w-full pl-9 pr-3 py-2 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent disabled:opacity-60 transition-all"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">Telefone Secundário</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted transition-colors" />
                        <input 
                          type="text" 
                          value={formData.telefoneSecundario || ''}
                          onChange={(e) => handleChange('telefoneSecundario', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full pl-9 pr-3 py-2 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent disabled:opacity-60 transition-all"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-2">
                <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2 mb-4 border-b border-theme-border pb-2 transition-colors">
                  <FileText size={16} className="text-theme-muted" /> Informações Adicionais
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">Interesses</label>
                    <textarea 
                      value={formData.interesses || ''}
                      onChange={(e) => handleChange('interesses', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full h-20 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent disabled:opacity-60 resize-none transition-all custom-scrollbar"
                      placeholder="Descreva brevemente os interesses do cliente..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">Observações Internas</label>
                    <textarea 
                      value={formData.observacoes || ''}
                      onChange={(e) => handleChange('observacoes', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full h-20 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent disabled:opacity-60 resize-none transition-all custom-scrollbar"
                      placeholder="Notas e detalhes da negociação..."
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* LADO DIREITO: Configuração, Valores e Infos */}
            <div className="lg:col-span-5 space-y-6">
              
              <section>
                <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2 mb-4 border-b border-theme-border pb-2 transition-colors">
                  <CheckSquare size={16} className="text-theme-muted" /> Configuração do Plano
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2 transition-colors">Selecione o(s) Pacote(s) Contratado(s) *</label>
                  
                  {plans.length === 0 ? (
                    <div className="p-4 border border-theme-border border-dashed rounded-md text-center bg-theme-base/50">
                      <p className="text-xs text-theme-muted">Buscando planos no sistema...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-75 overflow-y-auto custom-scrollbar pr-1">
                      {plans.map((plan: Plan) => {
                        const isSelected = selectedPlanIds.includes(plan.id); 
                        return (
                          <div 
                            key={plan.id}
                            onClick={() => !isReadOnly && togglePlanSelection(plan.id)} 
                            className={`flex flex-col p-3.5 rounded-md border transition-all ${
                              isSelected ? 'bg-theme-accent-soft/30 border-theme-accent shadow-sm ring-1 ring-theme-accent/20' : 'bg-theme-base border-theme-border hover:border-theme-accent/40 hover:bg-theme-panel'
                            } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-theme-text' : 'text-theme-text'}`}>
                                {plan.nome}
                              </span>
                              <span className={`text-sm font-black whitespace-nowrap ml-2 ${isSelected ? 'text-emerald-600' : 'text-theme-muted'}`}>
                                {formatarMoeda(plan.valorBase)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-[11px] text-theme-muted font-medium mb-3">
                              <Users size={12} className={isSelected ? 'text-theme-accent' : ''} /> 
                              Limite de {plan.quantidadeUsuarios} usuário(s)
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {plan.modulosInclusos.map((mod: string) => (
                                <span key={mod} className={`text-[9px] border px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isSelected ? 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent' : 'bg-theme-panel border-theme-border text-theme-muted'}`}>
                                  {mod}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
              <section className="bg-theme-base/50 border border-theme-border border-dashed rounded-md p-4 transition-colors">
                <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2 mb-3">
                  <Users size={16} className="text-theme-muted" /> Adicionais do Contrato
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="input-usuarios" className="block text-xs font-medium text-theme-text mb-1">Usuários Extras</label>
                    <input
                      id="input-usuarios"
                      type="number" 
                      min="0"
                      value={formData.usuariosExtras === 0 ? '' : (formData.usuariosExtras ?? '')}      
                        onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || Number(val) < 0) {
                          handleChange('usuariosExtras', '');
                        } else {
                          handleChange('usuariosExtras', parseInt(val, 10));
                        }
                      }}
                      disabled={isReadOnly}
                      className="w-full bg-theme-panel border border-theme-border text-theme-text rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-theme-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-valor" className="block text-xs font-medium text-theme-text mb-1">Valor por Usuário</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-theme-muted">R$</span>
                      <input 
                        id="input-valor"
                        type="number" 
                        min="0"
                        step="0.01"
                        value={formData.valorUsuarioExtra === 0 ? '' : (formData.valorUsuarioExtra ?? '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || Number(val) < 0) {
                            handleChange('valorUsuarioExtra', '');
                          } else {
                            handleChange('valorUsuarioExtra', parseFloat(val));
                          }
                        }}
                        disabled={isReadOnly}
                        className="w-full pl-9 pr-3 py-2 bg-theme-panel border border-theme-border text-theme-text rounded-md text-sm outline-none focus:ring-1 focus:ring-theme-accent"
                      />
                    </div>
                  </div>
                </div>
                </section>

              {/* Bloco Integrado de Valores */}
              <section className="bg-theme-base border border-theme-border rounded-md p-5 transition-colors">
                <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2 mb-4 transition-colors">
                  <Calculator size={16} className="text-theme-muted" /> Resumo Financeiro
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-muted transition-colors">Ciclo de faturamento</span>
                    <span className="text-xs font-bold bg-theme-panel text-theme-text border border-theme-border px-2.5 py-1 rounded-sm uppercase tracking-wide transition-colors">
                      Mensal
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-muted transition-colors">Valor de Tabela</span>
                    <span className={`text-sm font-medium transition-colors ${isNegotiating ? 'line-through text-theme-muted/50' : 'text-theme-text'}`}>
                      {formatarMoeda(valorTabela)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-theme-border mt-3 transition-colors">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input 
                        type="checkbox" 
                        checked={isNegotiating}
                        onChange={(e) => {
                          setIsNegotiating(e.target.checked);
                          if (!e.target.checked) handleChange('valorNegociado', '');
                        }}
                        disabled={isReadOnly}
                        className="rounded-sm border-theme-border text-theme-accent focus:ring-theme-accent w-4 h-4 transition-colors"
                      />
                      <span className="text-sm font-medium text-theme-text transition-colors">
                        Ajustar valor final (Desconto / Acréscimo)
                      </span>
                    </label>

                    {isNegotiating && (
                      <div className="flex items-center gap-2 bg-theme-panel border border-theme-border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-theme-accent focus-within:border-theme-accent transition-all">
                        <span className="text-sm font-medium text-theme-muted transition-colors">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={formData.valorNegociado || ''}
                          onChange={(e) => handleChange('valorNegociado', parseFloat(e.target.value))}
                          disabled={isReadOnly}
                          className="w-full bg-transparent text-sm text-theme-text outline-none placeholder:text-theme-muted disabled:opacity-50 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 flex justify-between items-end border-t border-theme-border transition-colors">
                    <span className="text-sm font-bold text-theme-text transition-colors">Total a pagar / mês</span>
                    <span className="text-xl font-black text-theme-accent transition-colors">
                      {isNegotiating && formData.valorNegociado 
                        ? formatarMoeda(Number(formData.valorNegociado)) 
                        : formatarMoeda(valorTabela)}
                    </span>
                  </div>

                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-panel flex justify-end gap-3 items-center shrink-0 transition-colors">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-theme-text text-sm font-medium border border-theme-border bg-theme-panel hover:bg-theme-base rounded-md transition-colors shadow-sm"
          >
            Cancelar
          </button>
          {!isReadOnly && (
            <button 
              onClick={handleSave}
              disabled={isLoading || !formData.nomeCliente || !formData.telefonePrincipal || (selectedPlanIds.length === 0 && !quote?.id)} 
              className="flex items-center gap-2 px-5 py-2 bg-theme-accent hover:opacity-90 text-white text-sm font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
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