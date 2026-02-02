import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, Calendar, AlertTriangle, Loader } from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import { empresaService } from '../services/empresa.service';
import { useToast } from '../hooks/useToast';
import './EmpresasPageCore.css';

interface Company {
  id: string;
  nome: string;
  cnpj?: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  userCount: number;
}

interface OrphanUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin_platform';
  companyId?: string;
}

const EmpresasPageCore: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [orphanUsers, setOrphanUsers] = useState<OrphanUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrphanAlert, setShowOrphanAlert] = useState(false);

  // Verificar se usuário é admin da plataforma
  const isAdmin = user?.role === 'admin_platform';

  useEffect(() => {
    if (!isAdmin) {
      toast.error({
        title: 'Acesso Negado',
        message: 'Apenas administradores da plataforma podem acessar esta área.',
      });
      return;
    }

    carregarDados();
  }, [isAdmin]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar empresas
      const empresasData = await empresaService.listar();
      setCompanies(empresasData.map((emp: any) => ({
        id: emp.id,
        nome: emp.nome,
        cnpj: emp.cnpj,
        status: emp.active ? 'active' : 'suspended',
        createdAt: emp.createdAt?.toDate ? emp.createdAt.toDate() : new Date(emp.createdAt),
        userCount: emp.userCount || 0,
      })));

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

  const handleCreateCompany = () => {
    toast.info({
      title: 'Em desenvolvimento',
      message: 'Modal de criação de empresa será implementado.',
    });
  };

  const handleAssignCompany = (userId: string) => {
    toast.info({
      title: 'Em desenvolvimento',
      message: 'Modal de atribuição de empresa será implementado.',
    });
  };

  const handleManageCompany = (companyId: string) => {
    toast.info({
      title: 'Em desenvolvimento',
      message: 'Modal de gerenciamento de empresa será implementado.',
    });
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
        <Dock userRole="user" />
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
        <Dock userRole="admin_platform" />
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
            <button className="empresas-btn-create" onClick={handleCreateCompany}>
              <Plus size={20} strokeWidth={2} />
              Criar Empresa
            </button>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="empresas-content">
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

          {/* Seção de Empresas */}
          <section className="companies-section">
            <h2 className="section-title">
              {companies.length === 0 ? 'Nenhuma Empresa Cadastrada' : 'Empresas Ativas'}
            </h2>

            {companies.length === 0 ? (
              <div className="empresas-empty-state">
                <Building2 size={64} className="empresas-empty-icon" />
                <h2 className="empresas-empty-title">Nenhuma empresa cadastrada</h2>
                <p className="empresas-empty-description">
                  Crie a primeira empresa para começar a organizar usuários e gerenciar a plataforma.
                </p>
                <button className="empresas-empty-btn" onClick={handleCreateCompany}>
                  Criar Primeira Empresa
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
      </div>

      <Dock userRole="admin_platform" />
    </>
  );
};

export default EmpresasPageCore;
