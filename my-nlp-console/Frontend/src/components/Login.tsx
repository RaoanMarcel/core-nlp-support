import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  X 
} from 'lucide-react';

import logoSvg from '../assets/logo.svg?url';

// Utilizando variável de ambiente do Vite com fallback para a URL de produção
const API_URL = import.meta.env.VITE_API_URL || 'https://core-nlp-support.onrender.com';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

// Tipagens para as respostas da API
interface LoginResponse {
  token?: string;
  user?: any;
  error?: string;
  requirePasswordChange?: boolean;
  message?: string;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Estados do Formulário
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados de Controle de UI
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [modoTrocaSenha, setModoTrocaSenha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Limpa o erro ao digitar
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (erro) setErro('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErro('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.token && data.user) {
        localStorage.setItem('@CRM:token', data.token);
        localStorage.setItem('@CRM:user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else if (response.status === 403 && data.requirePasswordChange) {
        setModoTrocaSenha(true);
      } else {
        setErro(data.error || 'Credenciais inválidas.');
      }
    } catch (error) {
      setErro('Erro na conexão com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas digitadas não conferem!');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErro('');

    try {
      const response = await fetch(`${API_URL}/auth/primeiro-acesso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senhaAtual: senha, novaSenha })
      });
      
      const data: LoginResponse = await response.json();
      
      if (response.ok && data.token && data.user) {
        localStorage.setItem('@CRM:token', data.token);
        localStorage.setItem('@CRM:user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else {
        setErro(data.error || 'Erro ao atualizar a senha.');
      }
    } catch (error) {
      setErro('Erro na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelarTrocaSenha = () => {
    setModoTrocaSenha(false);
    setNovaSenha('');
    setConfirmarSenha('');
    setErro('');
  };

  // Classes extraídas para manter o JSX limpo
  const inputClass = "block w-full px-10 pt-6 pb-2 text-sm text-slate-900 bg-white/50 border border-slate-200/60 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 peer transition-all backdrop-blur-sm";
  const labelClass = "absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-600 pointer-events-none";

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden bg-[#f8fafc]">
      
      {/* --- ELEMENTOS DE FUNDO (MESH GRADIENT) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-600/10 rounded-full blur-[80px]" />

      {/* --- CARD PRINCIPAL --- */}
      <div className="w-full max-w-md relative group">
        
        {/* Glow atrás do card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 p-8 overflow-hidden">
          
          {/* Detalhe Decorativo Interno */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/5 rounded-full" />

          {/* Barra de Progresso */}
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-50 overflow-hidden z-20">
              <div className="w-full h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-progress origin-left"></div>
            </div>
          )}

          {/* Toast de Erro */}
          {erro && (
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-3 bg-white border-l-4 border-rose-500 text-rose-600 px-4 py-3 rounded-r-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[11px] font-bold flex-1 leading-tight">{erro}</p>
              <button 
                type="button" 
                onClick={() => setErro('')} 
                className="hover:bg-rose-50 p-1 rounded-lg transition-colors text-slate-400"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <div className="text-center mb-10 relative mt-4">
            <div className={`w-20 h-20 ${modoTrocaSenha ? 'bg-amber-500' : 'bg-gradient-to-br from-blue-600 to-indigo-700'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 transform transition-all duration-500 hover:rotate-6`}>
              {modoTrocaSenha ? (
                <ShieldCheck size={36} className="text-white" />
              ) : (
                <img src={logoSvg as string} alt="Logo" className="w-12 h-12 object-contain brightness-0 invert" />
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {modoTrocaSenha ? 'Segurança Adicional' : 'Acesso ao Sistema'}
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">
              {modoTrocaSenha ? 'Crie uma nova senha segura' : 'Plataforma Core NLP'}
            </p>
          </div>

          {/* FORMULÁRIOS */}
          {!modoTrocaSenha ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input 
                  type="text" 
                  id="usuario" 
                  required 
                  value={usuario} 
                  onChange={handleInputChange(setUsuario)} 
                  className={inputClass} 
                  placeholder=" " 
                />
                <label htmlFor="usuario" className={labelClass}>Usuário</label>
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="senha" 
                  required 
                  value={senha} 
                  onChange={handleInputChange(setSenha)} 
                  className={inputClass} 
                  placeholder=" " 
                />
                <label htmlFor="senha" className={labelClass}>Senha</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !usuario || !senha}
                className="w-full relative group/btn flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-bold transition-all overflow-hidden hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed mt-6 shadow-xl active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="relative z-10">Entrar no Painel</span>
                    <ArrowRight size={18} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTrocarSenha} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input 
                  type="password" 
                  id="novaSenha" 
                  required 
                  value={novaSenha} 
                  onChange={handleInputChange(setNovaSenha)} 
                  className={inputClass} 
                  placeholder=" " 
                />
                <label htmlFor="novaSenha" className={labelClass}>Nova Senha</label>
              </div>

              <div className="relative">
                <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input 
                  type="password" 
                  id="confirmarSenha" 
                  required 
                  value={confirmarSenha} 
                  onChange={handleInputChange(setConfirmarSenha)} 
                  className={inputClass} 
                  placeholder=" " 
                />
                <label htmlFor="confirmarSenha" className={labelClass}>Confirmar Nova Senha</label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !novaSenha || !confirmarSenha} 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg mt-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar e Acessar'}
              </button>
              
              <button 
                type="button" 
                onClick={cancelarTrocaSenha} 
                className="w-full text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] pt-4"
              >
                Cancelar e Voltar
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Branding de rodapé */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2">
        <div className="h-px w-12 bg-slate-200 mb-2" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Powered by <span className="text-blue-600/60">Interplace</span>
        </p>
      </div>

    </div>
  );
}