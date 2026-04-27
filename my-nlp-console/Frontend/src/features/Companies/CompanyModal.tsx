// Frontend/src/features/Companies/CompanyModal.tsx
import React from 'react';
import { X, Save, Building2, MapPin, Phone, Mail, Search, RefreshCw, FileText } from 'lucide-react';
import { useCompanyModal } from './useCompanyModal';
import type { ICompany } from '../../types/company.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companyEditando: ICompany | null;
  onRefresh: () => void;
}

export default function CompanyModal({ isOpen, onClose, companyEditando, onRefresh }: Props) {
  const { 
    formData, 
    handleChange, 
    handleSave, 
    isLoading, 
    isLoadingCnpj, 
    isLoadingCep, 
    buscarCNPJ, 
    buscarCEP 
  } = useCompanyModal(companyEditando, onClose, onRefresh);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-theme-panel w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-shape-lg shadow-2xl border border-theme-border flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-base/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent border border-theme-accent/20">
              <Building2 size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-theme-text uppercase tracking-tight">
                {companyEditando ? 'Ficha da Empresa' : 'Cadastrar Nova Empresa'}
              </h2>
              <p className="text-xs font-bold text-theme-muted uppercase tracking-widest">Módulo de Gestão de Clientes Corporativos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full text-theme-muted transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* SEÇÃO 1: DADOS IDENTIFICAÇÃO */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-theme-accent uppercase tracking-[0.2em] flex items-center gap-2 border-b border-theme-border pb-2">
              <FileText size={14} /> Identificação e Contrato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">CNPJ</label>
                <div className="relative">
                  <input 
                    name="cnpj" value={formData.cnpj} onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none font-mono"
                  />
                  <button 
                    type="button" onClick={buscarCNPJ} disabled={isLoadingCnpj}
                    className="absolute right-2 top-1.5 p-1.5 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-white rounded-md transition-all disabled:opacity-50"
                  >
                    {isLoadingCnpj ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Razão Social</label>
                <input 
                  name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required
                  className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Nome Fantasia</label>
                <input 
                  name="nomeFantasia" value={formData.nomeFantasia || ''} onChange={handleChange}
                  className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3.5 text-theme-muted" />
                  <input 
                    name="email" type="email" value={formData.email || ''} onChange={handleChange}
                    className="w-full bg-theme-base border border-theme-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: CONTATO */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-theme-accent uppercase tracking-[0.2em] flex items-center gap-2 border-b border-theme-border pb-2">
              <Phone size={14} /> Comunicação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Telefone Principal</label>
                <input 
                  name="telefonePrincipal" value={formData.telefonePrincipal || ''} onChange={handleChange}
                  className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Telefone Secundário / WhatsApp</label>
                <input 
                  name="telefoneSecundario" value={formData.telefoneSecundario || ''} onChange={handleChange}
                  className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: ENDEREÇO */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-theme-accent uppercase tracking-[0.2em] flex items-center gap-2 border-b border-theme-border pb-2">
              <MapPin size={14} /> Localização Gps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">CEP</label>
                <div className="relative">
                  <input 
                    name="cep" value={formData.cep || ''} onChange={handleChange} onBlur={buscarCEP}
                    className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none"
                  />
                  {isLoadingCep && <RefreshCw size={14} className="absolute right-3 top-3.5 text-theme-accent animate-spin" />}
                </div>
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Cidade</label>
                <input name="cidade" value={formData.cidade || ''} onChange={handleChange} className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text" />
              </div>
              <div className="md:col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">UF</label>
                <input name="uf" value={formData.uf || ''} onChange={handleChange} maxLength={2} className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text text-center uppercase" />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Logradouro / Rua</label>
                <input name="logradouro" value={formData.logradouro || ''} onChange={handleChange} className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Bairro</label>
                <input name="bairro" value={formData.bairro || ''} onChange={handleChange} className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text" />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Número</label>
                <input name="numero" value={formData.numero || ''} onChange={handleChange} className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text" />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Complemento</label>
                <input name="complemento" value={formData.complemento || ''} onChange={handleChange} className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text" />
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: OBSERVAÇÕES */}
          <section className="space-y-1 pb-4">
            <label className="text-[10px] font-bold text-theme-muted uppercase ml-1">Observações Internas</label>
            <textarea 
              name="observacoes" value={formData.observacoes || ''} onChange={handleChange} rows={3}
              className="w-full bg-theme-base border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text focus:border-theme-accent outline-none resize-none"
              placeholder="Notas sobre contrato, faturamento ou particularidades do cliente..."
            />
          </section>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-theme-border flex justify-end gap-3 bg-theme-base/30 shrink-0">
          <button onClick={onClose} type="button" className="px-6 py-2.5 text-sm font-bold text-theme-muted hover:text-theme-text transition-colors">
            Voltar
          </button>
          <button 
            onClick={handleSave} disabled={isLoading}
            className="bg-theme-accent text-white px-8 py-2.5 rounded-shape-lg font-black text-sm flex items-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-theme-accent/20"
          >
            {isLoading ? 'Sincronizando...' : <><Save size={18} /> Finalizar Cadastro</>}
          </button>
        </div>
      </div>
    </div>
  );
}