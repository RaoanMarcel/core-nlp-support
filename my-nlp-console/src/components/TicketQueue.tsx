import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, AlertTriangle, User, 
  ChevronLeft, Forward, CheckCircle2, Bot, 
  Clock, Reply, Info, Image as ImageIcon, 
  FileText, Paperclip 
} from 'lucide-react';

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
  const location = useLocation();
  
  const [selectedTicketId, setSelectedTicketId] = useState(mockTickets[0].id);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Lê o ID que veio do Dashboard e atualiza o estado
  useEffect(() => {
    if (location.state && location.state.selectedTicketId) {
      setSelectedTicketId(location.state.selectedTicketId);
      setShowMobileChat(true); // Já abre o chat direto no mobile
    }
  }, [location.state]);
  
  // Encontra o objeto completo do ticket baseado no ID selecionado
  const selectedTicket = mockTickets.find(t => t.id === selectedTicketId) || mockTickets[0];

  return (
    <div className="flex h-full w-full bg-[#f4f5f7] overflow-hidden font-sans">
      
      {/* ========================================================
        1. FILA DE TICKETS (INBOX)
        ======================================================== */}
      <div className={`
        ${showMobileChat ? 'hidden md:flex' : 'flex'}
        w-full md:w-[360px] bg-white border-r border-slate-200 flex-col z-10 shrink-0 h-full
      `}>
        <div className="p-4 md:p-5 pb-0 shrink-0 h-[70px] md:h-[80px] flex items-center border-b border-slate-100">
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Fila de Atendimento</h1>
        </div>

        <div className="p-3 md:p-4 border-b border-slate-100 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar tickets..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors" title="Filtros Avançados">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {mockTickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => {
                setSelectedTicketId(ticket.id);
                setShowMobileChat(true); 
              }}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all border-l-4 flex gap-3 ${
                selectedTicketId === ticket.id 
                  ? 'bg-blue-50 border-l-blue-600' 
                  : 'bg-white border-l-transparent hover:bg-slate-50'
              }`}
            >
              <div className="shrink-0 pt-0.5">
                {ticket.sla === 'critical' ? (
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><AlertTriangle size={14} /></div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><User size={14} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-500">{ticket.id}</span>
                  {ticket.sla === 'critical' ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{ticket.waitTime}</span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">{ticket.waitTime}</span>
                  )}
                </div>
                <h3 className={`text-sm font-semibold truncate mb-0.5 ${selectedTicketId === ticket.id ? 'text-blue-900' : 'text-slate-900'}`}>
                  {ticket.subject}
                </h3>
                <p className="text-xs text-slate-500 truncate">{ticket.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
        2. ÁREA DE CONVERSA (CHAT)
        ======================================================== */}
      <div className={`
        ${!showMobileChat ? 'hidden md:flex' : 'flex'}
        flex-1 flex-col min-w-0 bg-white h-full
      `}>
        <div className="h-[70px] md:h-[80px] px-4 md:px-8 flex justify-between items-center border-b border-slate-200 shrink-0 gap-2">
          
          <div className="flex items-center gap-2 md:gap-0 min-w-0">
            <button 
              onClick={() => setShowMobileChat(false)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex flex-col min-w-0">
              <h2 className="text-base md:text-xl font-black text-slate-900 truncate">{selectedTicket.subject}</h2>
              <p className="text-[11px] md:text-xs text-slate-500 flex items-center gap-1 md:gap-2 mt-0.5 truncate">
                <span className="font-semibold text-slate-700 truncate max-w-[120px] md:max-w-none">{selectedTicket.email}</span> 
                <span className="hidden sm:inline">•</span> 
                <span className="truncate">Aberto {selectedTicket.createdAt}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Forward size={16} /> <span className="hidden md:inline">Encaminhar</span>
            </button>
            <button className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <CheckCircle2 size={16} /> <span className="hidden sm:inline">Resolver</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 bg-slate-50/50">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 md:p-5 rounded-xl flex gap-3 md:gap-4 shadow-sm">
            <div className="mt-0.5 shrink-0">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Bot size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
            </div>
            <div>
              <h4 className="text-[11px] md:text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Resumo da Triagem IA</h4>
              <p className="text-xs md:text-sm text-blue-900/80 leading-relaxed font-medium">
                {selectedTicket.aiSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {selectedTicket.timeline.map(item => (
              item.type === 'system' ? (
                <div key={item.id} className="flex justify-center my-2">
                  <div className="bg-white border border-slate-200 rounded-full px-3 py-1.5 md:px-4 md:py-1.5 text-[10px] md:text-xs text-slate-500 flex items-center gap-2 shadow-sm text-center">
                    <Clock size={12} className="shrink-0" /> {item.time} - {item.content}
                  </div>
                </div>
              ) : (
                <div key={item.id} className="bg-white border border-slate-200 p-4 md:p-6 rounded-xl shadow-sm relative">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <span className="text-xs md:text-sm font-bold text-slate-900">{item.sender}</span>
                    <span className="text-[10px] md:text-xs text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 bg-white border-t border-slate-200 shrink-0">
          <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
            <textarea 
              placeholder="Escreva sua resposta..." 
              className="w-full p-3 md:p-4 h-20 md:h-24 resize-none text-xs md:text-sm focus:outline-none"
            />
            <div className="bg-slate-50 px-3 md:px-4 py-2.5 md:py-3 border-t border-slate-200 flex justify-between items-center">
              <div className="flex gap-2 md:gap-3">
                <button className="text-[10px] md:text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors uppercase tracking-wide bg-blue-50 px-2 md:px-3 py-1.5 rounded-lg border border-blue-100">
                  <Bot size={14} /> <span className="hidden sm:inline">Sugerir Resposta</span><span className="sm:hidden">Sugerir</span>
                </button>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:px-5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-colors shadow-sm">
                <Reply size={16} /> Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
        3. DIREITA: DETALHES E ANEXOS (Apenas Desktop/Lg)
        ======================================================== */}
      <div className="w-[300px] bg-[#f8f9fa] border-l border-slate-200 flex-col shrink-0 hidden lg:flex h-full">
        <div className="h-[80px] px-6 flex items-center border-b border-slate-200 shrink-0 bg-white">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info size={16} className="text-slate-400" /> Detalhes
          </h3>
        </div>

        <div className="p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Classificação</h4>
            <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg bg-rose-100 text-rose-700 border border-rose-200 inline-block">
              {selectedTicket.category}
            </span>
          </div>

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