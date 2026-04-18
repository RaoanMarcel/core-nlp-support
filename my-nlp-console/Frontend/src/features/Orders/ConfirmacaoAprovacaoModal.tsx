import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  Loader2, 
  ShieldCheck
} from 'lucide-react';

interface ConfirmacaoAprovacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  data: {
    cliente: string;
    cnpj: string;
    valor: number;
    modulos: string[];
  };
}

export default function ConfirmacaoAprovacaoModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  data 
}: ConfirmacaoAprovacaoModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay com Blur conforme o protocolo de UI */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Confirmar Aprovação</h3>
              <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mt-0.5">
                Conversão de Orçamento para Pedido
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-blue-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="bg-gray-100 rounded-xl p-5 border border-slate-600/50 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <label className="text-[10px] text-slate-700 uppercase tracking-wider font-bold">Cliente</label>
                <p className="text-slate-500 font-medium text-lg leading-tight">{data.cliente}</p>
                <p className="text-slate-500 text-sm">{data.cnpj}</p>
              </div>
              <div className="text-right">
                <label className="text-[10px] text-slate-700 uppercase tracking-wider font-bold">Valor Total</label>
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-xl">
                  <span className="text-sm font-bold">R$</span>
                  {data.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-600/50">
              <label className="text-[10px] text-slate-700 uppercase tracking-wider font-bold block mb-2">Módulos Contratados</label>
              <div className="flex flex-wrap gap-2">
                {data.modulos.map((modulo) => (
                  <span 
                    key={modulo}
                    className="px-2.5 py-1 bg-indigo-800 text-blue-100 text-[11px] font-bold rounded-md border border-slate-700"
                  >
                    {modulo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-blue-200 text-sm text-center px-4 leading-relaxed">
            Ao confirmar, um novo Pedido será gerado e um Link de Assinatura será disponibilizado para envio ao cliente.
          </p>
        </div>

        {/* Footer / Actions */}
        <div className="p-6 bg-slate-800 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-sm font-bold text-blue-300 hover:text-white hover:bg-slate-800/40 rounded-xl transition-all border border-transparent disabled:opacity-50"
          >
            CANCELAR
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle2 size={20} />
                CONFIRMO OS DADOS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}