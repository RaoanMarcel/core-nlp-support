// src/components/TicketQueue.tsx
import React, { useState } from 'react';
import { 
  Search, Clock, AlertTriangle, CheckCircle2, Bot, Reply, 
  MoreHorizontal, User, Paperclip, Image as ImageIcon, FileText, 
  Filter, SlidersHorizontal, Inbox, Forward, Info
} from 'lucide-react';

// ==========================================
// DADOS MOCKADOS (Sem tags inúteis, mantendo anexos)
// ==========================================
const mockTickets = [
  { 
    id: '#1042', subject: 'Falha fatal no Checkout (Pix)', email: 'carlos.e@empresa.com', category: 'Bug Crítico', assignee: 'João P.', waitTime: '4h 15m', sla: 'critical', status: 'Aberto',
    createdAt: 'Hoje, 10:42',
    aiSummary: 'Cliente relata erro 500 na tela de checkout via Pix. Log de sistema confirma timeout no gateway de pagamento.',
    timeline: [
      { 
        id: 1, type: 'message', sender: 'carlos.e@empresa.com', time: '10:42', 
        content: 'Olá, tentei realizar a compra do plano Pro três vezes usando o Pix e em todas as vezes a tela fica branca e recebo um erro 500 no console. Meu saldo não foi descontado, mas preciso disso urgente para a campanha de amanhã!' 
      },
      { 
        id: 2, type: 'system', time: '10:43', 
        content: 'Sistema detectou 3 tentativas falhas de transação (Gateway Timeout). ID do Log: #99281-A' 
      }
    ],
    attachments: [
      { name: 'erro_tela_branca.png', size: '1.2 MB', type: 'image' },
      { name: 'console_log.txt', size: '45 KB', type: 'doc' }
    ]
  },
  { 
    id: '#1047', subject: 'Gateway de pagamento retornando 500', email: 'dev@cliente.com', category: 'Bug Crítico', assignee: 'Ana S.', waitTime: '3h 40m', sla: 'warning', status: 'Resolvendo',
    createdAt: 'Hoje, 11:15',
    aiSummary: 'Relato de instabilidade na API de pagamentos. Possível correlação com o ticket #1042.',
    timeline: [
      { 
        id: 1, type: 'message', sender: 'dev@cliente.com', time: '11:15', 
        content: 'Nossos webhooks estão recebendo timeout ao tentar validar as transações de hoje. Podem verificar a latência do endpoint /v1/payments?' 
      }
    ],
    attachments: []
  },
];

