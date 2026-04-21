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

  // Estados para Criação de Novo Cargo
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/50 transition-all">
      <div 
        ref={modalRef}
        className="w-full max-w-6xl bg-theme-panel rounded-shape-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative border border-theme-border"
      >
        
        {/* MINI MODAL: CRIAR NOVO CARGO */}
        {isCreateModalOpen && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <form 
              onSubmit={handleConfirmCreateRole}
              className="bg-theme-panel rounded-shape-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-theme-border"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-bold text-lg text-theme-text">Novo Cargo</h3>
                </div>
                <p className="text-sm text-theme-muted mb-4">Como você deseja chamar este novo nível de acesso?</p>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Ex: Comercial"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-3 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all placeholder:text-theme-muted"
                />
              </div>
              <div className="flex border-t border-theme-border">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-6 py-4 text-sm font-semibold text-theme-muted hover:bg-theme-base transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!newRoleName.trim()}
                  className="flex-1 px-6 py-4 text-sm font-bold text-theme-accent hover:bg-theme-accent-soft disabled:opacity-50 transition-colors border-l border-theme-border"
                >
                  Criar Cargo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-theme-border bg-theme-base/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-accent-soft text-theme-accent rounded-shape">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-text">Matriz de Permissões</h2>
              <p className="text-sm text-theme-muted">Configure os acessos e vincule sua equipe.</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-base rounded-full transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-theme-muted">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-theme-accent" />
            <p className="text-sm font-medium">Carregando dados do sistema...</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            {/* COLUNA ESQUERDA: LISTA DE CARGOS */}
            <div className="w-1/3 border-r border-theme-border bg-theme-base/30 flex flex-col">
              <div className="p-4 border-b border-theme-border flex justify-between items-center">
                <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Cargos ({roles.length})</span>
                <button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="text-xs font-bold text-theme-accent hover:opacity-80 flex items-center gap-1 transition-opacity"
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
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-shape transition-all ${
                        activeRoleId === role.id 
                          ? 'bg-theme-accent text-white shadow-md border border-theme-accent' 
                          : 'bg-theme-panel border border-theme-border text-theme-text hover:border-theme-accent/50 hover:shadow-sm'
                      }`}
                    >
                      <span className="font-semibold text-sm">{role.nome}</span>
                      <div className="flex gap-1">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 ${
                          activeRoleId === role.id ? 'bg-white/20 text-white' : 'bg-theme-base text-theme-muted'
                        }`}>
                           {role.permissions.length} perms
                        </span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 ${
                          activeRoleId === role.id ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-600'
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
            <div className="w-2/3 flex flex-col bg-theme-panel">
              <div className="px-6 pt-6 border-b border-theme-border bg-theme-panel sticky top-0 z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-theme-text">{activeRole?.nome}</h3>
                    <p className="text-sm text-theme-muted">Configure os detalhes deste cargo.</p>
                  </div>
                  {activeTab === 'permissions' && (
                    <button 
                      onClick={handleSaveChanges}
                      disabled={isSaving || !activeRole}
                      className="flex items-center gap-2 bg-theme-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-shape font-semibold text-sm transition-all shadow-sm"
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
                      activeTab === 'permissions' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    <KeyRound size={16} /> Acessos do Cargo
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === 'users' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    <Users size={16} /> Usuários Vinculados
                    <span className="bg-theme-base text-theme-text py-0.5 px-2 rounded-full text-xs">{usersInActiveRole.length}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-theme-base/30">
                {activeTab === 'permissions' && (
                  <div className="space-y-8">
                    {Object.entries(permissionsByModule).map(([modulo, perms]) => (
                      <div key={modulo}>
                        <h4 className="text-sm font-bold text-theme-muted uppercase tracking-wider mb-4 pb-2 border-b border-theme-border">
                          Módulo: {modulo}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {perms.map(perm => {
                            const isChecked = activeRole?.permissions.includes(perm.slug) || false;
                            return (
                              <label key={perm.id} className={`flex items-start gap-3 p-4 rounded-shape-lg border cursor-pointer transition-all ${isChecked ? 'border-theme-accent bg-theme-accent-soft/30' : 'border-theme-border hover:border-theme-accent/30 bg-theme-panel'}`}>
                                <input type="checkbox" className="mt-0.5 w-4 h-4 text-theme-accent rounded border-theme-border focus:ring-theme-accent cursor-pointer bg-theme-base" checked={isChecked} onChange={() => togglePermission(perm.slug)} />
                                <div>
                                  <p className={`text-sm font-bold ${isChecked ? 'text-theme-text' : 'text-theme-text/80'}`}>{perm.descricao}</p>
                                  <p className="text-[10px] text-theme-muted mt-1 font-mono bg-theme-base px-1.5 py-0.5 rounded inline-block">{perm.slug}</p>
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
                    <div className="bg-theme-panel border border-theme-border rounded-shape-lg overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-theme-border bg-theme-base flex justify-between items-center">
                        <h4 className="font-semibold text-theme-text">Equipe Atual ({usersInActiveRole.length})</h4>
                      </div>
                      
                      {usersInActiveRole.length === 0 ? (
                        <div className="p-8 text-center text-theme-muted text-sm">
                          Nenhum usuário vinculado a este cargo ainda.
                        </div>
                      ) : (
                        <div className="divide-y divide-theme-border">
                          {usersInActiveRole.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-4 hover:bg-theme-base/50 transition-colors">
                              <div>
                                <p className="font-bold text-theme-text text-sm">{user.nome}</p>
                                <p className="text-xs text-theme-muted">@{user.usuario}</p>
                              </div>
                              <button 
                                onClick={() => handleAssignUser(user.id, null)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-shape flex items-center gap-2 text-sm font-semibold transition-colors"
                              >
                                <UserMinus size={16} /> Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-theme-panel border border-theme-border rounded-shape-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-theme-text mb-2">Vincular novo usuário</h4>
                      <p className="text-sm text-theme-muted mb-4">Selecione um usuário abaixo para atribuir este cargo.</p>
                      
                      <select 
                        className="w-full border border-theme-border bg-theme-base rounded-shape p-3 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignUser(e.target.value, activeRoleId);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-theme-panel">Selecione um usuário...</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id} className="bg-theme-panel">
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