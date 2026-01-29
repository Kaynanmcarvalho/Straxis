import React, { useState, useEffect } from 'react';
import { 
  UserCircle,
  Plus,
  Search,
  Phone,
  MapPin,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  X,
  Check,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './CorePages.css';
import './ClientesPage.css';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco?: string;
  status: 'ativo' | 'em_servico' | 'agendado' | 'inativo';
  ultimoContato?: Date;
  totalTrabalhos: number;
  totalToneladas: number;
  avatar?: string;
}

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'em_servico' | 'agendado' | 'inativo'>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  
  // Form state
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEndereco, setFormEndereco] = useState('');

  // Mock data para demonstração
  useEffect(() => {
    setClientes([
      {
        id: '1',
        nome: 'Armazém Central',
        telefone: '(62) 99999-0001',
        endereco: 'Galpão 3 - Setor B',
        status: 'em_servico',
        ultimoContato: new Date(),
        totalTrabalhos: 45,
        totalToneladas: 1250.5,
      },
      {
        id: '2',
        nome: 'Distribuidora Norte',
        telefone: '(62) 99999-0002',
        endereco: 'Pátio A - Zona Industrial',
        status: 'ativo',
        ultimoContato: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        totalTrabalhos: 32,
        totalToneladas: 890.0,
      },
      {
        id: '3',
        nome: 'Logística Sul',
        telefone: '(62) 99999-0003',
        endereco: 'Terminal 5',
        status: 'agendado',
        ultimoContato: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        totalTrabalhos: 28,
        totalToneladas: 750.3,
      },
      {
        id: '4',
        nome: 'Transportes Rápidos',
        telefone: '(62) 99999-0004',
        status: 'inativo',
        ultimoContato: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        totalTrabalhos: 12,
        totalToneladas: 320.0,
      },
    ]);
  }, []);

  const clientesFiltrados = clientes.filter(cliente => {
    const matchSearch = cliente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       cliente.telefone.includes(searchQuery);
    const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const getInitials = (nome: string) => {
    const words = nome.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: Cliente['status']) => {
    switch (status) {
      case 'ativo': return '#34C759';
      case 'em_servico': return '#007AFF';
      case 'agendado': return '#5856D6';
      case 'inativo': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getStatusLabel = (status: Cliente['status']) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'em_servico': return 'Em Serviço';
      case 'agendado': return 'Agendado';
      case 'inativo': return 'Inativo';
      default: return status;
    }
  };

  const abrirModalNovo = () => {
    setClienteSelecionado(null);
    setFormNome('');
    setFormTelefone('');
    setFormEndereco('');
    setModalAberto(true);
  };

  const abrirPerfil = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClienteSelecionado(null);
  };

  const salvarCliente = () => {
    if (!formNome.trim() || !formTelefone.trim()) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    // TODO: Integrar com Firebase
    // eslint-disable-next-line no-console
    console.log('Salvando cliente:', { formNome, formTelefone, formEndereco });
    fecharModal();
  };

  const formatarTelefone = (telefone: string) => {
    // Remove tudo que não é número
    const numeros = telefone.replace(/\D/g, '');
    
    // Formata (XX) XXXXX-XXXX
    if (numeros.length === 11) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    }
    return telefone;
  };

  const handleTelefoneChange = (value: string) => {
    setFormTelefone(formatarTelefone(value));
  };

  return (
    <>
      <div className="page-container clientes-hub">
        {/* Header */}
        <header className="clientes-header">
          <div className="clientes-title-group">
            <h1 className="clientes-title">Clientes</h1>
            <div className="clientes-counter">
              <span className="counter-number">{clientes.length}</span>
              <span className="counter-label">cadastrados</span>
            </div>
          </div>
          <button 
            className="btn-novo-cliente"
            onClick={abrirModalNovo}
          >
            <Plus className="icon" />
          </button>
        </header>

        {/* Search Bar - Spotlight Style */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar cliente ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X className="icon" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros de Status */}
        <div className="filtros-status">
          <button
            className={`filtro-btn ${filtroStatus === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('todos')}
          >
            Todos
          </button>
          <button
            className={`filtro-btn ${filtroStatus === 'ativo' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('ativo')}
          >
            Ativos
          </button>
          <button
            className={`filtro-btn ${filtroStatus === 'em_servico' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('em_servico')}
          >
            Em Serviço
          </button>
          <button
            className={`filtro-btn ${filtroStatus === 'agendado' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('agendado')}
          >
            Agendados
          </button>
        </div>

        {/* Grid de Clientes */}
        <div className="clientes-grid">
          {clientesFiltrados.map((cliente) => (
            <div 
              key={cliente.id} 
              className="cliente-card"
              onClick={() => abrirPerfil(cliente)}
            >
              {/* Avatar */}
              <div 
                className="cliente-avatar"
                style={{ background: `linear-gradient(135deg, ${getStatusColor(cliente.status)}, ${getStatusColor(cliente.status)}dd)` }}
              >
                <span className="avatar-initials">{getInitials(cliente.nome)}</span>
              </div>

              {/* Info */}
              <div className="cliente-info">
                <h3 className="cliente-nome">{cliente.nome}</h3>
                <div className="cliente-telefone">
                  <Phone className="icon" />
                  <span>{cliente.telefone}</span>
                </div>
                {cliente.endereco && (
                  <div className="cliente-endereco">
                    <MapPin className="icon" />
                    <span>{cliente.endereco}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div 
                className="cliente-status-badge"
                style={{ 
                  background: `${getStatusColor(cliente.status)}15`,
                  color: getStatusColor(cliente.status)
                }}
              >
                <div 
                  className="status-dot"
                  style={{ background: getStatusColor(cliente.status) }}
                />
                <span>{getStatusLabel(cliente.status)}</span>
              </div>

              {/* Stats */}
              <div className="cliente-stats">
                <div className="stat-item">
                  <TrendingUp className="icon" />
                  <span className="stat-value">{cliente.totalTrabalhos}</span>
                  <span className="stat-label">trabalhos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{cliente.totalToneladas.toFixed(1)}t</span>
                  <span className="stat-label">movimentadas</span>
                </div>
              </div>

              {/* Último Contato */}
              {cliente.ultimoContato && (
                <div className="cliente-ultimo-contato">
                  <Clock className="icon" />
                  <span>
                    {Math.floor((Date.now() - cliente.ultimoContato.getTime()) / (1000 * 60 * 60 * 24))} dias atrás
                  </span>
                </div>
              )}

              {/* Chevron */}
              <ChevronRight className="cliente-chevron" />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {clientesFiltrados.length === 0 && (
          <div className="empty-state-clientes">
            <div className="empty-icon">
              <UserCircle className="icon" />
            </div>
            <h3 className="empty-titulo">
              {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="empty-descricao">
              {searchQuery 
                ? 'Tente buscar por outro nome ou telefone' 
                : 'Adicione seu primeiro cliente para começar'}
            </p>
            {!searchQuery && (
              <button 
                className="btn-empty-action"
                onClick={abrirModalNovo}
              >
                <Plus className="icon" />
                <span>Novo Cliente</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal - Novo Cliente / Perfil */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {clienteSelecionado ? clienteSelecionado.nome : 'Novo Cliente'}
              </h2>
              <button className="modal-close" onClick={fecharModal}>
                <X className="icon" />
              </button>
            </div>

            <div className="modal-body">
              {clienteSelecionado ? (
                // Perfil do Cliente
                <div className="cliente-perfil">
                  <div className="perfil-header">
                    <div 
                      className="perfil-avatar-large"
                      style={{ background: `linear-gradient(135deg, ${getStatusColor(clienteSelecionado.status)}, ${getStatusColor(clienteSelecionado.status)}dd)` }}
                    >
                      <span className="avatar-initials-large">{getInitials(clienteSelecionado.nome)}</span>
                    </div>
                    <div 
                      className="perfil-status-badge"
                      style={{ 
                        background: `${getStatusColor(clienteSelecionado.status)}15`,
                        color: getStatusColor(clienteSelecionado.status)
                      }}
                    >
                      <div 
                        className="status-dot"
                        style={{ background: getStatusColor(clienteSelecionado.status) }}
                      />
                      <span>{getStatusLabel(clienteSelecionado.status)}</span>
                    </div>
                  </div>

                  <div className="perfil-info-grid">
                    <div className="perfil-info-item">
                      <Phone className="icon" />
                      <div className="info-content">
                        <span className="info-label">Telefone</span>
                        <span className="info-value">{clienteSelecionado.telefone}</span>
                      </div>
                    </div>
                    {clienteSelecionado.endereco && (
                      <div className="perfil-info-item">
                        <MapPin className="icon" />
                        <div className="info-content">
                          <span className="info-label">Endereço</span>
                          <span className="info-value">{clienteSelecionado.endereco}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="perfil-stats-grid">
                    <div className="perfil-stat-card">
                      <TrendingUp className="icon" />
                      <span className="stat-value-large">{clienteSelecionado.totalTrabalhos}</span>
                      <span className="stat-label">Trabalhos Realizados</span>
                    </div>
                    <div className="perfil-stat-card">
                      <span className="stat-value-large">{clienteSelecionado.totalToneladas.toFixed(1)}t</span>
                      <span className="stat-label">Total Movimentado</span>
                    </div>
                  </div>

                  <div className="perfil-acoes">
                    <button className="btn-acao-perfil whatsapp">
                      <MessageSquare className="icon" />
                      <span>WhatsApp</span>
                    </button>
                    <button className="btn-acao-perfil agendar">
                      <Calendar className="icon" />
                      <span>Agendar</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Form Novo Cliente
                <div className="cliente-form">
                  <div className="form-group">
                    <label className="form-label">Nome do Cliente *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Armazém Central"
                      value={formNome}
                      onChange={(e) => setFormNome(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telefone *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="(62) 99999-9999"
                      value={formTelefone}
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Endereço (Opcional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Galpão 3 - Setor B"
                      value={formEndereco}
                      onChange={(e) => setFormEndereco(e.target.value)}
                    />
                  </div>

                  <div className="form-aviso">
                    <AlertCircle className="icon" />
                    <span>O sistema detecta automaticamente clientes duplicados</span>
                  </div>

                  <button 
                    className="btn-salvar-cliente"
                    onClick={salvarCliente}
                  >
                    <Check className="icon" />
                    <span>Salvar Cliente</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dock />
    </>
  );
};

export default ClientesPage;
