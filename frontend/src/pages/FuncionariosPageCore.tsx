import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Award,
  Activity,
  UserX,
  X,
  User,
  Briefcase,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Edit
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import './FuncionariosPageCore.css';

interface Funcionario {
  id: string;
  nome: string;
  funcao: string;
  avatar?: string;
  status: 'ativo' | 'inativo' | 'ferias';
  telefone?: string;
  email?: string;
  dataAdmissao: string;
  diaria: number; // Mudado de salario para diaria
  projetos: number;
}

interface NovoFuncionario {
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  senha: string;
  diaria: number;
  dataAdmissao: string;
}

const FuncionariosPageCore: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [showPontoModal, setShowPontoModal] = useState(false);
  const [selectedFuncionarioPonto, setSelectedFuncionarioPonto] = useState<Funcionario | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [funcoes, setFuncoes] = useState<string[]>([]);
  const [showAddFuncao, setShowAddFuncao] = useState(false);
  const [novaFuncao, setNovaFuncao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NovoFuncionario>({
    nome: '',
    funcao: '',
    telefone: '',
    email: '',
    senha: '',
    diaria: '' as any, // Vazio em vez de 0
    dataAdmissao: new Date().toISOString().split('T')[0]
  });
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log do showAddFuncao
  useEffect(() => {
    console.log('🟢 [FuncionariosPageCore] showAddFuncao mudou para:', showAddFuncao);
  }, [showAddFuncao]);
  
  // Debug: Log do user
  useEffect(() => {
    console.log('🔵 [FuncionariosPageCore] user atualizado:', user);
    console.log('🔵 [FuncionariosPageCore] user?.companyId:', user?.companyId);
  }, [user]);

  useEffect(() => {
    if (user?.companyId) {
      loadFuncionarios();
    }
  }, [user?.companyId]);

  useEffect(() => {
    if (user?.companyId) {
      loadFuncoes();
    }
  }, [user?.companyId]);

  // Bloquear scroll da página quando modal estiver aberto
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal]);

  const loadFuncionarios = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando funcionários...');
      
      // Pegar companyId
      let companyId = user?.companyId;
      if (!companyId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          companyId = parsedUser.companyId;
        }
      }
      
      if (!companyId) {
        console.log('⚠️ CompanyId não encontrado');
        setFuncionarios([]);
        return;
      }
      
      console.log('📍 CompanyId:', companyId);
      
      // Buscar do Firestore diretamente
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const { app } = await import('../config/firebase.config');
      
      const db = getFirestore(app);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      
      console.log('📊 Documentos encontrados:', querySnapshot.size);
      
      const funcionariosData: Funcionario[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('👤 Usuário encontrado:', data);
        
        funcionariosData.push({
          id: doc.id,
          nome: data.name || data.displayName || 'Sem nome',
          funcao: data.funcao || 'Não definida',
          status: data.active !== false ? 'ativo' : 'inativo',
          telefone: data.telefone || '',
          email: data.email || '',
          dataAdmissao: data.dataAdmissao || new Date().toISOString(),
          diaria: data.diariaCentavos ? data.diariaCentavos / 100 : 0,
          projetos: 0
        });
      });
      
      console.log('✅ Funcionários carregados:', funcionariosData.length);
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários:', error);
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFuncoes = async () => {
    try {
      // Tentar pegar companyId do user ou do token JWT
      let companyId = user?.companyId;
      
      if (!companyId) {
        console.log('⚠️ [loadFuncoes] CompanyId não disponível no user, tentando token...');
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            companyId = payload.companyId;
            console.log('✅ [loadFuncoes] CompanyId do token:', companyId);
          } catch (error) {
            console.error('❌ [loadFuncoes] Erro ao decodificar token:', error);
          }
        }
      }
      
      if (!companyId) {
        console.log('⚠️ [loadFuncoes] CompanyId não disponível ainda');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`/api/empresas/${companyId}/funcoes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFuncoes(data.funcoes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
      setFuncoes([]);
    }
  };

  const handleAddFuncao = async () => {
    console.log('🔵🔵🔵 ===== DEBUG COMPLETO =====');
    
    if (!novaFuncao.trim()) {
      toast.error({
        title: 'Campo obrigatório',
        message: 'Digite o nome da função',
      });
      return;
    }
    
    if (funcoes.includes(novaFuncao.trim())) {
      toast.error({
        title: 'Função duplicada',
        message: 'Esta função já existe na lista',
      });
      return;
    }
    
    // Pegar companyId do AuthContext (Firebase)
    const companyId = user?.companyId;
    
    if (!companyId) {
      console.error('❌ ERRO: CompanyId não encontrado no user');
      toast.error({
        title: 'Erro de autenticação',
        message: 'CompanyId não encontrado',
      });
      return;
    }
    
    try {
      // Pegar token do Firebase Auth
      const { auth } = await import('../config/firebase.config');
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        toast.error({
          title: 'Não autenticado',
          message: 'Usuário não encontrado no Firebase',
        });
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      console.log('✅ Token Firebase obtido');
      
      console.log('🔵 Enviando requisição para:', `/api/empresas/${companyId}/funcoes`);
      
      const novasFuncoes = [...funcoes, novaFuncao.trim()];
      
      const response = await fetch(`/api/empresas/${companyId}/funcoes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ funcoes: novasFuncoes })
      });
      
      console.log('🔵 Response status:', response.status);
      const responseText = await response.text();
      console.log('🔵 Response body:', responseText);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log('✅ Sucesso:', result);
        setFuncoes(novasFuncoes);
        setNovaFuncao('');
        setShowAddFuncao(false);
        toast.success({
          title: 'Função adicionada',
          message: `"${novaFuncao.trim()}" adicionada!`,
        });
      } else {
        const error = JSON.parse(responseText);
        console.error('❌ Erro da API:', error);
        toast.error({
          title: 'Erro ao adicionar',
          message: error.error || 'Erro desconhecido',
        });
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error({
        title: 'Erro',
        message: String(error),
      });
    }
  };

  const filteredFuncionarios = funcionarios.filter(func => {
    const matchesSearch = func.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         func.funcao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || func.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmitFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validações
    if (!formData.nome.trim() || !formData.email.trim() || !formData.senha.trim()) {
      toast.error({
        title: 'Campos obrigatórios',
        message: 'Por favor, preencha todos os campos obrigatórios',
      });
      return;
    }
    
    if (formData.senha.length < 6) {
      toast.error({
        title: 'Senha inválida',
        message: 'A senha deve ter pelo menos 6 caracteres',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Pegar token e companyId do Firebase Auth diretamente
      const { auth } = await import('../config/firebase.config');
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        toast.error({
          title: 'Não autenticado',
          message: 'Você precisa estar logado para cadastrar funcionários',
        });
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      
      // Pegar companyId do user context ou do localStorage
      let companyId = user?.companyId;
      if (!companyId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          companyId = parsedUser.companyId;
        }
      }
      
      if (!companyId) {
        toast.error({
          title: 'Erro de autenticação',
          message: 'Não foi possível identificar sua empresa. Faça login novamente.',
        });
        return;
      }
      
      const response = await fetch('/api/usuarios/create-funcionario', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.senha,
          name: formData.nome,
          companyId: companyId,
          role: 'user',
          telefone: formData.telefone,
          funcao: formData.funcao,
          dataAdmissao: formData.dataAdmissao,
          diariaCentavos: Math.round((formData.diaria || 0) * 100)
        })
      });
      
      if (response.ok) {
        await response.json();
        await loadFuncionarios();
        setShowAddModal(false);
        resetForm();
        toast.success({
          title: 'Funcionário cadastrado',
          message: `${formData.nome} foi cadastrado com sucesso!`,
        });
      } else {
        const error = await response.json();
        toast.error({
          title: 'Erro ao cadastrar',
          message: error.error || 'Não foi possível cadastrar o funcionário',
        });
      }
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      toast.error({
        title: 'Erro de conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      funcao: '',
      telefone: '',
      email: '',
      senha: '',
      diaria: '' as any,
      dataAdmissao: new Date().toISOString().split('T')[0]
    });
    setShowPassword(false);
  };
  
  // Função para formatar telefone (DDD + número)
  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleInputChange = (field: keyof NovoFuncionario, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWhatsAppClick = (telefone: string) => {
    // Remove caracteres especiais do telefone
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver (Brasil +55)
    const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    
    // URL do WhatsApp
    const whatsappUrl = `https://wa.me/${numeroCompleto}`;
    
    // Abre o WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const handleMenuClick = (funcionarioId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (activeMenu === funcionarioId) {
      setActiveMenu(null);
      setMenuVisible(false);
      return;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    const menuWidth = isMobile ? 320 : 280;
    const menuHeight = 200; // Altura aproximada do menu
    
    let x, y;
    
    if (isMobile) {
      // No mobile, centralizar horizontalmente
      x = window.innerWidth / 2;
      y = rect.bottom + 8;
      
      // Verificar se o menu sai da tela verticalmente
      if (y + menuHeight > window.innerHeight) {
        y = rect.top - menuHeight - 8;
      }
    } else {
      // No desktop, posicionar à esquerda do botão
      x = rect.left - menuWidth + rect.width;
      y = rect.bottom + 8;
      
      // Verificar se o menu sai da tela horizontalmente
      if (x < 16) {
        x = 16;
      } else if (x + menuWidth > window.innerWidth - 16) {
        x = window.innerWidth - menuWidth - 16;
      }
      
      // Verificar se o menu sai da tela verticalmente
      if (y + menuHeight > window.innerHeight - 16) {
        y = rect.top - menuHeight - 8;
      }
    }
    
    // Definir posição e mostrar menu simultaneamente
    setMenuPosition({ x, y });
    setActiveMenu(funcionarioId);
    
    // Usar requestAnimationFrame para garantir que o DOM seja atualizado
    requestAnimationFrame(() => {
      setMenuVisible(true);
    });
  };

  const handleInativarFuncionario = (funcionarioId: string) => {
    setActiveMenu(null);
    setMenuVisible(false);
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    if (funcionario) {
      const novoStatus = funcionario.status === 'ativo' ? 'inativo' : 'ativo';
      setFuncionarios(prev => 
        prev.map(f => 
          f.id === funcionarioId 
            ? { ...f, status: novoStatus as 'ativo' | 'inativo' | 'ferias' }
            : f
        )
      );
    }
  };

  const handleEditFuncionario = (funcionarioId: string) => {
    setActiveMenu(null);
    setMenuVisible(false);
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData({
        nome: funcionario.nome,
        funcao: funcionario.funcao,
        telefone: funcionario.telefone || '',
        email: funcionario.email || '',
        senha: '', // Não preenche senha por segurança
        diaria: funcionario.diaria || 0,
        dataAdmissao: funcionario.dataAdmissao
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || !editingFuncionario) return;
    
    // Validações
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast.error({
        title: 'Campos obrigatórios',
        message: 'Nome e e-mail são obrigatórios',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Pegar token do Firebase Auth
      const { auth } = await import('../config/firebase.config');
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        toast.error({
          title: 'Não autenticado',
          message: 'Você precisa estar logado',
        });
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      
      // Atualizar no Firestore
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const { app } = await import('../config/firebase.config');
      
      const db = getFirestore(app);
      const userRef = doc(db, 'users', editingFuncionario.id);
      
      await updateDoc(userRef, {
        name: formData.nome,
        funcao: formData.funcao,
        telefone: formData.telefone,
        dataAdmissao: formData.dataAdmissao,
        diariaCentavos: Math.round((formData.diaria || 0) * 100)
      });
      
      // Atualizar lista local
      setFuncionarios(prev => 
        prev.map(f => 
          f.id === editingFuncionario.id 
            ? {
                ...f,
                nome: formData.nome,
                funcao: formData.funcao,
                telefone: formData.telefone,
                dataAdmissao: formData.dataAdmissao,
                diaria: formData.diaria || 0
              }
            : f
        )
      );
      
      setShowEditModal(false);
      setEditingFuncionario(null);
      resetForm();
      
      toast.success({
        title: 'Funcionário atualizado',
        message: `${formData.nome} foi atualizado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error({
        title: 'Erro ao atualizar',
        message: 'Não foi possível atualizar o funcionário',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFuncionario = () => {
    setShowAddModal(true);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setMenuVisible(false);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeMenu]);

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return '#34C759';
      case 'inativo': return '#FF3B30';
      case 'ferias': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'ferias': return 'Férias';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <>
        <div className="funcionarios-loading">
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-text">
              <h3>Carregando Equipe</h3>
              <p>Preparando informações dos funcionários...</p>
            </div>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      <div className="funcionarios-container">
        {/* Header */}
        <div className="funcionarios-header">
          <div className="header-content">
            <div className="header-title">
              <Users className="header-icon" />
              <div>
                <h1>Equipe</h1>
                <p>{funcionarios.length} funcionário{funcionarios.length !== 1 ? 's' : ''} cadastrado{funcionarios.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="ponto-button"
                onClick={() => setShowPontoModal(true)}
                title="Gerenciar Ponto Digital"
              >
                <Clock size={20} />
                <span>Ponto</span>
              </button>
              <button 
                className="add-button"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={24} />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="funcionarios-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <Filter className="filter-icon" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="ferias">Em Férias</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon active">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>{funcionarios.filter(f => f.status === 'ativo').length}</h3>
              <p>Ativos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon projects">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <h3>{funcionarios.reduce((acc, f) => acc + f.projetos, 0)}</h3>
              <p>Projetos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon salary">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{funcionarios.length}</h3>
              <p>Total</p>
            </div>
          </div>
        </div>

        {/* Funcionários List */}
        <div className="funcionarios-list">
          {filteredFuncionarios.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Users size={64} />
              </div>
              <h3>Nenhum funcionário encontrado</h3>
              <p>
                {searchTerm || selectedFilter !== 'todos' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando o primeiro funcionário da equipe'
                }
              </p>
              {!searchTerm && selectedFilter === 'todos' && (
                <button 
                  className="empty-action-button"
                  onClick={handleAddFuncionario}
                >
                  <Plus size={20} />
                  Adicionar Primeiro Funcionário
                </button>
              )}
            </div>
          ) : (
            filteredFuncionarios.map((funcionario, index) => (
              <div 
                key={funcionario.id} 
                className="funcionario-card-master"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card Header - Avatar e Status */}
                <div className="card-header-master">
                  <div className="avatar-section">
                    <div className="avatar-master">
                      <div className="avatar-circle">
                        {funcionario.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div 
                        className="status-pulse"
                        style={{ backgroundColor: getStatusColor(funcionario.status) }}
                      />
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h3 className="funcionario-name-master">{funcionario.nome}</h3>
                    <div className="funcionario-role-master">{funcionario.funcao}</div>
                    <span 
                      className="status-badge-master"
                      style={{ 
                        backgroundColor: `${getStatusColor(funcionario.status)}15`,
                        color: getStatusColor(funcionario.status),
                        borderColor: `${getStatusColor(funcionario.status)}30`
                      }}
                    >
                      {getStatusText(funcionario.status)}
                    </span>
                  </div>

                  <button 
                    className="menu-button-master"
                    onClick={(e) => handleMenuClick(funcionario.id, e)}
                    aria-label="Menu do funcionário"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Divider */}
                <div className="card-divider" />

                {/* Contact Grid */}
                <div className="contact-grid-master">
                  <div className="contact-row">
                    <div className="contact-item-master">
                      <div className="contact-icon-master admission">
                        <Calendar size={18} />
                      </div>
                      <div className="contact-details">
                        <span className="contact-label-master">ADMISSÃO</span>
                        <span className="contact-value-master">
                          {new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div 
                      className="contact-item-master contact-clickable projects-item"
                      onClick={() => toast.info({
                        title: 'Trabalhos',
                        message: `${funcionario.nome} possui ${funcionario.projetos} projeto${funcionario.projetos !== 1 ? 's' : ''} registrado${funcionario.projetos !== 1 ? 's' : ''}`,
                      })}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver projetos de ${funcionario.nome}`}
                    >
                      <div className="contact-icon-master projects">
                        <Award size={18} />
                      </div>
                      <div className="contact-details">
                        <span className="contact-label-master">PROJETOS</span>
                        <span className="contact-value-master">{funcionario.projetos}</span>
                      </div>
                      <div className="projects-indicator">
                        <Briefcase size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="contact-row">
                    <div 
                      className="contact-item-master contact-clickable whatsapp-item"
                      onClick={() => handleWhatsAppClick(funcionario.telefone || '')}
                      role="button"
                      tabIndex={0}
                      aria-label={`Abrir WhatsApp com ${funcionario.nome}`}
                    >
                      <div className="contact-icon-master phone">
                        <Phone size={18} />
                      </div>
                      <div className="contact-details">
                        <span className="contact-label-master">TELEFONE</span>
                        <span className="contact-value-master">{funcionario.telefone}</span>
                      </div>
                      <div className="whatsapp-indicator">
                        <MessageCircle size={16} />
                      </div>
                    </div>

                    <div 
                      className="contact-item-master contact-clickable"
                      onClick={() => handleEmailClick(funcionario.email || '')}
                      role="button"
                      tabIndex={0}
                      aria-label={`Enviar email para ${funcionario.nome}`}
                    >
                      <div className="contact-icon-master email">
                        <Mail size={18} />
                      </div>
                      <div className="contact-details">
                        <span className="contact-label-master">E-MAIL</span>
                        <span className="contact-value-master">{funcionario.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Dock />

      {/* Modal Ponto Digital */}
      {showPontoModal && (
        <PontoDigitalModal
          funcionario={selectedFuncionarioPonto}
          isOpen={showPontoModal}
          onClose={() => {
            setShowPontoModal(false);
            setSelectedFuncionarioPonto(null);
          }}
        />
      )}

      {/* Menu Contextual Premium */}
      {activeMenu && (
        <>
          {/* Overlay para fechar menu */}
          <div 
            className="menu-overlay"
            onClick={() => {
              setActiveMenu(null);
              setMenuVisible(false);
            }}
          />
          
          {/* Menu Dropdown */}
          <div
            ref={menuRef}
            className={`context-menu-premium ${menuVisible ? 'visible' : ''}`}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              transform: window.innerWidth <= 768 ? 'translateX(-50%)' : 'none'
            }}
          >
            <div className="menu-header">
              <span className="menu-title">Opções</span>
              <button 
                className="menu-close"
                onClick={() => {
                  setActiveMenu(null);
                  setMenuVisible(false);
                }}
                aria-label="Fechar menu"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="menu-items">
              <button
                className="menu-item edit"
                onClick={() => handleEditFuncionario(activeMenu)}
              >
                <div className="menu-icon edit">
                  <Edit size={18} />
                </div>
                <div className="menu-content">
                  <span className="menu-label">Editar</span>
                  <span className="menu-description">Editar dados do funcionário</span>
                </div>
              </button>
              
              <button
                className="menu-item inactivate"
                onClick={() => handleInativarFuncionario(activeMenu)}
              >
                <div className="menu-icon inactivate">
                  <UserX size={18} />
                </div>
                <div className="menu-content">
                  <span className="menu-label">
                    {funcionarios.find(f => f.id === activeMenu)?.status === 'ativo' ? 'Inativar' : 'Ativar'}
                  </span>
                  <span className="menu-description">
                    {funcionarios.find(f => f.id === activeMenu)?.status === 'ativo' 
                      ? 'Desativar funcionário' 
                      : 'Reativar funcionário'
                    }
                  </span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Novo Funcionário */}
      {showAddModal && (
        <div 
          className="modal-overlay-funcionario"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              resetForm();
            }
          }}
        >
          <div className="modal-funcionario" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmitFuncionario} className="funcionario-form">
              {/* Header */}
              <div className="modal-header-funcionario">
                <h2>Novo Funcionário</h2>
                <button 
                  type="button"
                  className="modal-close-funcionario"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  aria-label="Fechar modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Campos do Formulário */}
              <div className="form-content">
                {/* Nome Completo */}
                <div className="form-group">
                  <label className="form-label">
                    <User size={20} />
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: João Silva Santos"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    required
                  />
                </div>

                {/* Função */}
                <div className="form-group">
                  <label className="form-label">
                    <Briefcase size={20} />
                    Função *
                  </label>
                  <div className="funcao-input-container">
                    <select
                      className="form-select"
                      value={formData.funcao}
                      onChange={(e) => handleInputChange('funcao', e.target.value)}
                      required
                    >
                      <option value="">Selecione a função</option>
                      {funcoes.map((funcao) => (
                        <option key={funcao} value={funcao}>
                          {funcao}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-add-funcao"
                      onClick={() => {
                        console.log('🟢 Botão + clicado!');
                        console.log('🟢 showAddFuncao antes:', showAddFuncao);
                        setShowAddFuncao(true);
                        console.log('🟢 setShowAddFuncao(true) chamado');
                      }}
                      title="Adicionar nova função"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {funcoes.length === 0 && (
                    <span className="form-hint">
                      Clique no botão + para adicionar suas funções personalizadas
                    </span>
                  )}
                </div>

                {/* Telefone e Data Admissão */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={20} />
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', formatarTelefone(e.target.value))}
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Calendar size={20} />
                      Data Admissão
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dataAdmissao}
                      onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={20} />
                    E-mail (Login) *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="funcionario@empresa.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <span className="form-hint">Este e-mail será usado para login no sistema</span>
                </div>

                {/* Senha */}
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={20} />
                    Senha *
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input password-input"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Valor da Diária */}
                <div className="form-group">
                  <label className="form-label">
                    <DollarSign size={20} />
                    Valor da Diária (R$)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    value={formData.diaria === '' ? '' : formData.diaria}
                    onChange={(e) => handleInputChange('diaria', e.target.value === '' ? '' as any : parseFloat(e.target.value) || 0)}
                  />
                  <span className="form-hint">Valor que o funcionário recebe por dia trabalhado</span>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer-funcionario">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Cadastrar Funcionário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Funcionário */}
      {showEditModal && (
        <div 
          className="modal-overlay-funcionario"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingFuncionario(null);
              resetForm();
            }
          }}
        >
          <div className="modal-funcionario" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdateFuncionario} className="funcionario-form">
              {/* Header */}
              <div className="modal-header-funcionario">
                <h2>Editar Funcionário</h2>
                <button 
                  type="button"
                  className="modal-close-funcionario"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFuncionario(null);
                    resetForm();
                  }}
                  aria-label="Fechar modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Campos do Formulário */}
              <div className="form-content">
                {/* Nome Completo */}
                <div className="form-group">
                  <label className="form-label">
                    <User size={20} />
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: João Silva Santos"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    required
                  />
                </div>

                {/* Função */}
                <div className="form-group">
                  <label className="form-label">
                    <Briefcase size={20} />
                    Função *
                  </label>
                  <div className="funcao-input-container">
                    <select
                      className="form-select"
                      value={formData.funcao}
                      onChange={(e) => handleInputChange('funcao', e.target.value)}
                      required
                    >
                      <option value="">Selecione a função</option>
                      {funcoes.map((funcao) => (
                        <option key={funcao} value={funcao}>
                          {funcao}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-add-funcao"
                      onClick={() => setShowAddFuncao(true)}
                      title="Adicionar nova função"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Telefone e Data Admissão */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={20} />
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', formatarTelefone(e.target.value))}
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Calendar size={20} />
                      Data Admissão
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dataAdmissao}
                      onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* E-mail (somente leitura na edição) */}
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={20} />
                    E-mail (Login)
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <span className="form-hint">O e-mail não pode ser alterado</span>
                </div>

                {/* Valor da Diária */}
                <div className="form-group">
                  <label className="form-label">
                    <DollarSign size={20} />
                    Valor da Diária (R$)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    value={formData.diaria === '' ? '' : formData.diaria}
                    onChange={(e) => handleInputChange('diaria', e.target.value === '' ? '' as any : parseFloat(e.target.value) || 0)}
                  />
                  <span className="form-hint">Valor que o funcionário recebe por dia trabalhado</span>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer-funcionario">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFuncionario(null);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Atualizar Funcionário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Função - Renderizado via Portal para ficar acima de tudo */}
      {showAddFuncao && ReactDOM.createPortal(
        <div 
          className="modal-overlay-funcao"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddFuncao(false);
              setNovaFuncao('');
            }
          }}
        >
          <div className="modal-funcao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-funcao">
              <h3>Nova Função</h3>
              <button 
                type="button"
                className="modal-close-funcao"
                onClick={() => {
                  setShowAddFuncao(false);
                  setNovaFuncao('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body-funcao">
              <label className="form-label">
                <Briefcase size={18} />
                Nome da Função
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Motorista, Auxiliar, etc."
                value={novaFuncao}
                onChange={(e) => setNovaFuncao(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFuncao();
                  }
                }}
                autoFocus
              />
            </div>
            
            <div className="modal-footer-funcao">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowAddFuncao(false);
                  setNovaFuncao('');
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={handleAddFuncao}
              >
                <Plus size={18} />
                Adicionar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Modal para Ponto Digital
interface PontoDigitalModalProps {
  funcionario: Funcionario | null;
  isOpen: boolean;
  onClose: () => void;
}

const PontoDigitalModal: React.FC<PontoDigitalModalProps> = ({ funcionario, isOpen, onClose }) => {
  const [pontos] = useState([
    { id: '1', funcionario: 'Ana Silva', data: '2026-02-05', entrada: '08:00', saida: '17:00', status: 'completo' },
    { id: '2', funcionario: 'Carlos Santos', data: '2026-02-05', entrada: '07:30', saida: '16:30', status: 'completo' },
    { id: '3', funcionario: 'Maria Oliveira', data: '2026-02-05', entrada: '08:15', saida: null, status: 'trabalhando' }
  ]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-premium">
      <div className="modal-content-premium ponto-modal">
        <div className="modal-header-premium">
          <h2>
            <Clock size={24} />
            Ponto Digital
            {funcionario && ` - ${funcionario.nome}`}
          </h2>
          <button className="modal-close-premium" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ponto-content">
          <div className="ponto-stats">
            <div className="ponto-stat">
              <CheckCircle2 className="stat-icon success" />
              <div>
                <span className="stat-value">2</span>
                <span className="stat-label">Completos</span>
              </div>
            </div>
            <div className="ponto-stat">
              <AlertCircle className="stat-icon warning" />
              <div>
                <span className="stat-value">1</span>
                <span className="stat-label">Trabalhando</span>
              </div>
            </div>
          </div>

          <div className="ponto-list">
            {pontos.map(ponto => (
              <div key={ponto.id} className="ponto-item">
                <div className="ponto-funcionario">
                  <div className="funcionario-avatar-small">
                    {ponto.funcionario.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <span className="funcionario-nome">{ponto.funcionario}</span>
                    <span className="ponto-data">{new Date(ponto.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                
                <div className="ponto-horarios">
                  <div className="horario-item">
                    <span className="horario-label">Entrada</span>
                    <span className="horario-valor">{ponto.entrada}</span>
                  </div>
                  <div className="horario-item">
                    <span className="horario-label">Saída</span>
                    <span className="horario-valor">{ponto.saida || '--:--'}</span>
                  </div>
                </div>

                <div className={`ponto-status ${ponto.status}`}>
                  {ponto.status === 'completo' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>{ponto.status === 'completo' ? 'Completo' : 'Trabalhando'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuncionariosPageCore;