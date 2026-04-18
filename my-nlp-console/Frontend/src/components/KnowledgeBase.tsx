import React, { useState } from 'react';
import { 
  Search, BookOpen, Zap, Folder, Plus, 
  MoreVertical, Edit3, Trash2, FileText,
  Copy, CheckCircle2
} from 'lucide-react';

interface Macro {
  id: string;
  command: string;
  title: string;
  category: string;
  content: string;
}

interface Guide {
  id: string;
  title: string;
  category: string;
  content: string;
}

const mockData: { macros: Macro[], guides: Guide[] } = {
  macros: [
    { id: 'm1', command: 'reset_senha', title: 'Reset de Senha', category: 'Acesso', content: 'Olá! Entendo que você está com problemas de acesso. Enviamos um link de redefinição de senha para o seu e-mail cadastrado. Por favor, verifique sua caixa de entrada e a pasta de spam.' },
    { id: 'm2', command: 'prazo_bug', title: 'Prazo - Bug Crítico', category: 'Engenharia', content: 'Nossa equipe de engenharia já identificou o problema relatado e classificou como prioridade máxima. O tempo estimado de resolução é de 2 a 4 horas. Manteremos você atualizado por aqui.' },
    { id: 'm3', command: 'saudacao', title: 'Saudação Padrão', category: 'Geral', content: 'Olá! Como vai? Meu nome é [Seu Nome] e farei o possível para te ajudar com essa questão hoje.' },
    { id: 'm4', command: 'estorno_feito', title: 'Confirmação de Estorno', category: 'Financeiro', content: 'O estorno foi processado com sucesso em nosso sistema. O valor pode levar de 1 a 2 faturas para constar no seu cartão de crédito, dependendo da administradora.' },
  ],
  guides: [
    { id: 'g1', title: 'Checklist de Bug Crítico', category: 'Engenharia', content: '# Passos para Triagem\n\n1. Verifique se afeta múltiplos usuários (olhe o Datadog).\n2. Solicite prints ou gravação de tela do cliente.\n3. Escalone no canal `#eng-urgente` no Slack com o ID do ticket.\n4. Aplique a tag **"Escalonado"** e pause o SLA.' },
    { id: 'g2', title: 'Como lidar com estorno (Stripe)', category: 'Financeiro', content: '# Procedimento de Estorno\n\nAcesse o dashboard do Stripe, busque pelo email do cliente.\n\n- Verifique se a cobrança tem menos de 7 dias (Política de Arrependimento).\n- Se sim, clique em "Refund" e selecione "Requested by customer".\n- O sistema enviará o recibo automaticamente.' },
    { id: 'g3', title: 'Procedimento para Conta Invadida', category: 'Segurança', content: '# Bloqueio Preventivo\n\nBloqueie temporariamente o acesso do usuário no painel Admin. Peça para o cliente confirmar os últimos 4 dígitos do cartão cadastrado ou um documento de identidade válido. Só libere o reset após essa validação.' },
  ]
};

export default function KnowledgeBase() {
  const [activeSection, setActiveSection] = useState<'macros' | 'guides'>('macros');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>(mockData.macros[0].id);
  const [copied, setCopied] = useState(false);

  const activeList = activeSection === 'macros' ? mockData.macros : mockData.guides;
  
  const filteredList = activeList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Encontrando o item selecionado
  const selectedItem = activeList.find(item => item.id === selectedItemId) || filteredList[0];

  // Função para copiar conteúdo
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-[#f4f5f7] overflow-hidden font-sans">
      
      <div className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 h-20 flex items-center border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={22} className="text-blue-600" />
            Base Interna
          </h1>
        </div>

        <div className="p-4 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Biblioteca</h3>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => { setActiveSection('macros'); setSelectedItemId(mockData.macros[0].id); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection === 'macros' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Zap size={18} className={activeSection === 'macros' ? 'text-blue-600' : 'text-slate-400'} />
                Respostas Rápidas
              </button>
              
              <button 
                onClick={() => { setActiveSection('guides'); setSelectedItemId(mockData.guides[0].id); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection === 'guides' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText size={18} className={activeSection === 'guides' ? 'text-indigo-600' : 'text-slate-400'} />
                Guias e Manuais
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Categorias</h3>
            <div className="flex flex-col gap-1">
              {['Acesso', 'Engenharia', 'Financeiro', 'Geral'].map(cat => (
                <button key={cat} className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors group">
                  <Folder size={16} className="text-slate-400 group-hover:text-slate-600" />
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
        2. COLUNA CENTRAL (Lista de Itens)
        ======================================================== */}
      <div className="w-[320px] lg:w-[360px] bg-[#f8f9fa] border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 shrink-0 h-[80px] flex flex-col justify-center bg-white">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar em ${activeSection === 'macros' ? 'Respostas...' : 'Guias...'}`}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 no-scrollbar">
          <div className="px-2 pt-1 pb-2 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">{filteredList.length} itens encontrados</span>
            <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors">
              <Plus size={14} /> Novo
            </button>
          </div>

          {filteredList.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedItemId === item.id 
                  ? 'bg-white border-blue-300 shadow-sm ring-1 ring-blue-100' 
                  : 'bg-white border-transparent hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <h4 className={`text-sm font-bold truncate pr-2 ${selectedItemId === item.id ? 'text-blue-900' : 'text-slate-800'}`}>
                  {item.title}
                </h4>
                {/* FIX: Type assertion informando que o item é uma Macro */}
                {activeSection === 'macros' && (
                  <span className="shrink-0 text-[10px] font-mono font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    /{(item as Macro).command}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.content}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
          
          {filteredList.length === 0 && (
            <div className="text-center p-8">
              <p className="text-sm text-slate-500 font-medium">Nenhum resultado encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
        3. COLUNA DIREITA (Leitura / Detalhes do Item)
        ======================================================== */}
      <div className="flex-1 bg-white flex flex-col min-w-0">
        {selectedItem ? (
          <>
            {/* Header do Leitor */}
            <div className="h-20 px-8 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${
                  activeSection === 'macros' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {selectedItem.category}
                </span>
                {/* FIX: Type assertion informando que o selectedItem é uma Macro */}
                {activeSection === 'macros' && (
                  <span className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1">
                    Atalho: <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">/{(selectedItem as Macro).command}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopy(selectedItem.content)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm border ${
                    copied ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <><CheckCircle2 size={16} /> Copiado</> : <><Copy size={16} /> Copiar texto</>}
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                  <Edit3 size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Corpo do Leitor */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:px-20">
              <div className="max-w-3xl">
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-8 tracking-tight">
                  {selectedItem.title}
                </h2>
                
                <div className={`prose prose-slate max-w-none text-slate-700 leading-loose ${
                  activeSection === 'macros' ? 'bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200' : ''
                }`}>
                  {/* Se for macro, renderiza como texto simples. Se for guia, renderiza respeitando quebras (simulando Markdown) */}
                  {activeSection === 'macros' ? (
                    <p className="whitespace-pre-wrap text-[15px]">{selectedItem.content}</p>
                  ) : (
                    <div className="whitespace-pre-wrap text-[15px]">
                      {selectedItem.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <BookOpen size={48} className="mb-4 opacity-20" />
            <p className="font-medium text-slate-500">Selecione um item para visualizar</p>
          </div>
        )}
      </div>

    </div>
  );
}