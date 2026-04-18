import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProspectCard } from './ProspectCard';
import type { Prospect } from '../../../types/prospect.types';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  data: Prospect[];
  emptyMessage: string;
  onCardClick: (prospect: Prospect) => void;
}

export function PaginatedSection({ title, icon, data, emptyMessage, onCardClick }: SectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);
  const itemsPerPage = 6; 

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div className="mb-8 bg-white/40 p-2 rounded-2xl border border-transparent hover:border-slate-200 transition-colors">
      <div 
        className="flex items-center justify-between p-2 cursor-pointer rounded-xl hover:bg-slate-100/80 transition-all select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
            {data.length}
          </span>
        </div>
        
        <div className="text-slate-400 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 px-2 pb-2 animate-in fade-in duration-300">
          {data.length === 0 ? (
            <div className="bg-white/50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <p className="text-slate-500 font-medium text-sm">{emptyMessage}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedData.map((prospect) => (
                  <ProspectCard key={prospect.id} prospect={prospect} onClick={onCardClick} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 mt-4">
                  <span className="text-xs text-slate-500 font-medium">
                    Pág. <strong className="text-slate-900">{currentPage}</strong> de <strong className="text-slate-900">{totalPages}</strong>
                  </span>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                    >
                      <ChevronLeft size={16} className="text-slate-600" />
                    </button>
                    
                    {/* Simples paginação numérica omitida por espaço, mas preservando botoes principais */}
                    <div className="flex items-center px-2 text-sm font-bold text-blue-600">
                        {currentPage}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                    >
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}