// src/components/BairroDropdown.tsx
import React from 'react';

interface BairroDropdownProps {
  value: string;
  onChange: (value: string) => void;
  bairros?: string[]; // Pode ser injetado da sua API ou arquivo de constantes
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const BairroDropdown: React.FC<BairroDropdownProps> = ({ 
  value, 
  onChange, 
  bairros = [], 
  disabled = false,
  className = '',
  error
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label className="mb-1 text-sm font-semibold text-slate-700">
        Bairro
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || bairros.length === 0}
        className={`
          p-2.5 border rounded-lg bg-white outline-none transition-all
          focus:ring-2 focus:ring-blue-600 focus:border-transparent
          disabled:bg-slate-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-slate-300'}
        `}
      >
        <option value="" disabled>
          {bairros.length === 0 ? 'Carregando bairros...' : 'Selecione um bairro...'}
        </option>
        
        {bairros.map((bairro, index) => (
          <option key={`${bairro}-${index}`} value={bairro}>
            {bairro}
          </option>
        ))}
      </select>

      {error && (
        <span className="mt-1 text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};