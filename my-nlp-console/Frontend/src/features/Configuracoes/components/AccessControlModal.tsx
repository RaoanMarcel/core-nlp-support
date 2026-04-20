import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, ShieldAlert, Loader2, Users, KeyRound, UserMinus, Briefcase } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import type { IRole, IPermission } from '../../../types/access.types';
import { api } from '../../../services/api';

interface AccessControlModalProps {
  onClose: () => void;
}

interface IUser {
  id: string;
  nome: string;
  usuario: string;
  roleId: string | null;
}

export default function AccessControlModal({ onClose }: AccessControlModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef as React.RefObject<HTMLDivElement>, onClose);

  // Estados dos Dados
  const [roles, setRoles] = useState<IRole[]>([]);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  
  // Estados de UI
  const [activeRoleId, setActiveRoleId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>('permissions');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Estados para Criação de Novo Cargo (O substituto do Prompt)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Busca inicial dos dados
  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        setIsLoading(true);
        const [rolesRes, permsRes, usersRes] = await Promise.all([
          api.get('/roles'),
          api.get('/roles/permissions'),
          api.get('/users')
        ]);

        setRoles(rolesRes.data);
        setPermissions(permsRes.data);
        setUsers(usersRes.data);

        if (rolesRes.data.length > 0) {
          setActiveRoleId(rolesRes.data[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatrixData();
  }, []);

  const activeRole = roles.find(r => r.id === activeRoleId);

  const togglePermission = (permissionSlug: string) => {
    setRoles(prevRoles => prevRoles.map(role => {
      if (role.id !== activeRoleId) return role;
      const hasPerm = role.permissions.includes(permissionSlug);
      return {
        ...role,
        permissions: hasPerm 
          ? role.permissions.filter(p => p !== permissionSlug) 
          : [...role.permissions, permissionSlug]              
      };
    }));
  };

  const handleSaveChanges = async () => {
    if (!activeRole) return;
    try {
      setIsSaving(true);
      await api.put(`/roles/${activeRole.id}`, {
        nome: activeRole.nome,
        permissions: activeRole.permissions
      });
      alert('Matriz de permissões atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao salvar as permissões.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      setIsLoading(true);
      const res = await api.post('/roles', { nome: newRoleName.trim(), permissions: [] });
      const novaRole: IRole = { id: res.data.id, nome: newRoleName.trim(), permissions: [] };
      
      setRoles(prev => [...prev, novaRole]);
      setActiveRoleId(novaRole.id);
      setActiveTab('permissions');
      
      // Limpar e fechar
      setNewRoleName('');
      setIsCreateModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao criar o cargo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignUser = async (userId: string, roleId: string | null) => {
    try {
      await api.put(`/users/${userId}/role`, { roleId });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roleId } : u));
    } catch (error) {
      alert("Erro ao alterar cargo do usuário.");
    }
  };

  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.modulo]) acc[perm.modulo] = [];
    acc[perm.modulo].push(perm);
    return acc;
  }, {} as Record<string, IPermission[]>);

  const usersInActiveRole = users.filter(u => u.roleId === activeRoleId);
  const availableUsers = users.filter(u => u.roleId !== activeRoleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/60 transition-all">
      <div 
        ref={modalRef}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative"
      >
        
        {/* MINI MODAL: CRIAR NOVO CARGO */}
        {isCreateModalOpen && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
            <form 
              onSubmit={handleConfirmCreateRole}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-bold text-lg text-slate-800">Novo Cargo</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Como você deseja chamar este novo nível de acesso?</p>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Ex: Comercial"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-6 py-4 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!newRoleName.trim()}
                  className="flex-1 px-6 py-4 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors border-l border-slate-100"
                >
                  Criar Cargo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Matriz de Permissões</h2>
              <p className="text-sm text-slate-500">Configure os acessos e vincule sua equipe.</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
            <p className="text-sm font-medium">Carregando dados do sistema...</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            {/* COLUNA ESQUERDA: LISTA DE CARGOS */}
            <div className="w-1/3 border-r border-slate-100 bg-slate-50/30 flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargos ({roles.length})</span>
                <button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> NOVO
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {roles.map(role => {
                  const userCount = users.filter(u => u.roleId === role.id).length;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setActiveRoleId(role.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        activeRoleId === role.id 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <span className="font-semibold text-sm">{role.nome}</span>
                      <div className="flex gap-1">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 ${
                          activeRoleId === role.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                           {role.permissions.length} perms
                        </span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 ${
                          activeRoleId === role.id ? 'bg-blue-500 text-white' : 'bg-amber-100 text-amber-600'
                        }`}>
                           <Users size={10} /> {userCount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLUNA DIREITA: ABAS (PERMISSÕES / USUÁRIOS) */}
            <div className="w-2/3 flex flex-col bg-white">
              <div className="px-6 pt-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{activeRole?.nome}</h3>
                    <p className="text-sm text-slate-500">Configure os detalhes deste cargo.</p>
                  </div>
                  {activeTab === 'permissions' && (
                    <button 
                      onClick={handleSaveChanges}
                      disabled={isSaving || !activeRole}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Salvar Permissões
                    </button>
                  )}
                </div>

                <div className="flex gap-6">
                  <button 
                    onClick={() => setActiveTab('permissions')}
                    className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <KeyRound size={16} /> Acessos do Cargo
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Users size={16} /> Usuários Vinculados
                    <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{usersInActiveRole.length}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                {activeTab === 'permissions' && (
                  <div className="space-y-8">
                    {Object.entries(permissionsByModule).map(([modulo, perms]) => (
                      <div key={modulo}>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
                          Módulo: {modulo}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {perms.map(perm => {
                            const isChecked = activeRole?.permissions.includes(perm.slug) || false;
                            return (
                              <label key={perm.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isChecked ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                <input type="checkbox" className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" checked={isChecked} onChange={() => togglePermission(perm.slug)} />
                                <div>
                                  <p className={`text-sm font-bold ${isChecked ? 'text-blue-900' : 'text-slate-700'}`}>{perm.descricao}</p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block">{perm.slug}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h4 className="font-semibold text-slate-700">Equipe Atual ({usersInActiveRole.length})</h4>
                      </div>
                      
                      {usersInActiveRole.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          Nenhum usuário vinculado a este cargo ainda.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {usersInActiveRole.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-4 hover:bg-slate-50">
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{user.nome}</p>
                                <p className="text-xs text-slate-500">@{user.usuario}</p>
                              </div>
                              <button 
                                onClick={() => handleAssignUser(user.id, null)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
                              >
                                <UserMinus size={16} /> Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-slate-700 mb-2">Vincular novo usuário</h4>
                      <p className="text-sm text-slate-500 mb-4">Selecione um usuário abaixo para atribuir este cargo.</p>
                      
                      <select 
                        className="w-full border border-slate-300 rounded-lg p-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignUser(e.target.value, activeRoleId);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Selecione um usuário...</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.nome} (@{user.usuario}) - {user.roleId ? 'Mudar cargo' : 'Sem cargo'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}