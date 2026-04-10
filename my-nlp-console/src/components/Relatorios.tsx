// src/components/Relatorios.tsx
import React, { useState } from 'react';
import { 
  Calendar, Zap, BarChart2, Bot, Download, 
  LayoutDashboard, TableProperties, Info, FileSpreadsheet 
} from 'lucide-react';

// ==========================================
// OPÇÕES DO CONSTRUTOR DE RELATÓRIOS
// ==========================================
const DIMENSIONS = [
  { id: 'categoria', label: 'Categoria da IA' },
  { id: 'status', label: 'Status' },
  { id: 'atendente', label: 'Atendente' },
];

const METRICS = [
  { id: 'volume', label: 'Volume Total' },
  { id: 'mttr', label: 'Tempo Médio (MTTR)' },
  { id: 'reabertura', label: 'Taxa de Reabertura (%)' },
];

export default function Relatorios() {
  // Estados para o Construtor Customizado
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['categoria']);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['volume']);
  
  // Estados para o Filtro de Data
  const [startDate, setStartDate] = useState('2024-02-01');
  const [endDate, setEndDate] = useState('2024-02-15');

  // Handlers para os Checkboxes (Atualização em tempo real)
  const toggleDimension = (id: string) => {
    setSelectedDimensions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleMetric = (id: string) => {
    setSelectedMetrics(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Regra para exibir a tabela: precisa de pelo menos 1 dimensão e 1 métrica
  const showTable = selectedDimensions.length > 0 && selectedMetrics.length > 0;

  return (
    <div className="flex-1 h-full bg-[#f8f9f9] overflow-y-auto p-4 md:p-8 font-sans">
      
      {/* ========================================================
        CABEÇALHO
        ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Relatórios e Exportação</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Analise o desempenho da operação ou crie visualizações personalizadas.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-[#d8dcde] hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
          Últimos 30 dias <Calendar size={16} className="text-slate-400 ml-1" />
        </button>
      </div>

      {/* ========================================================
        SESSÃO 1: TEMPLATES PRONTOS (Relatórios Rápidos)
        ======================================================== */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Relatórios Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button className="flex flex-col text-left p-5 bg-white border border-[#d8dcde] hover:border-blue-400 hover:shadow-md rounded-xl transition-all group">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              <Zap size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Eficiência da Operação</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Analise o cumprimento de SLA e o Tempo Médio de Resolução (MTTR).</p>
          </button>

          <button className="flex flex-col text-left p-5 bg-white border border-[#d8dcde] hover:border-blue-400 hover:shadow-md rounded-xl transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <BarChart2 size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Volume de Tickets</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Totais recebidos agrupados por dia, categoria e canal de origem.</p>
          </button>

          <button className="flex flex-col text-left p-5 bg-white border border-[#d8dcde] hover:border-blue-400 hover:shadow-md rounded-xl transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <Bot size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Performance da IA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Taxa de acurácia preditiva e volume de intervenções manuais.</p>
          </button>

        </div>
      </div>

      {/* ========================================================
        SESSÃO 2: CONSTRUTOR DE RELATÓRIOS ("Monte seu lanche")
        ======================================================== */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <LayoutDashboard size={16} /> Construtor de Relatório Customizado
        </h2>
        
        <div className="bg-white border border-[#d8dcde] rounded-xl shadow-sm flex flex-col md:flex-row min-h-[480px] overflow-hidden">
          
          {/* COLUNA ESQUERDA: AS OPÇÕES */}
          <div className="w-full md:w-[320px] bg-[#fafafa] border-r border-[#d8dcde] p-6 flex flex-col shrink-0">
            
            {/* NOVO: Filtro de Data */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Período <span className="text-[10px] font-normal text-slate-500">(Filtro)</span></h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Inicial</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Final</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#d8dcde] mb-6" />

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Dimensões <span className="text-[10px] font-normal text-slate-500">(O que agrupar?)</span></h3>
              <div className="space-y-2.5">
                {DIMENSIONS.map(dim => (
                  <label key={dim.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedDimensions.includes(dim.id)}
                      onChange={() => toggleDimension(dim.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer transition-all"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{dim.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Métricas <span className="text-[10px] font-normal text-slate-500">(O que contar?)</span></h3>
              <div className="space-y-2.5">
                {METRICS.map(metric => (
                  <label key={metric.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => toggleMetric(metric.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer transition-all"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: O RESULTADO */}
          <div className="flex-1 p-6 flex flex-col bg-white">
            {!showTable ? (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 fade-in">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <TableProperties size={32} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Área de Visualização</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Selecione pelo menos uma <strong>Dimensão</strong> e uma <strong>Métrica</strong> na barra lateral para montar sua tabela.
                </p>
              </div>
            ) : (
              // Data Grid Simulado (Reativo)
              <div className="flex flex-col h-full fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Prévia dos Dados</h3>
                    {/* Feedback visual do período selecionado */}
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      Mostrando dados de {startDate.split('-').reverse().join('/')} até {endDate.split('-').reverse().join('/')}
                    </p>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-blue-200/50">
                    <Download size={14} /> Baixar CSV
                  </button>
                </div>
                
                <div className="overflow-x-auto border border-[#d8dcde] rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#d8dcde]">
                        {selectedDimensions.map(d => (
                          <th key={d} className="py-2.5 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-[#d8dcde] last:border-r-0 bg-slate-50/80">
                            {DIMENSIONS.find(x => x.id === d)?.label}
                          </th>
                        ))}
                        {selectedMetrics.map(m => (
                          <th key={m} className="py-2.5 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-[#d8dcde] last:border-r-0 text-right bg-blue-50/30">
                            {METRICS.find(x => x.id === m)?.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8dcde]">
                      {/* Linha Falsa 1 */}
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        {selectedDimensions.map((d, i) => <td key={`row1-${i}`} className="py-3 px-4 text-sm text-slate-700 border-r border-[#d8dcde] last:border-r-0">Dado Exemplo A</td>)}
                        {selectedMetrics.map((m, i) => <td key={`row1-m-${i}`} className="py-3 px-4 text-sm font-bold text-slate-900 border-r border-[#d8dcde] last:border-r-0 text-right">1.245</td>)}
                      </tr>
                      {/* Linha Falsa 2 */}
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        {selectedDimensions.map((d, i) => <td key={`row2-${i}`} className="py-3 px-4 text-sm text-slate-700 border-r border-[#d8dcde] last:border-r-0">Dado Exemplo B</td>)}
                        {selectedMetrics.map((m, i) => <td key={`row2-m-${i}`} className="py-3 px-4 text-sm font-bold text-slate-900 border-r border-[#d8dcde] last:border-r-0 text-right">832</td>)}
                      </tr>
                      {/* Linha Falsa 3 */}
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        {selectedDimensions.map((d, i) => <td key={`row3-${i}`} className="py-3 px-4 text-sm text-slate-700 border-r border-[#d8dcde] last:border-r-0">Dado Exemplo C</td>)}
                        {selectedMetrics.map((m, i) => <td key={`row3-m-${i}`} className="py-3 px-4 text-sm font-bold text-slate-900 border-r border-[#d8dcde] last:border-r-0 text-right">412</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-start sm:items-center text-[11px] text-slate-500 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Info size={14} className="shrink-0 text-slate-400" />
                  <span>Esta é apenas uma prévia das primeiras linhas do período selecionado. Baixe o CSV para acessar a extração completa.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
        SESSÃO 3: EXPORTAÇÃO DE DADOS (Treinamento IA)
        ======================================================== */}
      <div>
        <div className="bg-white border-2 border-emerald-600/20 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group hover:border-emerald-600/40 transition-colors">
          {/* Decoração de fundo sutil */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex gap-4 items-start z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-1">Exportar Logs para Retreinamento da IA</h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Baixe o histórico bruto de tickets corrigidos pelos humanos. Este dataset já vem higienizado e formatado para realizar o fine-tuning do seu modelo offline.
              </p>
            </div>
          </div>

          <button className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm z-10">
            <Download size={18} /> Exportar Base de Treinamento (.xlsx)
          </button>
        </div>
      </div>

    </div>
  );
}