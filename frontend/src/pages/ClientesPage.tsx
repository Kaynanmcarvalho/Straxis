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
  ChevronRight,
  Edit,
  Trash2,
  FileText,
  Mail
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './ClientesPage.css';
import { db } from '../config/firebase.config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  status: 'ativo' | 'em_servico' | 'agendado' | 'inativo';
  ultimoTrabalho?: Date;
  totalTrabalhos: number;
  totalToneladas: number;
  deletedAt?: Date | null;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  companyId: string;
}

const ClientesPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const companyId = user?.companyId || 'dev-company-id';
  const userId = user?.uid || 'system';
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'em_servico' | 'agendado' | 'inativo'>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEndereco, setFormEndereco] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Carregar clientes do Firestore (real-time)
  useEffect(() => {
    const clientesRef = collection(db, `companies/${companyId}/clientes`);
    const q = query(
      clientesRef,
      where('deletedAt', '==', null),
      orderBy('nome', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const clientesData: Cliente[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Carregar histórico real de trabalhos
        const historico = await carregarHistoricoCliente(docSnap.id);
        
        clientesData.push({
          id: docSnap.id,
          nome: data.nome,
          telefone: data.telefone,
          email: data.email || undefined,
          endereco: data.endereco || undefined,
          observacoes: data.observacoes || undefined,
          status: data.status || 'ativo',
          ultimoTrabalho: historico.ultimoTrabalho,
          totalTrabalhos: historico.totalTrabalhos,
          totalToneladas: historico.totalToneladas,
          deletedAt: data.deletedAt?.toDate() || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          createdBy: data.createdBy || 'system',
          updatedAt: data.updatedAt?.toDate(),
          updatedBy: data.updatedBy,
          companyId: data.companyId,
        });
      }
      
      setClientes(clientesData);
    });
    
    return () => unsubscribe();
  }, [companyId]);

  // Carregar histórico real do cliente
  const carregarHistoricoCliente = async (clienteId: string) => {
    try {
      const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);
      const q = query(
        trabalhosRef,
        where('clienteId', '==', clienteId),
        where('deletedAt', '==', null),
        orderBy('data', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const trabalhos = snapshot.docs.map(doc => doc.data());
      
      const totalTrabalhos = trabalhos.length;
      const totalToneladas = trabalhos.reduce((sum, t) => sum + (t.tonelagem || 0), 0);
      const ultimoTrabalho = trabalhos[0]?.data?.toDate() || undefined;
      
      return { totalTrabalhos, totalToneladas, ultimoTrabalho };
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return { totalTrabalhos: 0, totalToneladas: 0, ultimoTrabalho: undefined };
    }
  };

  // Validar telefone
  const validarTelefone = (tel: string): boolean => {
    const numeros = tel.replace(/\D/g, '');
    return numeros.length === 10 || numeros.length === 11;
  };

  // Validar email
  const validarEmail = (email: string): boolean => {
    if (!email) return true; // Email é opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Verificar duplicata
  const verificarDuplicata = async (telefone: string, clienteIdAtual?: string): Promise<boolean> => {
    try {
      const clientesRef = collection(db, `companies/${companyId}/clientes`);
      const q = query(
        clientesRef,
        where('deletedAt', '==', null),
        where('telefone', '==', telefone)
      );
      
      const snapshot = await getDocs(q);
      
      // Se está editando, ignora o próprio cliente
      if (clienteIdAtual) {
        return snapshot.docs.some(doc => doc.id !== clienteIdAtual);
      }
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar duplicata:', error);
      return false;
    }
  };

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
    setModoEdicao(false);
    setFormNome('');
    setFormTelefone('');
    setFormEmail('');
    setFormEndereco('');
    setFormObservacoes('');
    setModalAberto(true);
  };

  const abrirPerfil = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setModoEdicao(false);
    setModalAberto(true);
  };

  const abrirEdicao = () => {
    if (!clienteSelecionado) return;
    
    setFormNome(clienteSelecionado.nome);
    setFormTelefone(clienteSelecionado.telefone);
    setFormEmail(clienteSelecionado.email || '');
    setFormEndereco(clienteSelecionado.endereco || '');
    setFormObservacoes(clienteSelecionado.observacoes || '');
    setModoEdicao(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClienteSelecionado(null);
    setModoEdicao(false);
  };

  const salvarCliente = async () => {
    // Validações
    if (!formNome.trim()) {
      toast.warning({
        title: 'Atenção',
        message: 'Nome do cliente é obrigatório',
      });
      return;
    }

    if (!formTelefone.trim()) {
      toast.warning({
        title: 'Atenção',
        message: 'Telefone é obrigatório',
      });
      return;
    }

    if (!validarTelefone(formTelefone)) {
      toast.error({
        title: 'Erro',
        message: 'Telefone inválido. Use formato (XX) XXXXX-XXXX',
      });
      return;
    }

    if (formEmail && !validarEmail(formEmail)) {
      toast.error({
        title: 'Erro',
        message: 'Email inválido',
      });
      return;
    }

    // Verificar duplicata
    const duplicata = await verificarDuplicata(formTelefone);
    if (duplicata) {
      toast.warning({
        title: 'Atenção',
        message: 'Já existe um cliente com este telefone',
      });
      return;
    }

    setLoading(true);

    try {
      const clientesRef = collection(db, `companies/${companyId}/clientes`);
      await addDoc(clientesRef, {
        nome: formNome.trim(),
        nomeLower: formNome.trim().toLowerCase(), // Para busca case-insensitive
        telefone: formTelefone.trim(),
        email: formEmail.trim() || null,
        endereco: formEndereco.trim() || null,
        observacoes: formObservacoes.trim() || null,
        status: 'ativo',
        deletedAt: null,
        companyId,
        createdAt: Timestamp.now(),
        createdBy: userId,
      });

      toast.success({
        title: 'Sucesso!',
        message: 'Cliente cadastrado com sucesso',
      });

      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao salvar cliente. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarEdicao = async () => {
    if (!clienteSelecionado) return;

    // Validações
    if (!formNome.trim()) {
      toast.warning({
        title: 'Atenção',
        message: 'Nome do cliente é obrigatório',
      });
      return;
    }

    if (!formTelefone.trim()) {
      toast.warning({
        title: 'Atenção',
        message: 'Telefone é obrigatório',
      });
      return;
    }

    if (!validarTelefone(formTelefone)) {
      toast.error({
        title: 'Erro',
        message: 'Telefone inválido. Use formato (XX) XXXXX-XXXX',
      });
      return;
    }

    if (formEmail && !validarEmail(formEmail)) {
      toast.error({
        title: 'Erro',
        message: 'Email inválido',
      });
      return;
    }

    // Verificar duplicata (exceto o próprio cliente)
    const duplicata = await verificarDuplicata(formTelefone, clienteSelecionado.id);
    if (duplicata) {
      toast.warning({
        title: 'Atenção',
        message: 'Já existe outro cliente com este telefone',
      });
      return;
    }

    setLoading(true);

    try {
      const clienteRef = doc(db, `companies/${companyId}/clientes`, clienteSelecionado.id);
      await updateDoc(clienteRef, {
        nome: formNome.trim(),
        nomeLower: formNome.trim().toLowerCase(), // Para busca case-insensitive
        telefone: formTelefone.trim(),
        email: formEmail.trim() || null,
        endereco: formEndereco.trim() || null,
        observacoes: formObservacoes.trim() || null,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });

      toast.success({
        title: 'Sucesso!',
        message: 'Cliente atualizado com sucesso',
      });

      setModoEdicao(false);
      fecharModal();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao atualizar cliente. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const desativarCliente = async (clienteId: string) => {
    if (!window.confirm('Desativar este cliente? Ele não aparecerá mais em agendamentos, mas o histórico será preservado.')) {
      return;
    }

    setLoading(true);

    try {
      const clienteRef = doc(db, `companies/${companyId}/clientes`, clienteId);
      await updateDoc(clienteRef, {
        deletedAt: Timestamp.now(),
        deletedBy: userId,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });

      toast.success({
        title: 'Sucesso!',
        message: 'Cliente desativado com sucesso',
      });

      fecharModal();
    } catch (error) {
      console.error('Erro ao desativar cliente:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao desativar cliente. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirWhatsApp = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numeros}`, '_blank');
  };

  const abrirAgendamento = (clienteId: string) => {
    navigate('/agenda', { state: { clienteId } });
  };

  const verTrabalhos = (clienteId: string) => {
    navigate('/trabalhos', { state: { clienteId } });
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
              {cliente.ultimoTrabalho && (
                <div className="cliente-ultimo-contato">
                  <Clock className="icon" />
                  <span>
                    {Math.floor((Date.now() - cliente.ultimoTrabalho.getTime()) / (1000 * 60 * 60 * 24))} dias atrás
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
                modoEdicao ? (
                  // Modo Edição
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
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="cliente@empresa.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Endereço</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ex: Galpão 3 - Setor B"
                        value={formEndereco}
                        onChange={(e) => setFormEndereco(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Observações</label>
                      <textarea
                        className="form-input"
                        placeholder="Notas sobre o cliente..."
                        value={formObservacoes}
                        onChange={(e) => setFormObservacoes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="form-acoes">
                      <button 
                        className="btn-cancelar"
                        onClick={() => setModoEdicao(false)}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="btn-salvar-cliente"
                        onClick={salvarEdicao}
                        disabled={loading}
                      >
                        <Check className="icon" />
                        <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo Visualização
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
                      {clienteSelecionado.email && (
                        <div className="perfil-info-item">
                          <Mail className="icon" />
                          <div className="info-content">
                            <span className="info-label">Email</span>
                            <span className="info-value">{clienteSelecionado.email}</span>
                          </div>
                        </div>
                      )}
                      {clienteSelecionado.endereco && (
                        <div className="perfil-info-item">
                          <MapPin className="icon" />
                          <div className="info-content">
                            <span className="info-label">Endereço</span>
                            <span className="info-value">{clienteSelecionado.endereco}</span>
                          </div>
                        </div>
                      )}
                      {clienteSelecionado.observacoes && (
                        <div className="perfil-info-item full-width">
                          <AlertCircle className="icon" />
                          <div className="info-content">
                            <span className="info-label">Observações</span>
                            <span className="info-value">{clienteSelecionado.observacoes}</span>
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
                      <button 
                        className="btn-acao-perfil whatsapp"
                        onClick={() => abrirWhatsApp(clienteSelecionado.telefone)}
                      >
                        <MessageSquare className="icon" />
                        <span>WhatsApp</span>
                      </button>
                      <button 
                        className="btn-acao-perfil agendar"
                        onClick={() => abrirAgendamento(clienteSelecionado.id)}
                      >
                        <Calendar className="icon" />
                        <span>Agendar</span>
                      </button>
                      <button 
                        className="btn-acao-perfil historico"
                        onClick={() => verTrabalhos(clienteSelecionado.id)}
                      >
                        <FileText className="icon" />
                        <span>Trabalhos</span>
                      </button>
                    </div>

                    <div className="perfil-gestao">
                      <button 
                        className="btn-gestao editar"
                        onClick={abrirEdicao}
                        disabled={loading}
                      >
                        <Edit className="icon" />
                        <span>Editar</span>
                      </button>
                      <button 
                        className="btn-gestao desativar"
                        onClick={() => desativarCliente(clienteSelecionado.id)}
                        disabled={loading}
                      >
                        <Trash2 className="icon" />
                        <span>Desativar</span>
                      </button>
                    </div>
                  </div>
                )
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
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="cliente@empresa.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Endereço</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Galpão 3 - Setor B"
                      value={formEndereco}
                      onChange={(e) => setFormEndereco(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Observações</label>
                    <textarea
                      className="form-input"
                      placeholder="Notas sobre o cliente..."
                      value={formObservacoes}
                      onChange={(e) => setFormObservacoes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="form-aviso">
                    <AlertCircle className="icon" />
                    <span>O sistema valida automaticamente telefones duplicados</span>
                  </div>

                  <button 
                    className="btn-salvar-cliente"
                    onClick={salvarCliente}
                    disabled={loading}
                  >
                    <Check className="icon" />
                    <span>{loading ? 'Salvando...' : 'Salvar Cliente'}</span>
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
