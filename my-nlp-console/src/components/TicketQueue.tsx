// src/components/TicketQueue.tsx
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, MoreHorizontal } from 'lucide-react';

// ==========================================
// DADOS MOCKADOS E TIPAGENS
// ==========================================
const mockTickets = [
  { id: '#1042', subject: 'Falha fatal no Checkout (Pix)', email: 'carlos.e@empresa.com', category: 'Bug Crítico', accuracy: 98, assignee: 'Carlos E.', time: '4h 15m', status: 'Aberto' },
  { id: '#1043', subject: 'Dúvida sobre fechamento mensal', email: 'financeiro@loja.br', category: 'Dúvida', accuracy: 85, assignee: null, time: '2h 10m', status: 'Aberto' },
  { id: '#1044', subject: 'Erro de Login SSO', email: 'admin@corp.com', category: 'Autenticação', accuracy: 92, assignee: 'Ana S.', time: '1h 45m', status: 'Resolvendo' },
  { id: '#1045', subject: 'Lentidão severa ao emitir NFe', email: 'logistica@empresa.com', category: 'Performance', accuracy: 88, assignee: 'Ana S.', time: '1h 10m', status: 'Resolvendo' },
  { id: '#1046', subject: 'Como exportar relatórios para PDF?', email: 'user@cliente.com', category: 'Dúvida', accuracy: 95, assignee: null, time: '55m', status: 'Aberto' },
  { id: '#1047', subject: 'Gateway de pagamento retornando 500', email: 'dev@cliente.com', category: 'Bug Crítico', accuracy: 99, assignee: 'João P.', time: '40m', status: 'Aberto' },
  { id: '#1048', subject: 'Troca de plano não reflete no sistema', email: 'comercial@loja.br', category: 'Faturamento', accuracy: 76, assignee: 'Carlos E.', time: '35m', status: 'Fechado' },
  { id: '#1049', subject: 'API de Webhooks disparando duplicado', email: 'integracoes@tech.io', category: 'Performance', accuracy: 82, assignee: null, time: '20m', status: 'Aberto' },
  { id: '#1050', subject: 'Botão de salvar inativo na tela de perfil', email: 'joao@email.com', category: 'Bug Leve', accuracy: 91, assignee: 'Ana S.', time: '12m', status: 'Aberto' },
  { id: '#1051', subject: 'Esqueci minha senha', email: 'maria@email.com', category: 'Autenticação', accuracy: 99, assignee: null, time: '5m', status: 'Resolvido' },
];

const PILL_FILTERS = [
  { id: 'all', label: 'Todos os Tickets', count: 142 },
  { id: 'open', label: 'Abertos', count: 12 },
  { id: 'critical', label: 'Bugs Críticos', count: 3 },
  { id: 'sla', label: 'SLA Ameaçado', count: 2 },
];

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
function CategoryBadge({ category }: { category: string }) {
  if (category.includes('Crítico')) return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-100 text-rose-700 border border-rose-200">{category}</span>;
  if (category === 'Autenticação') return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-100 text-sky-700 border border-sky-200">{category}</span>;
  if (category === 'Dúvida') return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">{category}</span>;
  if (category === 'Performance') return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-100 text-amber-700 border border-amber-200">{category}</span>;
  return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200">{category}</span>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Resolvido' || status === 'Fechado') return <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600"><CheckCircle2 size={12}/>{status}</span>;
  if (status === 'Resolvendo') return <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600"><MoreHorizontal size={12}/>{status}</span>;
  return <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500"><AlertCircle size={12}/>{status}</span>;
}

