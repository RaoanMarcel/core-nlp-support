import React from 'react';
import { Phone, Mail, Building, FileText, ArrowLeft, CheckCircle2, XCircle, Edit3, Save, Target, History as HistoryIcon, Clock, User, DollarSign } from 'lucide-react';
import type { Prospect } from '../../../../types/prospect.types';
import type { ModalProps, Historico, ContactFormState } from './types';
import { getSituacaoColor, formatarData, formatarMoeda } from '../../../../utils/utils';
import { useProspectLogic } from './useProspectLogic';

const MODULOS_DISPONIVEIS = ['NFE', 'NFCE', 'MDFE', 'CTE', 'NFSE', 'FINANCEIRO', 'ESTOQUE'];

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { cls: string, label: string }> = {
    APROVADO: { cls: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Interessado' },
    REPROVADO: { cls: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Não Interessado' },
    POSSIBILIDADE: { cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Possibilidade' },
    RETORNAR: { cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20', label: 'Retornar' },
    PENDENTE: { cls: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 animate-pulse', label: 'Em Atendimento' }
  };
  const config = configs[status] || configs.PENDENTE;
  
  return (
    <span className={`${config.cls} text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border transition-colors`}>
      {config.label}
    </span>
  );
};

const ModalHeader = ({ prospect }: { prospect: Prospect }) => (
  <div className="px-8 py-6 border-b border-theme-border bg-theme-panel flex flex-col sm:flex-row justify-between items-start gap-4 shrink-0 transition-colors">
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-2xl font-black text-theme-text tracking-tight leading-none transition-colors">{prospect.nome}</h2>
        <StatusBadge status={prospect.status} />
      </div>
      {prospect.nomeFantasia && <p className="text-base font-semibold text-theme-muted mb-2 transition-colors">{prospect.nomeFantasia}</p>}
      <div className="flex items-center gap-3 mt-2">
        <span className="text-sm font-mono font-medium text-theme-muted bg-theme-base px-2 py-0.5 rounded border border-theme-border transition-colors">
          {prospect.cnpj}
        </span>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getSituacaoColor(prospect.situacaoCadastral)} transition-colors`}>
          {prospect.situacaoCadastral || 'Status Desconhecido'}
        </span>
      </div>
    </div>
  </div>
);

const Timeline = ({ historico, loading }: { historico: Historico[], loading: boolean }) => (
  <div className="lg:col-span-2 bg-theme-base rounded-xl border border-theme-border p-6 overflow-y-auto max-h-100 transition-colors">
    <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider flex items-center gap-2 mb-6 transition-colors">
      <HistoryIcon size={14} /> Linha do Tempo
    </h3>
    <div className="relative border-l-2 border-theme-border ml-2 space-y-6 transition-colors">
      {loading ? (
        <p className="pl-6 text-sm text-theme-muted animate-pulse transition-colors">Carregando histórico...</p>
      ) : historico.length === 0 ? (
        <p className="pl-6 text-sm text-theme-muted italic transition-colors">Nenhum histórico registrado.</p>
      ) : (
        historico.map((item) => (
          <div key={item.id} className="relative pl-6">
            <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-theme-panel border-2 border-theme-accent shadow-sm transition-colors" />
            <div className="bg-theme-panel p-4 rounded-xl shadow-sm border border-theme-border transition-colors">
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-[10px] font-bold text-theme-accent uppercase bg-theme-accent/10 px-2 py-0.5 rounded transition-colors">{item.acao}</span>
                <span className="text-[10px] text-theme-muted flex items-center gap-1 shrink-0 transition-colors">
                  <Clock size={10} /> {formatarData(item.createdAt)}
                </span>
              </div>
              <p className="text-sm text-theme-text leading-relaxed mb-3 wrap-break-words transition-colors">
                {item.observacoes ? `"${item.observacoes}"` : <span className="text-xs italic text-theme-muted transition-colors">Sem observações.</span>}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-theme-border transition-colors">
                <span className="text-[10px] font-semibold text-theme-muted flex items-center gap-1 truncate transition-colors">
                  <User size={10} /> {item.usuario}
                </span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {item.novosModulos?.map(m => (
                    <span key={m} className="text-[9px] bg-theme-base text-theme-muted px-1.5 py-0.5 rounded font-medium transition-colors">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default function ProspectModal({ prospect, onClose, currentUserId, currentUserName, onUpdate }: ModalProps) {
  
  const { 
    isFinished, ui, setUi, loading, historico, contactForm, interactionForm,
    dadosPrimeiroAtendimento, 
    handleContactChange, toggleModulo, setInteractionForm,
    saveContatos, saveInteracao, finishAtendimento, handleVoltar
  } = useProspectLogic(prospect, currentUserId, currentUserName, onClose, onUpdate);

  const { nomeAtendente, dataHoraAtendimento } = dadosPrimeiroAtendimento;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 font-sans transition-colors" 
      onClick={(e) => e.target === e.currentTarget && isFinished && !ui.isEditing && onClose()}
    >
      <div className="bg-theme-panel rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-theme-border transition-colors">
        <ModalHeader prospect={prospect} />
        
        <div className="p-8 overflow-y-auto flex-1 bg-theme-base transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Detalhes da Empresa */}
            <div className="space-y-5 bg-theme-panel p-6 rounded-xl border border-theme-border shadow-sm transition-colors">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider flex items-center gap-2 transition-colors">
                  <Building size={14} /> Detalhes da Empresa
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-theme-muted block mb-1 transition-colors">Atividade Principal</span>
                  <p className="text-sm text-theme-text font-semibold transition-colors">{prospect.atividadePrincipal || 'Não informada'}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-theme-muted block mb-1 transition-colors">Endereço</span>
                  <p className="text-sm text-theme-text font-semibold transition-colors">{prospect.endereco || 'Endereço não cadastrado'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-theme-muted block mb-1 transition-colors">Simples Nacional</span>
                    <p className="text-sm text-theme-text font-semibold transition-colors">{prospect.simplesNacional || 'Não'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-theme-muted block mb-1 transition-colors">Módulos Atuais</span>
                    <p className="text-sm text-theme-text font-semibold transition-colors">{prospect.modulosAtuais}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-theme-border transition-colors">
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider flex items-center gap-1 mb-2 transition-colors">
                    <DollarSign size={12} strokeWidth={2.5} /> Valor no Sistema Atual
                  </span>
                  {ui.isEditingContatos ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-theme-muted transition-colors">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={contactForm.valor}
                        onChange={(e) => handleContactChange('valor', e.target.value)}
                        placeholder="0.00"
                        className="w-full text-sm font-semibold text-theme-text bg-theme-base border-b-2 border-green-500 focus:outline-none px-2 py-1 rounded-t transition-colors"
                        disabled={loading.savingContatos}
                      />
                    </div>
                  ) : (
                    <p className="text-lg text-theme-text font-black transition-colors">
                      {formatarMoeda(prospect.valor)}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Contatos */}
            <div className="space-y-5 bg-theme-panel p-6 rounded-xl border border-theme-border shadow-sm relative transition-colors">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider flex items-center gap-2 transition-colors">
                  <Phone size={14} /> Contatos
                </h3>
                {!ui.isEditingContatos && (
                  <button onClick={() => setUi(p => ({ ...p, isEditingContatos: true }))} className="text-[10px] flex items-center gap-1 px-2 py-1 bg-theme-base text-theme-muted border border-theme-border rounded hover:bg-theme-accent/10 hover:text-theme-accent font-bold uppercase transition-all">
                    <Edit3 size={12} /> Editar Dados
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {[
                  { id: 'telefone', label: 'Principal', icon: Phone, colorClass: 'text-sky-500', bgClass: 'bg-sky-500/10', borderClass: 'border-sky-500', val: contactForm.telefone },
                  { id: 'telefoneSecundario', label: 'Secundário', icon: Phone, colorClass: 'text-theme-muted', bgClass: 'bg-theme-base', borderClass: 'border-theme-border', val: contactForm.telefoneSecundario },
                  { id: 'email', label: 'E-mail', icon: Mail, colorClass: 'text-violet-500', bgClass: 'bg-violet-500/10', borderClass: 'border-violet-500', val: contactForm.email, type: 'email' }
                ].map((field) => (
                  (field.val || ui.isEditingContatos || field.id === 'telefone') && (
                    <div key={field.id} className="flex items-center gap-3 mt-2">
                      <div className={`w-8 h-8 rounded-lg ${field.bgClass} flex items-center justify-center shrink-0 transition-colors`}>
                        <field.icon size={16} className={`${field.colorClass} transition-colors`} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider transition-colors">{field.label}</span>
                        {ui.isEditingContatos ? (
                          <input
                            type={field.type || 'text'}
                            value={field.val}
                            onChange={(e) => handleContactChange(field.id as keyof ContactFormState, e.target.value)}
                            className={`w-full mt-0.5 text-sm font-semibold text-theme-text bg-theme-base border-b-2 ${field.borderClass} focus:outline-none px-2 py-1 rounded-t transition-colors`}
                            disabled={loading.savingContatos}
                          />
                        ) : (
                          <p className="text-sm font-semibold text-theme-text truncate transition-colors">{field.val || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
              {ui.isEditingContatos && (
                <div className="mt-4 pt-4 border-t border-theme-border flex justify-end gap-2 transition-colors">
                  <button onClick={() => setUi(p => ({ ...p, isEditingContatos: false }))} disabled={loading.savingContatos} className="px-3 py-1.5 text-xs font-bold text-theme-muted hover:bg-theme-base rounded transition-colors">Cancelar</button>
                  <button onClick={saveContatos} disabled={loading.savingContatos} className="flex items-center gap-1.5 px-4 py-1.5 bg-theme-accent text-white text-xs font-bold rounded hover:brightness-90 transition-all">
                    <Save size={14} /> {loading.savingContatos ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-theme-panel p-6 rounded-xl border border-theme-border shadow-sm flex flex-col transition-colors">
              <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider flex items-center gap-2 mb-5 transition-colors">
                <FileText size={14} /> Registro de Atendimento {isFinished && !ui.isEditing && '(Modo Leitura)'}
              </h3>
              
              <label className="block text-sm font-bold text-theme-text mb-3 transition-colors">Módulos de interesse:</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {MODULOS_DISPONIVEIS.map(modulo => {
                  const isChecked = interactionForm.modulos.includes(modulo);
                  return (
                    <label key={modulo} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${isChecked ? 'bg-theme-accent/10 border-theme-accent text-theme-accent' : 'bg-theme-base border-theme-border text-theme-muted'} ${ui.isEditing ? 'cursor-pointer hover:brightness-95' : 'cursor-default opacity-90'}`}>
                      <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleModulo(modulo)} disabled={!ui.isEditing} />
                      {modulo}
                    </label>
                  );
                })}
              </div>
              
              <label className="block text-sm font-bold text-theme-text mb-2 transition-colors">Nova Observação</label>
              <textarea 
                className={`w-full flex-1 min-h-30 border rounded-xl p-4 text-sm focus:outline-none transition-all resize-none text-theme-text placeholder-theme-muted ${!ui.isEditing ? 'bg-theme-base border-theme-border cursor-not-allowed' : 'bg-theme-panel border-theme-border focus:ring-2 focus:ring-theme-accent'}`}
                value={interactionForm.observacoes}
                onChange={(e) => setInteractionForm(p => ({ ...p, observacoes: e.target.value }))}
                placeholder="Descreva a interação..."
                disabled={loading.saving || !ui.isEditing}
              />

              {isFinished && ui.isEditing && (
                <div className="mt-6 pt-5 border-t border-theme-border transition-colors">
                  <span className="block text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-4 transition-colors">
                    Ação Rápida: Salvar e Alterar Status
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <button 
                      onClick={() => saveInteracao({ status: 'APROVADO' })} 
                      disabled={loading.saving} 
                      className="flex justify-center items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
                    >
                      <CheckCircle2 size={16} strokeWidth={2.5} /> Interessado
                    </button>
                    
                    <button 
                      onClick={() => saveInteracao({ status: 'POSSIBILIDADE' })} 
                      disabled={loading.saving} 
                      className="flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
                    >
                      <Target size={16} strokeWidth={2.5} /> Possibilidade
                    </button>

                    <button 
                      onClick={() => saveInteracao({ status: 'RETORNAR' })} 
                      disabled={loading.saving}  
                      className="flex justify-center items-center gap-2 px-4 py-2.5 bg-violet-500/10 text-violet-600 border border-violet-500/20 rounded-xl text-xs font-bold hover:bg-violet-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
                    >
                      <Clock size={16} strokeWidth={2.5} /> Retornar
                    </button>

                    <button 
                      onClick={() => saveInteracao({ status: 'REPROVADO' })} 
                      disabled={loading.saving} 
                      className="flex justify-center items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
                    >
                      <XCircle size={16} strokeWidth={2.5} /> Não Interessado
                    </button>
                  </div>
                </div>
              )}
            </div> 

            <Timeline historico={historico} loading={loading.historico} />
          </div>
        </div>

        <div className="px-8 py-5 border-t border-theme-border bg-theme-panel shrink-0 transition-colors">
          {isFinished ? (
            <div className="flex justify-between items-center gap-4">
              <div className="text-sm text-theme-muted transition-colors">
                <span className="italic">
                  Atendido por <span className="font-semibold text-theme-text transition-colors">{nomeAtendente}</span> em {dataHoraAtendimento}
                </span>
              </div>
              <div className="flex gap-3">
                {!ui.isEditing ? (
                  <>
                    <button onClick={() => setUi(p => ({ ...p, isEditing: true }))} className="flex items-center gap-1.5 px-4 py-2 bg-theme-accent/10 text-theme-accent text-sm font-bold rounded-lg border border-theme-accent/20 hover:bg-theme-accent/20 transition-all">
                      <Edit3 size={16} /> Nova Interação
                    </button>
                    <button onClick={onClose} className="px-4 py-2 bg-theme-base text-theme-text text-sm font-bold rounded-lg hover:brightness-95 transition-all">Fechar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setUi(p => ({ ...p, isEditing: false })); setInteractionForm(p => ({ ...p, observacoes: '' })); }} className="px-4 py-2 text-theme-muted text-sm font-bold hover:bg-theme-base rounded-lg transition-colors">Cancelar</button>
                    <button onClick={() => saveInteracao()} disabled={loading.saving} className="flex items-center gap-1.5 px-4 py-2 bg-theme-accent text-white text-sm font-bold rounded-lg hover:brightness-90 transition-all">
                      <Save size={16} /> {loading.saving ? 'Salvando...' : 'Salvar Nota'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-4">
              <button 
                onClick={handleVoltar} 
                disabled={loading.saving}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-theme-text font-semibold hover:bg-theme-base rounded-lg transition-colors"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <div className="flex gap-2">
                <button onClick={() => finishAtendimento('REPROVADO')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-500/20 text-red-600 font-bold rounded-lg hover:bg-red-500/10 transition-all">
                  <XCircle size={16} strokeWidth={2.5} /> Não interessado
                </button>
                <button onClick={() => finishAtendimento('RETORNAR')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-violet-500/20 text-violet-600 font-bold rounded-lg hover:bg-violet-500/10 transition-all">
                  <Clock size={16} strokeWidth={2.5} /> Retornar
                </button>
                <button onClick={() => finishAtendimento('POSSIBILIDADE')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-500/20 text-blue-600 font-bold rounded-lg hover:bg-blue-500/10 transition-all">
                  <Target size={16} strokeWidth={2.5} /> Possibilidade
                </button>
                <button onClick={() => finishAtendimento('APROVADO')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all">
                  <CheckCircle2 size={16} strokeWidth={2.5} /> Interessado
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}