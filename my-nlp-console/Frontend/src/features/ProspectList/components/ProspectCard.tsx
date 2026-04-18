import React from 'react';
import { RefreshCw, MapPin, Phone } from 'lucide-react';
import type { Prospect } from '../../../types/prospect.types';
import { getCardStyle, getBadgeStyle } from '../utils/prospectStyles';

interface Props {
  prospect: Prospect;
  onClick: (prospect: Prospect) => void;
}

export function ProspectCard({ prospect, onClick }: Props) {
  return (
    <div 
      onClick={() => onClick(prospect)}
      className={`flex flex-col p-5 rounded-xl border shadow-sm transition-all duration-200 ${getCardStyle(prospect.status)}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(prospect.status)}`}>
          {prospect.status.replace('_', ' ')}
        </span>
        {prospect.status === 'EM_ATENDIMENTO' && prospect.lockedBy && (
          <span 
            className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded max-w-30"
            title={`Sendo atendido por: ${prospect.lockedBy}`}
          >
            <RefreshCw size={10} className="animate-spin shrink-0" />
            <span className="truncate">{prospect.lockedBy}</span>
          </span>
        )}
      </div>
      
      <div className="mb-4 flex-1">
        <h3 className="text-base font-bold text-slate-900 leading-tight mb-0.5 line-clamp-1" title={prospect.nome}>
          {prospect.nome}
        </h3>
        
        <div className="flex items-center gap-2 mb-2 mt-2">
          <p className="text-xs font-medium text-slate-500 font-mono">
            {prospect.cnpj}
          </p>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
            prospect.clienteWLE 
              ? 'bg-blue-100 text-blue-700 border-blue-200' 
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            WLE: {prospect.clienteWLE ? 'Sim' : 'Não'}
          </span>
        </div>
        
        {prospect.bairro && (
          <div className="flex items-center gap-1 mt-2 text-slate-500">
            <MapPin size={12} />
            <span className="text-[11px] font-medium truncate">{prospect.bairro}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-slate-100/80 mt-auto">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Phone size={14} className="text-slate-400" />
          <span className="text-xs font-semibold">{prospect.telefone}</span>
        </div>
      </div>
    </div>
  );
}