// ==========================================
// TELA PRINCIPAL: FILA DE TICKETS
// ==========================================
export default function TicketQueue() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Toggle Checkbox Principal (Selecionar Todos)
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedTickets(mockTickets.map(t => t.id));
    else setSelectedTickets([]);
  };

  // Toggle Checkbox Individual
  const handleSelectOne = (id: string) => {
    setSelectedTickets(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8f9f9]">
      
      {/* HEADER FIXO */}
      <div className="px-8 pt-8 pb-4 shrink-0 border-b border-[#d8dcde] bg-[#f8f9f9]">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2f3941] tracking-tight">Fila de Tickets</h1>
            <p className="text-sm font-medium text-[#68737d] mt-1">Todos os tickets triados pela Inteligência Artificial.</p>
          </div>
        </div>

        {/* Barra de Busca Generosa */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-[#68737d]" />
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar por ID, Assunto ou E-mail do solicitante..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#d8dcde] rounded-lg text-sm text-[#2f3941] placeholder:text-[#68737d] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-sm transition-shadow"
          />
        </div>

        {/* Filtros Rápidos (Pills) & Bulk Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {PILL_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeFilter === filter.id 
                    ? 'bg-slate-800 text-white border border-slate-800' 
                    : 'bg-white text-[#68737d] border border-[#d8dcde] hover:bg-slate-50 hover:text-[#2f3941]'
                }`}
              >
                {filter.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === filter.id ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-500'}`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              disabled={selectedTickets.length === 0}
              className="px-4 py-1.5 text-xs font-semibold rounded border border-[#d8dcde] bg-white text-[#2f3941] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Atribuir a mim
            </button>
            <button 
              disabled={selectedTickets.length === 0}
              className="px-4 py-1.5 text-xs font-semibold rounded border border-[#d8dcde] bg-white text-[#2f3941] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Marcar Resolvido
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DA TABELA SCROLLÁVEL */}
      <div className="flex-1 overflow-auto p-8 pt-6">
        <div className="bg-white border border-[#d8dcde] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              
              {/* CABEÇALHO */}
              <thead>
                <tr className="bg-slate-50/50 border-b border-[#d8dcde]">
                  <th className="py-3 px-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      checked={selectedTickets.length === mockTickets.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#68737d] uppercase tracking-wider w-20">ID</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#68737d] uppercase tracking-wider">Assunto / Solicitante</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#68737d] uppercase tracking-wider">Triagem IA</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#68737d] uppercase tracking-wider w-32">Acurácia</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#68737d] uppercase tracking-wider">Responsável</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#68737d] uppercase tracking-wider text-right">Tempo</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#68737d] uppercase tracking-wider w-28">Status</th>
                </tr>
              </thead>
              
              {/* CORPO DA TABELA */}
              <tbody className="text-sm">
                {mockTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className={`border-b border-slate-100 hover:bg-[#f3f4f4] transition-colors cursor-pointer group ${selectedTickets.includes(ticket.id) ? 'bg-slate-50' : ''}`}
                    onClick={() => handleSelectOne(ticket.id)}
                  >
                    <td className="py-2.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => handleSelectOne(ticket.id)}
                      />
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-[#68737d]">{ticket.id}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-[#2f3941] group-hover:text-blue-600 transition-colors">{ticket.subject}</div>
                      <div className="text-[11px] text-[#68737d] mt-0.5">{ticket.email}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <CategoryBadge category={ticket.category} />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#2f3941] w-8">{ticket.accuracy}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${ticket.accuracy > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${ticket.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-white">
                            {ticket.assignee.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-[#2f3941]">{ticket.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-[#68737d] italic">Não atribuído</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-xs font-medium text-[#68737d]">
                      {ticket.time}
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* RODAPÉ E PAGINAÇÃO */}
          <div className="px-6 py-4 border-t border-[#d8dcde] bg-slate-50 flex justify-between items-center">
            <span className="text-xs font-medium text-[#68737d]">
              Mostrando <span className="font-bold text-[#2f3941]">1</span> a <span className="font-bold text-[#2f3941]">10</span> de <span className="font-bold text-[#2f3941]">142</span> tickets
            </span>
            <div className="flex gap-1">
              <button className="p-1.5 rounded text-[#68737d] hover:bg-slate-200 hover:text-[#2f3941] transition-colors disabled:opacity-50">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 rounded text-[#68737d] hover:bg-slate-200 hover:text-[#2f3941] transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}