import React, { useState } from 'react';
import { Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const API_URL = 'https://core-nlp-support.onrender.com';
interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [modoTrocaSenha, setModoTrocaSenha] = useState(false);

  // LOGIN NORMAL
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

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('@CRM:token', data.token);
        localStorage.setItem('@CRM:user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else if (response.status === 403 && data.requirePasswordChange) {
        // CAIU NO PRIMEIRO ACESSO!
        setModoTrocaSenha(true);
      } else {
        setErro(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // TROCA DE SENHA (PRIMEIRO ACESSO)
  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem!');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErro('');

    try {
      const response = await fetch(`${API_URL}/auth/primeiro-acesso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          usuario, 
          senhaAtual: senha, // A senha que ele usou para tentar logar agora pouco
          novaSenha 
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('@CRM:token', data.token);
        localStorage.setItem('@CRM:user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else {
        setErro(data.error || 'Erro ao atualizar senha');
      }
    } catch (error) {
      setErro('Erro na comunicação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 p-8">
        
        <div className="text-center mb-8">
          <div className={`w-12 h-12 ${modoTrocaSenha ? 'bg-amber-500' : 'bg-blue-600'} text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            {modoTrocaSenha ? <ShieldCheck size={24} /> : <Lock size={24} />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {modoTrocaSenha ? 'Segurança Adicional' : 'Acesso ao Sistema'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {modoTrocaSenha ? 'Você precisa definir uma senha definitiva' : 'Insira suas credenciais para continuar'}
          </p>
        </div>

        {erro && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-semibold mb-6 border border-rose-100 text-center animate-pulse">
            {erro}
          </div>
        )}

        {!modoTrocaSenha ? (
          /* FORMULÁRIO DE LOGIN NORMAL */
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuário</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" required value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ex: joao.silva"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha Provisória</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" required value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-70 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{'Entrar'} <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          /* FORMULÁRIO DE TROCA DE SENHA */
          <form onSubmit={handleTrocarSenha} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nova Senha</label>
              <input 
                type="password" required value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirmar Nova Senha</label>
              <input 
                type="password" required value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="Repita a nova senha"
              />
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-70 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Senha e Entrar'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setModoTrocaSenha(false)}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase"
            >
              Voltar para o login
            </button>
          </form>
        )}

      </div>
    </div>
  );
}