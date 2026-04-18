import React from 'react';
import { 
  Download, LayoutDashboard, TableProperties, FileSpreadsheet,
  Loader2, Play, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useReports } from './hooks/useReports';
import { REPORT_MODULES, ITEMS_PER_PAGE } from './constants';

export default function Relatorios() {
  const { state, actions } = useReports();

  return (
    <div className="flex-1 h-full bg-[#f8f9f9] overflow-y-auto p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Relatórios e Exportação</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Construa visualizações personalizadas cruzando os dados da operação.
          </p>
        </div>
      </div>

      {/* CONSTRUTOR DE RELATÓRIOS */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <LayoutDashboard size={16} /> Construtor
        </h2>
        
        <div className="bg-white border border-[#d8dcde] rounded-xl shadow-sm flex flex-col md:flex-row min-h-125 overflow-hidden">
          
          {/* SIDEBAR DE CONFIGURAÇÃO */}
          <div className="w-full md:w-[320px] bg-[#fafafa] border-r border-[#d8dcde] p-6 flex flex-col shrink-0 h-150 overflow-y-auto">
            
            <div className="mb-6">
              <label className="text-sm font-bold text-slate-900 block mb-2">Base de Dados</label>
              <select 
                value={state.selectedModule}
                onChange={(e) => state.setSelectedModule(e.target.value)}
                className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {Object.entries(REPORT_MODULES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <hr className="border-[#d8dcde] mb-6" />

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Período <span className="text-[10px] font-normal text-slate-500">(Filtro)</span></h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Inicial</label>
                  <input 
                    type="date" value={state.startDate} onChange={(e) => state.setStartDate(e.target.value)}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Final</label>
                  <input 
                    type="date" value={state.endDate} onChange={(e) => state.setEndDate(e.target.value)}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#d8dcde] mb-6" />

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Agrupar por <span className="text-[10px] font-normal text-slate-500">(Dimensões)</span></h3>
                <button 
                  onClick={actions.handleToggleAllDimensions}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                >
                  {state.selectedDimensions.length === state.moduleConfig.dimensions.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
              </div>
              <div className="space-y-2.5">
                {state.moduleConfig.dimensions.map(dim => (
                  <label key={dim.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" checked={state.selectedDimensions.includes(dim.id)} onChange={() => actions.toggleDimension(dim.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 transition-all shrink-0"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate">{dim.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex-1 mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Calcular <span className="text-[10px] font-normal text-slate-500">(Métricas)</span></h3>
              <div className="space-y-2.5">
                {state.moduleConfig.metrics.map(metric => (
                  <label key={metric.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" checked={state.selectedMetrics.includes(metric.id)} onChange={() => actions.toggleMetric(metric.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 transition-all shrink-0"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={actions.handleGerarPrevia}
              disabled={!state.canGenerate || state.isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {state.isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Play size={16} fill="currentColor"/> Gerar Prévia</>}
            </button>
          </div>

          {/* COLUNA DIREITA: RESULTADOS */}
          <div className="flex-1 p-6 flex flex-col bg-white overflow-hidden">
            {!state.hasPreview ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <TableProperties size={32} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Área de Visualização</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Selecione os campos na barra lateral e clique em <strong>Gerar Prévia</strong>.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Resultado da Consulta</h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      Mostrando {state.reportData.length} linhas totais agrupadas.
                    </p>
                  </div>
                  <button 
                    onClick={actions.handleDownloadXLSX}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-blue-200/50"
                  >
                    <Download size={14} /> Baixar XLSX Completo
                  </button>
                </div>
                
                {/* TABELA */}
                <div className="overflow-auto flex-1 border border-[#d8dcde] rounded-t-lg">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-[#d8dcde]">
                        {state.selectedDimensions.map(d => (
                          <th key={d} className="py-2.5 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-[#d8dcde] last:border-r-0">
                            {state.moduleConfig.dimensions.find(x => x.id === d)?.label}
                          </th>
                        ))}
                        {state.selectedMetrics.map(m => (
                          <th key={m} className="py-2.5 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-[#d8dcde] last:border-r-0 text-right bg-blue-50/30">
                            {state.moduleConfig.metrics.find(x => x.id === m)?.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8dcde]">
                      {state.paginatedData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                          {state.selectedDimensions.map(d => (
                            <td key={`dim-${d}`} className="py-3 px-4 text-sm text-slate-700 border-r border-[#d8dcde] last:border-r-0">
                              {row[d]}
                            </td>
                          ))}
                          {state.selectedMetrics.map(m => (
                            <td key={`met-${m}`} className="py-3 px-4 text-sm font-bold text-slate-900 border-r border-[#d8dcde] last:border-r-0 text-right">
                              {row[m]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {state.reportData.length === 0 && (
                        <tr>
                          <td colSpan={state.selectedDimensions.length + state.selectedMetrics.length} className="py-8 text-center text-sm text-slate-500">
                            Nenhum dado encontrado para este período e filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINAÇÃO */}
                {state.reportData.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border border-t-0 border-[#d8dcde] bg-slate-50 rounded-b-lg">
                    <div className="text-xs text-slate-500">
                      Mostrando <span className="font-bold text-slate-700">{state.startIndex + 1}</span> até <span className="font-bold text-slate-700">{Math.min(state.startIndex + ITEMS_PER_PAGE, state.reportData.length)}</span> de <span className="font-bold text-slate-700">{state.reportData.length}</span> resultados
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => state.setCurrentPage((p: number) => Math.max(1, p - 1))}
                        disabled={state.currentPage === 1}
                        className="p-1.5 rounded-md border border-[#d8dcde] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-medium text-slate-600 px-2">
                        Página {state.currentPage} de {state.totalPages}
                      </span>
                      <button
                        onClick={() => state.setCurrentPage((p: number) => Math.min(state.totalPages, p + 1))}
                        disabled={state.currentPage === state.totalPages || state.totalPages === 0}
                        className="p-1.5 rounded-md border border-[#d8dcde] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SESSÃO 3: EXPORTAÇÃO DE LOGS (MOCK) */}
      <div>
        <div className="bg-white border-2 border-emerald-600/20 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group hover:border-emerald-600/40 transition-colors">
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