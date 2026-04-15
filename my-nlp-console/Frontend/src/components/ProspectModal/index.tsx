import { Phone, Mail, Building, FileText, ArrowLeft, CheckCircle2, XCircle, Edit3, Save, Target, History, Clock, User, DollarSign } from 'lucide-react';

import { type Prospect } from '../Contratos';

import type { ModalProps, Historico, ContactFormState } from './types';
import { getSituacaoColor, formatarData, formatarMoeda } from './prospectUtils';
import { useProspectLogic } from './useProspectLogic';

const MODULOS_DISPONIVEIS = ['NFE', 'NFCE', 'MDFE', 'CTE', 'NFSE', 'FINANCEIRO', 'ESTOQUE'];

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { cls: string, label: string }> = {
    APROVADO: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Interessado' },
    REPROVADO: { cls: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Não Interessado' },
    POSSIBILIDADE: { cls: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Possibilidade' },
    RETORNAR: { cls: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Retornar' },
    PENDENTE: { cls: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse', label: 'Em Atendimento' }
  };
  const config = configs[status] || configs.PENDENTE;
  
  return (
    <span className={`${config.cls} text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border`}>
      {config.label}
    </span>
  );
};

const ModalHeader = ({ prospect }: { prospect: Prospect }) => (
  <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start gap-4 shrink-0">
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{prospect.nome}</h2>
        <StatusBadge status={prospect.status} />
      </div>
      {prospect.nomeFantasia && <p className="text-base font-semibold text-slate-500 mb-2">{prospect.nomeFantasia}</p>}
      <div className="flex items-center gap-3 mt-2">
        <span className="text-sm font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
          {prospect.cnpj}
        </span>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getSituacaoColor(prospect.situacaoCadastral)}`}>
          {prospect.situacaoCadastral || 'Status Desconhecido'}
        </span>
      </div>
    </div>
  </div>
);

const Timeline = ({ historico, loading }: { historico: Historico[], loading: boolean }) => (
  <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-y-auto max-h-[400px]">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-6">
      <History size={14} /> Linha do Tempo
    </h3>
    <div className="relative border-l-2 border-slate-200 ml-2 space-y-6">
      {loading ? (
        <p className="pl-6 text-sm text-slate-400 animate-pulse">Carregando histórico...</p>
      ) : historico.length === 0 ? (
        <p className="pl-6 text-sm text-slate-400 italic">Nenhum histórico registrado.</p>
      ) : (
        historico.map((item) => (
          <div key={item.id} className="relative pl-6">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-sm" />
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{item.acao}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock size={10} /> {formatarData(item.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3 break-words">
                {item.observacoes ? `"${item.observacoes}"` : <span className="text-xs italic text-slate-400">Sem observações.</span>}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 truncate">
                  <User size={10} /> {item.usuario}
                </span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {item.novosModulos?.map(m => (
                    <span key={m} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{m}</span>
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

// CORREÇÃO: Adicionado onUpdate nas props destruídas
export default function ProspectModal({ prospect, onClose, currentUserId, currentUserName, onUpdate }: ModalProps) {
  
  const { 
    isFinished, ui, setUi, loading, historico, contactForm, interactionForm,
    handleContactChange, toggleModulo, setInteractionForm,
    saveContatos, saveInteracao, finishAtendimento, handleVoltar
  } = useProspectLogic(prospect, currentUserId, currentUserName, onClose, onUpdate); // CORREÇÃO: Repassando onUpdate para o Hook

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 font-sans" 
      onClick={(e) => e.target === e.currentTarget && isFinished && !ui.isEditing && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-slate-900/5">
        <ModalHeader prospect={prospect} />
        
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Building size={14} /> Detalhes da Empresa
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 block mb-1">Atividade Principal</span>
                  <p className="text-sm text-slate-900 font-semibold">{prospect.atividadePrincipal || 'Não informada'}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 block mb-1">Endereço</span>
                  <p className="text-sm text-slate-900 font-semibold">{prospect.endereco || 'Endereço não cadastrado'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">Simples Nacional</span>
                    <p className="text-sm text-slate-900 font-semibold">{prospect.simplesNacional || 'Não'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">Módulos Atuais</span>
                    <p className="text-sm text-slate-900 font-semibold">{prospect.modulosAtuais}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <DollarSign size={12} /> Valor no Sistema Atual
                  </span>
                  {ui.isEditingContatos ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={contactForm.valor}
                        onChange={(e) => handleContactChange('valor', e.target.value)}
                        placeholder="0.00"
                        className="w-full text-sm font-semibold text-slate-900 bg-emerald-50/50 border-b-2 border-emerald-400 focus:outline-none px-2 py-1 rounded-t"
                        disabled={loading.savingContatos}
                      />
                    </div>
                  ) : (
                    <p className="text-lg text-slate-900 font-black">
                      {formatarMoeda(prospect.valor)}
                    </p>
                  )}
                </div>

              </div>
            </div>

            <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} /> Contatos
                </h3>
                {!ui.isEditingContatos && (
                  <button onClick={() => setUi(p => ({ ...p, isEditingContatos: true }))} className="text-[10px] flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-blue-50 hover:text-blue-600 font-bold uppercase">
                    <Edit3 size={12} /> Editar Dados
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {[
                  { id: 'telefone', label: 'Principal', icon: Phone, color: 'blue', val: contactForm.telefone },
                  { id: 'telefoneSecundario', label: 'Secundário', icon: Phone, color: 'slate', val: contactForm.telefoneSecundario },
                  { id: 'email', label: 'E-mail', icon: Mail, color: 'indigo', val: contactForm.email, type: 'email' }
                ].map((field) => (
                  (field.val || ui.isEditingContatos || field.id === 'telefone') && (
                    <div key={field.id} className="flex items-center gap-3 mt-2">
                      <div className={`w-8 h-8 rounded-lg bg-${field.color}-50 flex items-center justify-center shrink-0`}>
                        <field.icon size={16} className={`text-${field.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                        {ui.isEditingContatos ? (
                          <input
                            type={field.type || 'text'}
                            value={field.val}
                            onChange={(e) => handleContactChange(field.id as keyof ContactFormState, e.target.value)}
                            className={`w-full mt-0.5 text-sm font-semibold text-slate-900 bg-${field.color}-50/60 border-b-2 border-${field.color}-400 focus:outline-none px-2 py-1 rounded-t`}
                            disabled={loading.savingContatos}
                          />
                        ) : (
                          <p className="text-sm font-semibold text-slate-900 truncate">{field.val || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
              {ui.isEditingContatos && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button onClick={() => setUi(p => ({ ...p, isEditingContatos: false }))} disabled={loading.savingContatos} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
                  <button onClick={saveContatos} disabled={loading.savingContatos} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">
                    <Save size={14} /> {loading.savingContatos ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-5">
                <FileText size={14} /> Registro de Atendimento {isFinished && !ui.isEditing && '(Modo Leitura)'}
              </h3>
              
              <label className="block text-sm font-bold text-slate-700 mb-3">Módulos de interesse:</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {MODULOS_DISPONIVEIS.map(modulo => {
                  const isChecked = interactionForm.modulos.includes(modulo);
                  return (
                    <label key={modulo} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${isChecked ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'} ${ui.isEditing ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default opacity-90'}`}>
                      <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleModulo(modulo)} disabled={!ui.isEditing} />
                      {modulo}
                    </label>
                  );
                })}
              </div>
              
              <label className="block text-sm font-bold text-slate-700 mb-2">Nova Observação</label>
              <textarea 
                className={`w-full flex-1 min-h-[120px] border rounded-xl p-4 text-sm focus:outline-none transition-all resize-none ${!ui.isEditing ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'border-slate-300 focus:ring-2 focus:ring-blue-500'}`}
                value={interactionForm.observacoes}
                onChange={(e) => setInteractionForm(p => ({ ...p, observacoes: e.target.value }))}
                placeholder="Descreva a interação..."
                disabled={loading.saving || !ui.isEditing}
              />

              {isFinished && ui.isEditing && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ação Rápida: Salvar e Alterar Status</span>
                  <div className="flex gap-2">
                    <button onClick={() => saveInteracao({ status: 'APROVADO' })} disabled={loading.saving} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold hover:bg-emerald-600 hover:text-white">
                      <CheckCircle2 size={14} /> Interessado
                    </button>
                    <button onClick={() => saveInteracao({ status: 'POSSIBILIDADE' })} disabled={loading.saving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white">
                      <Target size={14} /> Possibilidade
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Timeline historico={historico} loading={loading.historico} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-white shrink-0">
          {isFinished ? (
            <div className="flex justify-between items-center gap-4">
              <div className="text-sm text-slate-600">
                <span className="italic">Gerenciamento de Atendimento</span>
              </div>
              <div className="flex gap-3">
                {!ui.isEditing ? (
                  <>
                    <button onClick={() => setUi(p => ({ ...p, isEditing: true }))} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg border border-blue-200 hover:bg-blue-100">
                      <Edit3 size={16} /> Nova Interação
                    </button>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200">Fechar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setUi(p => ({ ...p, isEditing: false })); setInteractionForm(p => ({ ...p, observacoes: '' })); }} className="px-4 py-2 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button onClick={() => saveInteracao()} disabled={loading.saving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
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
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <div className="flex gap-2">
                <button onClick={() => finishAtendimento('REPROVADO')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50">
                  <XCircle size={16} /> Não interessado
                </button>
                <button onClick={() => finishAtendimento('RETORNAR')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-purple-200 text-purple-600 font-bold rounded-lg hover:bg-purple-50">
                  <Clock size={16} /> Retornar
                </button>
                <button onClick={() => finishAtendimento('POSSIBILIDADE')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-200 text-blue-600 font-bold rounded-lg hover:bg-blue-50">
                  <Target size={16} /> Possibilidade
                </button>
                <button onClick={() => finishAtendimento('APROVADO')} disabled={loading.saving} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">
                  <CheckCircle2 size={16} /> Interessado
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}