export default function TicketQueue() {
  const [activeTab, setActiveTab] = useState('unassigned');
  const [selectedTicketId, setSelectedTicketId] = useState(mockTickets[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedTicket = mockTickets.find(t => t.id === selectedTicketId) || mockTickets[0];

  return (
    <div className="flex h-full w-full bg-[#f4f5f7] relative overflow-hidden">
      
      {/* ========================================================
        PAINEL ESQUERDO: BARRA RETRÁTIL (HOVER)
        ========================================================
      */}
      {/* Spacer fixo para manter o layout quando a barra estiver colapsada */}
      <div className="w-[80px] shrink-0 border-r border-slate-200 bg-white" />
      
      <div 
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        className={`absolute top-0 left-0 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-20 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] overflow-hidden ${
          isSidebarOpen ? 'w-[380px]' : 'w-[80px]'
        }`}
      >
        {/* Header do Inbox */}
        <div className="p-5 pb-0 shrink-0 h-[80px] flex items-center border-b border-slate-100">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Inbox size={20} />
            </div>
            <h1 className={`text-xl font-bold text-slate-900 tracking-tight transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              Caixa de Entrada
            </h1>
          </div>
        </div>

        {/* Barra de Busca + Filtros (Visível apenas expandida) */}
        <div className={`p-4 border-b border-slate-100 shrink-0 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar tickets..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors" title="Filtros Avançados">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Lista de Tickets */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {mockTickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all border-l-4 flex gap-4 ${
                selectedTicketId === ticket.id 
                  ? 'bg-blue-50/50 border-l-blue-600' 
                  : 'bg-white border-l-transparent hover:bg-slate-50'
              }`}
            >
              {/* Ícone colapsado / Avatar */}
              <div className="shrink-0 pt-1">
                {ticket.sla === 'critical' ? (
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><AlertTriangle size={18} /></div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><User size={18} /></div>
                )}
              </div>

              {/* Conteúdo expandido */}
              <div className={`flex-1 min-w-[240px] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-500">{ticket.id}</span>
                  {ticket.sla === 'critical' ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{ticket.waitTime}</span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">{ticket.waitTime}</span>
                  )}
                </div>
                <h3 className={`text-sm font-semibold truncate mb-1 ${selectedTicketId === ticket.id ? 'text-blue-900' : 'text-slate-900'}`}>
                  {ticket.subject}
                </h3>
                <p className="text-xs text-slate-500 truncate">{ticket.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
        MEIO: ÁREA DE CONVERSA PRINCIPAL
        ========================================================
      */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Topbar do Chat */}
        <div className="h-[80px] px-8 flex justify-between items-center border-b border-slate-200 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-900 truncate">{selectedTicket.subject}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-slate-700">{selectedTicket.email}</span> • Aberto {selectedTicket.createdAt}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Forward size={16} /> Encaminhar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <CheckCircle2 size={16} /> Marcar Resolvido
            </button>
          </div>
        </div>

        {/* Linha do Tempo de Mensagens */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/50">
          
          {/* Resumo IA */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-5 rounded-xl flex gap-4 shadow-sm">
            <div className="mt-0.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <Bot size={18} />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Resumo da Triagem IA</h4>
              <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
                {selectedTicket.aiSummary}
              </p>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex flex-col gap-4">
            {selectedTicket.timeline.map(item => (
              item.type === 'system' ? (
                <div key={item.id} className="flex justify-center my-2">
                  <div className="bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                    <Clock size={12} /> {item.time} - {item.content}
                  </div>
                </div>
              ) : (
                <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-900">{item.sender}</span>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Editor de Resposta */}
        <div className="p-6 bg-white border-t border-slate-200 shrink-0">
          <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all shadow-sm">
            <textarea 
              placeholder="Escreva sua resposta para o cliente..." 
              className="w-full p-4 h-24 resize-none text-sm focus:outline-none"
            />
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
              <div className="flex gap-3">
                <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors uppercase tracking-wide bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                  <Bot size={14} /> Sugerir Resposta
                </button>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                <Reply size={16} /> Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
        DIREITA: PAINEL DE CONTEXTO E ANEXOS (TERCEIRA COLUNA)
        ========================================================
      */}
      <div className="w-[300px] bg-[#f8f9fa] border-l border-slate-200 flex flex-col shrink-0 z-10 hidden lg:flex">
        <div className="h-[80px] px-6 flex items-center border-b border-slate-200 shrink-0 bg-white">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info size={16} className="text-slate-400" /> Detalhes do Ticket
          </h3>
        </div>

        <div className="p-6 flex flex-col gap-8 overflow-y-auto">
          
          {/* Seção Categoria */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Classificação</h4>
            <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg bg-rose-100 text-rose-700 border border-rose-200 inline-block">
              {selectedTicket.category}
            </span>
          </div>

          {/* Seção Anexos */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex justify-between items-center">
              Anexos 
              <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{selectedTicket.attachments.length}</span>
            </h4>
            
            {selectedTicket.attachments.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedTicket.attachments.map((file, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 flex items-start gap-3 hover:border-blue-400 transition-colors cursor-pointer group shadow-sm">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${file.type === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                      {file.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600">{file.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{file.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                <Paperclip size={20} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">Nenhum anexo</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}