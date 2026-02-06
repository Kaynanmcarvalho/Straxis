import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, Calendar, AlertTriangle, Loader, X, Mail, Lock, User, Phone, Building, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import { empresaService } from '../services/empresa.service';
import { useToast } from '../hooks/useToast';
import './EmpresasPageCore.css';

interface CompanyDisplay {
  id: string;
  nome: string;
  cnpj?: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  userCount: number;
  isPlatform?: boolean;
}

interface OrphanUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin_platform';
  companyId?: string;
}

interface PlatformCompanyForm {
  nome: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
  adminTelefone: string;
}

interface ClientCompanyForm {
  nome: string;
  cnpj: string;
  telefone: string;
  planMonths: number;
  ownerNome: string;
  ownerEmail: string;
  ownerSenha: string;
  ownerTelefone: string;
}

const EmpresasPageCore: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [companies, setCompanies] = useState<CompanyDisplay[]>([]);
  const [platformCompany, setPlatformCompany] = useState<CompanyDisplay | null>(null);
  const [orphanUsers, setOrphanUsers] = useState<OrphanUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrphanAlert, setShowOrphanAlert] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showPasswordPlatform, setShowPasswordPlatform] = useState(false);
  const [showPasswordClient, setShowPasswordClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrphanUser | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDisplay | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const [platformForm, setPlatformForm] = useState<PlatformCompanyForm>({
    nome: '',
    adminNome: '',
    adminEmail: '',
    adminSenha: '',
    adminTelefone: '',
  });

  const [clientForm, setClientForm] = useState<ClientCompanyForm>({
    nome: '',
    cnpj: '',
    telefone: '',
    planMonths: 12,
    ownerNome: '',
    ownerEmail: '',
    ownerSenha: '',
    ownerTelefone: '',
  });

  // Verificar se usuário é admin da plataforma
  const isAdmin = user?.role === 'admin_platform';

  useEffect(() => {
    // Só mostrar erro se user já foi carregado e não é admin
    if (user && !isAdmin) {
      toast.error({
        title: 'Acesso Negado',
        message: 'Apenas administradores da plataforma podem acessar esta área.',
      });
      return;
    }

    // Só carregar dados se for admin
    if (isAdmin) {
      carregarDados();
    }
  }, [isAdmin, user]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar empresas
      const empresasData = await empresaService.listar();
      
      // Separar empresa plataforma das empresas clientes
      const platform = empresasData.find((emp: any) => emp.isPlatform || emp.id === 'platform');
      const clients = empresasData.filter((emp: any) => !emp.isPlatform && emp.id !== 'platform');
      
      if (platform) {
        setPlatformCompany({
          id: platform.id,
          nome: platform.name || platform.nome,
          status: platform.active ? 'active' : 'suspended',
          createdAt: new Date(platform.createdAt),
          userCount: platform.userCount || 0,
          isPlatform: true,
        } as CompanyDisplay);
      }

      setCompanies(clients.map((emp: any) => ({
        id: emp.id,
        nome: emp.name || emp.nome,
        cnpj: emp.cnpj,
        status: emp.active ? 'active' : 'suspended',
        createdAt: new Date(emp.createdAt),
        userCount: emp.userCount || 0,
        isPlatform: false,
      } as CompanyDisplay)));

      // Carregar usuários órfãos
      const orphansData = await empresaService.listarUsuariosSemEmpresa();
      setOrphanUsers(orphansData);
      setShowOrphanAlert(orphansData.length > 0);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error({
        title: 'Erro ao carregar',
        message: error.message || 'Não foi possível carregar os dados.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlatformCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validações
    if (!platformForm.nome.trim() || !platformForm.adminNome.trim() || 
        !platformForm.adminEmail.trim() || !platformForm.adminSenha.trim()) {
      toast.error({
        title: 'Campos obrigatórios',
        message: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }

    if (platformForm.adminSenha.length < 6) {
      toast.error({
        title: 'Senha inválida',
        message: 'A senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/empresas/create-platform', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(platformForm),
      });

      if (response.ok) {
        toast.success({
          title: 'Empresa Plataforma criada',
          message: 'Empresa e usuário administrador criados com sucesso!',
        });
        setShowPlatformModal(false);
        setPlatformForm({
          nome: '',
          adminNome: '',
          adminEmail: '',
          adminSenha: '',
          adminTelefone: '',
        });
        carregarDados();
      } else {
        const error = await response.json();
        toast.error({
          title: 'Erro ao criar',
          message: error.error || 'Não foi possível criar a empresa plataforma.',
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar empresa plataforma:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao criar empresa plataforma. Verifique sua conexão.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClientCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validações
    if (!clientForm.nome.trim() || !clientForm.ownerNome.trim() || 
        !clientForm.ownerEmail.trim() || !clientForm.ownerSenha.trim()) {
      toast.error({
        title: 'Campos obrigatórios',
        message: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }

    if (clientForm.ownerSenha.length < 6) {
      toast.error({
        title: 'Senha inválida',
        message: 'A senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    if (clientForm.planMonths < 1) {
      toast.error({
        title: 'Plano inválido',
        message: 'O plano deve ter pelo menos 1 mês.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/empresas/create-client', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientForm),
      });

      if (response.ok) {
        toast.success({
          title: 'Empresa Cliente criada',
          message: 'Empresa e usuário proprietário criados com sucesso!',
        });
        setShowClientModal(false);
        setClientForm({
          nome: '',
          cnpj: '',
          telefone: '',
          planMonths: 12,
          ownerNome: '',
          ownerEmail: '',
          ownerSenha: '',
          ownerTelefone: '',
        });
        carregarDados();
      } else {
        const error = await response.json();
        toast.error({
          title: 'Erro ao criar',
          message: error.error || 'Não foi possível criar a empresa cliente.',
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar empresa cliente:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao criar empresa cliente. Verifique sua conexão.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignCompany = (userId: string) => {
    const user = orphanUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setSelectedCompanyId('');
      setShowAssignModal(true);
    }
  };

  const handleSubmitAssignCompany = async () => {
    if (!selectedUser || !selectedCompanyId) {
      toast.error({
        title: 'Erro',
        message: 'Selecione uma empresa para atribuir ao usuário.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/usuarios/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: selectedCompanyId,
        }),
      });

      if (response.ok) {
        toast.success({
          title: 'Empresa atribuída',
          message: 'Usuário vinculado à empresa com sucesso!',
        });
        setShowAssignModal(false);
        setSelectedUser(null);
        setSelectedCompanyId('');
        carregarDados();
      } else {
        const error = await response.json();
        toast.error({
          title: 'Erro ao atribuir',
          message: error.error || 'Não foi possível atribuir a empresa.',
        });
      }
    } catch (error: any) {
      console.error('Erro ao atribuir empresa:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao atribuir empresa. Verifique sua conexão.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      setShowManageModal(true);
    }
  };

  const handleReactivateCompany = async (companyId: string) => {
    try {
      await empresaService.reativar(companyId);
      toast.success({
        title: 'Empresa reativada',
        message: 'A empresa foi reativada com sucesso.',
      });
      carregarDados();
    } catch (error: any) {
      toast.error({
        title: 'Erro ao reativar',
        message: error.message || 'Não foi possível reativar a empresa.',
      });
    }
  };

  if (!isAdmin) {
    return (
      <>
        <div className="empresas-governance-container">
          <div className="empresas-empty-state">
            <AlertTriangle size={64} className="empresas-empty-icon" />
            <h2 className="empresas-empty-title">Acesso Restrito</h2>
            <p className="empresas-empty-description">
              Esta área é exclusiva para administradores da plataforma.
            </p>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="empresas-governance-container">
          <div className="empresas-loading">
            <Loader size={48} className="empresas-spinner" />
          </div>
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      <div className="empresas-governance-container">
        {/* Topo Editorial */}
        <header className="empresas-header">
          <div className="empresas-header-content">
            <div className="empresas-title-group">
              <h1 className="empresas-title">Empresas</h1>
              <p className="empresas-subtitle">Gestão administrativa da plataforma</p>
            </div>
            <span className="empresas-admin-badge">Admin</span>
            <div className="empresas-header-actions">
              {!platformCompany && (
                <button className="empresas-btn-create empresas-btn-platform" onClick={() => setShowPlatformModal(true)}>
                  <Plus size={20} strokeWidth={2} />
                  Criar Empresa Plataforma
                </button>
              )}
              <button className="empresas-btn-create" onClick={() => setShowClientModal(true)}>
                <Plus size={20} strokeWidth={2} />
                Criar Empresa Cliente
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="empresas-content">
          {/* Seção Empresa Plataforma */}
          {platformCompany && (
            <section className="platform-company-section">
              <h2 className="section-title">Empresa Plataforma</h2>
              <div className="platform-company-card">
                <div className="platform-company-header">
                  <Building2 size={32} className="platform-company-icon" />
                  <div>
                    <h3 className="platform-company-name">{platformCompany.nome}</h3>
                    <p className="platform-company-description">Dona do sistema - Acesso total</p>
                  </div>
                </div>
                <div className="platform-company-stats">
                  <div className="platform-stat">
                    <Users size={16} />
                    <span>{platformCompany.userCount} administrador{platformCompany.userCount !== 1 ? 'es' : ''}</span>
                  </div>
                  <div className="platform-stat">
                    <Calendar size={16} />
                    <span>Desde {platformCompany.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Alerta de Governança */}
          {showOrphanAlert && (
            <div className="governance-alert">
              <div className="governance-alert-header">
                <AlertTriangle size={20} className="governance-alert-icon" />
                <h3 className="governance-alert-title">Atenção Necessária</h3>
              </div>
              <p className="governance-alert-description">
                <span className="governance-alert-count">{orphanUsers.length}</span> usuário
                {orphanUsers.length !== 1 ? 's' : ''} ainda não {orphanUsers.length !== 1 ? 'estão' : 'está'} vinculado
                {orphanUsers.length !== 1 ? 's' : ''} a nenhuma empresa. Isso pode gerar problemas de acesso e segurança.
              </p>
              <button 
                className="governance-alert-action"
                onClick={() => document.getElementById('orphan-users-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Revisar Agora
              </button>
            </div>
          )}

          {/* Seção de Usuários Órfãos */}
          {orphanUsers.length > 0 && (
            <section className="orphan-users-section" id="orphan-users-section">
              <h2 className="section-title">Usuários Não Vinculados</h2>
              <div className="orphan-users-list">
                {orphanUsers.map((orphan) => (
                  <div key={orphan.id} className="orphan-user-card">
                    <div className="orphan-user-header">
                      <div className="orphan-user-info">
                        <h3 className="orphan-user-name">{orphan.name}</h3>
                        <p className="orphan-user-email">{orphan.email}</p>
                      </div>
                      <span className="orphan-user-role-badge">{orphan.role}</span>
                    </div>
                    <span className="orphan-user-status">Sem empresa vinculada</span>
                    <div className="orphan-user-actions">
                      <button 
                        className="orphan-user-btn-assign"
                        onClick={() => handleAssignCompany(orphan.id)}
                      >
                        Atribuir Empresa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Seção de Empresas Clientes */}
          <section className="companies-section">
            <h2 className="section-title">
              {companies.length === 0 ? 'Nenhuma Empresa Cliente' : 'Empresas Clientes'}
            </h2>

            {companies.length === 0 ? (
              <div className="empresas-empty-state">
                <Building2 size={64} className="empresas-empty-icon" />
                <h2 className="empresas-empty-title">Nenhuma empresa cliente cadastrada</h2>
                <p className="empresas-empty-description">
                  Crie a primeira empresa cliente para começar a gerenciar usuários isolados por empresa.
                </p>
                <button className="empresas-empty-btn" onClick={() => setShowClientModal(true)}>
                  Criar Primeira Empresa Cliente
                </button>
              </div>
            ) : (
              <div className="companies-grid">
                {companies.map((company) => (
                  <div 
                    key={company.id} 
                    className="company-card"
                    onClick={() => handleManageCompany(company.id)}
                  >
                    <h3 className="company-card-name">{company.nome}</h3>
                    
                    {company.cnpj && (
                      <p className="company-card-cnpj">CNPJ: {company.cnpj}</p>
                    )}
                    
                    <div className="company-card-users">
                      <Users size={16} />
                      <span>{company.userCount} usuário{company.userCount !== 1 ? 's' : ''}</span>
                    </div>

                    <span className={`company-card-status ${company.status}`}>
                      {company.status === 'active' ? 'Ativa' : 'Suspensa'}
                    </span>

                    <div className="company-card-date">
                      <Calendar size={14} />
                      <span>Desde {company.createdAt.toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}</span>
                    </div>

                    {company.status === 'active' ? (
                      <button 
                        className="company-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageCompany(company.id);
                        }}
                      >
                        Gerenciar
                      </button>
                    ) : (
                      <button 
                        className="company-card-btn reactivate"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactivateCompany(company.id);
                        }}
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Modal Empresa Plataforma */}
        {showPlatformModal && (
          <div className="modal-overlay" onClick={() => setShowPlatformModal(false)}>
            <div className="modal-empresa" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Criar Empresa Plataforma</h2>
                <button className="modal-close" onClick={() => setShowPlatformModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreatePlatformCompany} className="modal-form">
                <div className="form-section">
                  <h3 className="form-section-title">Dados da Empresa</h3>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <Building size={18} />
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={platformForm.nome}
                      onChange={(e) => setPlatformForm({ ...platformForm, nome: e.target.value })}
                      placeholder="Ex: Straxis SaaS"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Primeiro Administrador</h3>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <User size={18} />
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={platformForm.adminNome}
                      onChange={(e) => setPlatformForm({ ...platformForm, adminNome: e.target.value })}
                      placeholder="Nome do administrador"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={18} />
                      Email *
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={platformForm.adminEmail}
                      onChange={(e) => setPlatformForm({ ...platformForm, adminEmail: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Lock size={18} />
                      Senha *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswordPlatform ? 'text' : 'password'}
                        className="form-input"
                        value={platformForm.adminSenha}
                        onChange={(e) => setPlatformForm({ ...platformForm, adminSenha: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPasswordPlatform(!showPasswordPlatform)}
                      >
                        {showPasswordPlatform ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={18} />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={platformForm.adminTelefone}
                      onChange={(e) => setPlatformForm({ ...platformForm, adminTelefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowPlatformModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Empresa Plataforma'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Empresa Cliente */}
        {showClientModal && (
          <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
            <div className="modal-empresa" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Criar Empresa Cliente</h2>
                <button className="modal-close" onClick={() => setShowClientModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateClientCompany} className="modal-form">
                <div className="form-section">
                  <h3 className="form-section-title">Dados da Empresa</h3>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <Building size={18} />
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={clientForm.nome}
                      onChange={(e) => setClientForm({ ...clientForm, nome: e.target.value })}
                      placeholder="Ex: Empresa XYZ Ltda"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <CreditCard size={18} />
                        CNPJ
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={clientForm.cnpj}
                        onChange={(e) => setClientForm({ ...clientForm, cnpj: e.target.value })}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Phone size={18} />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        value={clientForm.telefone}
                        onChange={(e) => setClientForm({ ...clientForm, telefone: e.target.value })}
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Calendar size={18} />
                      Plano (meses) *
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={clientForm.planMonths}
                      onChange={(e) => setClientForm({ ...clientForm, planMonths: parseInt(e.target.value) || 0 })}
                      placeholder="12"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Proprietário da Empresa</h3>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <User size={18} />
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={clientForm.ownerNome}
                      onChange={(e) => setClientForm({ ...clientForm, ownerNome: e.target.value })}
                      placeholder="Nome do proprietário"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={18} />
                      Email *
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={clientForm.ownerEmail}
                      onChange={(e) => setClientForm({ ...clientForm, ownerEmail: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Lock size={18} />
                      Senha *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswordClient ? 'text' : 'password'}
                        className="form-input"
                        value={clientForm.ownerSenha}
                        onChange={(e) => setClientForm({ ...clientForm, ownerSenha: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPasswordClient(!showPasswordClient)}
                      >
                        {showPasswordClient ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={18} />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={clientForm.ownerTelefone}
                      onChange={(e) => setClientForm({ ...clientForm, ownerTelefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowClientModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Empresa Cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Atribuir Empresa */}
        {showAssignModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal-empresa modal-assign" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Atribuir Empresa</h2>
                <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-form">
                <div className="user-info-card">
                  <User size={24} className="user-info-icon" />
                  <div>
                    <h3 className="user-info-name">{selectedUser.name}</h3>
                    <p className="user-info-email">{selectedUser.email}</p>
                    <span className="user-info-role">{selectedUser.role}</span>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Selecione a Empresa</h3>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <Building2 size={18} />
                      Empresa *
                    </label>
                    <select
                      className="form-input"
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      required
                    >
                      <option value="">Selecione uma empresa...</option>
                      {platformCompany && (
                        <option value={platformCompany.id}>
                          {platformCompany.nome} (Plataforma)
                        </option>
                      )}
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowAssignModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handleSubmitAssignCompany}
                    disabled={isSubmitting || !selectedCompanyId}
                  >
                    {isSubmitting ? 'Atribuindo...' : 'Atribuir Empresa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gerenciar Empresa */}
        {showManageModal && selectedCompany && (
          <div className="modal-overlay" onClick={() => setShowManageModal(false)}>
            <div className="modal-empresa modal-manage" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Gerenciar Empresa</h2>
                <button className="modal-close" onClick={() => setShowManageModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-form">
                <div className="company-info-card">
                  <Building2 size={32} className="company-info-icon" />
                  <div>
                    <h3 className="company-info-name">{selectedCompany.nome}</h3>
                    {selectedCompany.cnpj && (
                      <p className="company-info-cnpj">CNPJ: {selectedCompany.cnpj}</p>
                    )}
                    <span className={`company-info-status ${selectedCompany.status}`}>
                      {selectedCompany.status === 'active' ? 'Ativa' : 'Suspensa'}
                    </span>
                  </div>
                </div>

                <div className="company-stats-grid">
                  <div className="company-stat-item">
                    <Users size={20} />
                    <div>
                      <span className="stat-value">{selectedCompany.userCount}</span>
                      <span className="stat-label">Usuários</span>
                    </div>
                  </div>
                  <div className="company-stat-item">
                    <Calendar size={20} />
                    <div>
                      <span className="stat-value">
                        {selectedCompany.createdAt.toLocaleDateString('pt-BR')}
                      </span>
                      <span className="stat-label">Criada em</span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowManageModal(false)}
                  >
                    Fechar
                  </button>
                  {selectedCompany.status === 'active' ? (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja suspender esta empresa?')) {
                          // Implementar suspensão
                          toast.info({
                            title: 'Em breve',
                            message: 'Funcionalidade de suspensão será implementada.',
                          });
                        }
                      }}
                    >
                      Suspender Empresa
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-submit"
                      onClick={() => handleReactivateCompany(selectedCompany.id)}
                    >
                      Reativar Empresa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dock />
    </>
  );
};

export default EmpresasPageCore;
