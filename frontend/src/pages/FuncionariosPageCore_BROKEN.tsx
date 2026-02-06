import React, { useState, useEffect } from 'react';
import { 
  Clock,
  MapPin,
  Coffee,
  LogOut,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ChevronRight,
  Loader,
  X,
  AlertTriangle
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './FuncionariosPageCore.css';
import { db } from '../config/firebase.config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { validarPonto, calcularHorasTrabalhadas as calcularHoras } from '../utils/pontoValidation';
import { registrarPonto } from '../services/pontoService';

type PontoStatus = 'trabalhando' | 'almoco' | 'deslocamento' | 'fora';
type PontoTipo = 'entrada' | 'almoco_saida' | 'almoco_volta' | 'saida';

interface Localizacao {
  lat: number;
  lng: number;
  endereco: string;
  timestamp: Date;
}

interface Ponto {
  id: string;
  funcionarioId: string;
  tipo: PontoTipo;
  timestamp: Date;
  localizacao: Localizacao;
  companyId: string;
}

interface Funcionario {
  id: string;
  nome: string;
  funcao: string;
  avatar?: string;
  status: PontoStatus;
  ultimoPonto?: Ponto;
  pontosHoje: Ponto[];
  diariaBase: number;
  pagoDia: boolean;
  companyId: string;
}

const FuncionariosPageCore: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string | null>(null);
  const [mostrarPonto, setMostrarPonto] = useState(false);
  const [mostrarModalGestao, setMostrarModalGestao] = useState(false);
  const [funcionarioEdicao, setFuncionarioEdicao] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<Localizacao | null>(null);
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);

  // Modal de confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    mensagem: string;
    tipo: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'info',
    onConfirm: () => {},
  });

  const toast = useToast();
  const { user } = useAuth();

  // Usar companyId e userRole do contexto de autenticação
  const companyId = user?.companyId || 'dev-company-id';
  const userRole = (user?.role as 'admin_platform' | 'owner' | 'user') || 'owner';

  // Função para abrir modal de confirmação
  const abrirConfirmacao = (
    titulo: string,
    mensagem: string,
    onConfirm: () => void,
    tipo: 'danger' | 'warning' | 'info' = 'info'
  ) => {
    setModalConfirmacao({
      aberto: true,
      titulo,
      mensagem,
      tipo,
      onConfirm,
    });
  };

  const fecharConfirmacao = () => {
    setModalConfirmacao({
      aberto: false,
      titulo: '',
      mensagem: '',
      tipo: 'info',
      onConfirm: () => {},
    });
  };

  const confirmarAcao = () => {
    modalConfirmacao.onConfirm();
    fecharConfirmacao();
  };

  // Form state para gestão
  const [formNome, setFormNome] = useState('');
  const [formFuncao, setFormFuncao] = useState('');
  const [formDiariaBase, setFormDiariaBase] = useState('150');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formConfirmarSenha, setFormConfirmarSenha] = useState('');

  // Carregar funcionários do Firebase
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (!mounted || !companyId || !user) return;
      
      try {
        console.log('🔍 [FUNCIONARIOS] Iniciando carregamento...');
        setLoadingInicial(true);
        
        const { funcionarioService } = await import('../services/funcionario.service');
        const data = await funcionarioService.list();
        
        if (!mounted) return;
        
        if (!data || !Array.isArray(data)) {
          console.error('❌ [FUNCIONARIOS] Dados inválidos:', data);
          setFuncionarios([]);
          return;
        }
        
        if (data.length === 0) {
          console.warn('⚠️ [FUNCIONARIOS] Nenhum funcionário encontrado');
          setFuncionarios([]);
          return;
        }
        
        const funcionariosData: Funcionario[] = [];
        
        for (const func of data) {
          if (!mounted) return;
          
          const funcionarioId = func.id;
          console.log('🔍 [FUNCIONARIOS] Processando:', funcionarioId, func.nome);
          
          // Carregar pontos de hoje (simplificado)
          const pontosHoje: Ponto[] = [];
          const status = 'fora' as PontoStatus;
          
          funcionariosData.push({
            id: funcionarioId,
            nome: func.nome,
            funcao: func.funcao || 'Operador',
            status,
            ultimoPonto: undefined,
            pontosHoje,
            diariaBase: func.diariaBase || 150,
            pagoDia: false,
            companyId,
          });
        }
        
        if (mounted) {
          console.log('✅ [FUNCIONARIOS] Carregados:', funcionariosData.length);
          setFuncionarios(funcionariosData);
        }
      } catch (error) {
        console.error('❌ [FUNCIONARIOS] Erro:', error);
        if (mounted) {
          setFuncionarios([]);
        }
      } finally {
        if (mounted) {
          setLoadingInicial(false);
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []); // Array vazio - executa apenas uma vez

  // Obter localização atual
  useEffect(() => {
    if (mostrarPonto) {
      obterLocalizacao();
    }
  }, [mostrarPonto]);

  const obterLocalizacao = () => {
    if (!navigator.geolocation) {
      setErroLocalizacao('Geolocalização não suportada pelo navegador');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding usando API pública
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          setLocalizacaoAtual({
            lat: latitude,
            lng: longitude,
            endereco: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: new Date(),
          });
          setErroLocalizacao(null);
        } catch (error) {
          setLocalizacaoAtual({
            lat: latitude,
            lng: longitude,
            endereco: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: new Date(),
          });
        }
        setLoading(false);
      },
      (error) => {
        setErroLocalizacao('Erro ao obter localização. Permita o acesso à localização.');
        setLoading(false);
        console.error('Erro de geolocalização:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const carregarPontosHoje = async (funcionarioId: string): Promise<Ponto[]> => {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const pontosRef = collection(db, `companies/${companyId}/pontos`);
      const q = query(
        pontosRef,
        where('funcionarioId', '==', funcionarioId),
        where('timestamp', '>=', Timestamp.fromDate(hoje)),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          funcionarioId: data.funcionarioId,
          tipo: data.tipo,
          timestamp: data.timestamp.toDate(),
          localizacao: {
            lat: data.localizacao.lat,
            lng: data.localizacao.lng,
            endereco: data.localizacao.endereco,
            timestamp: data.localizacao.timestamp.toDate(),
          },
          companyId: data.companyId,
        };
      });
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
      return [];
    }
  };

  const calcularStatus = (pontos: Ponto[]): PontoStatus => {
    if (pontos.length === 0) return 'fora';
    
    const ultimoPonto = pontos[pontos.length - 1];
    
    switch (ultimoPonto.tipo) {
      case 'entrada':
        return 'trabalhando';
      case 'almoco_saida':
        return 'almoco';
      case 'almoco_volta':
        return 'trabalhando';
      case 'saida':
        return 'fora';
      default:
        return 'fora';
    }
  };

  const proximoPontoPermitido = (pontos: Ponto[]): PontoTipo | null => {
    if (pontos.length === 0) return 'entrada';
    
    const ultimoPonto = pontos[pontos.length - 1];
    
    switch (ultimoPonto.tipo) {
      case 'entrada':
        return 'almoco_saida';
      case 'almoco_saida':
        return 'almoco_volta';
      case 'almoco_volta':
        return 'saida';
      case 'saida':
        return null; // Já saiu, não pode bater mais ponto hoje
      default:
        return 'entrada';
    }
  };

  const handleBaterPonto = async (tipo: PontoTipo, funcionarioId?: string) => {
    if (!localizacaoAtual) {
      toast.warning({
        title: 'Aguarde',
        message: 'Aguarde a localização ser obtida...',
      });
      return;
    }

    // Se não passou funcionarioId, usar o usuário logado do contexto
    const funcId = funcionarioId || user?.uid;
    
    if (!funcId) {
      toast.error({
        title: 'Erro',
        message: 'Funcionário não identificado. Faça login novamente.',
      });
      return;
    }

    const funcionario = funcionarios.find(f => f.id === funcId);
    if (!funcionario) {
      toast.error({
        title: 'Erro',
        message: 'Funcionário não encontrado',
      });
      return;
    }

    setLoading(true);

    try {
      // Validar ponto usando pontoValidation.ts
      const validacao = validarPonto(
        funcionario.pontosHoje,
        tipo,
        localizacaoAtual
      );

      if (!validacao.valido) {
        toast.warning({
          title: 'Ponto Inválido',
          message: validacao.erro || 'Não é possível registrar este ponto agora',
        });
        
        // Registrar tentativa inválida para auditoria
        await registrarTentativaInvalida(funcId, tipo, validacao.erro || 'Validação falhou');
        return;
      }

      // Registrar ponto usando pontoService.ts
      await registrarPonto(
        funcId,
        tipo,
        localizacaoAtual,
        companyId
      );

      // Recarregar funcionários
      await carregarFuncionarios();
      
      setMostrarPonto(false);
      toast.success({
        title: 'Sucesso!',
        message: `Ponto batido: ${getTipoPontoLabel(tipo)}`,
      });
    } catch (error: any) {
      console.error('Erro ao bater ponto:', error);
      toast.error({
        title: 'Erro',
        message: error.message || 'Erro ao bater ponto. Tente novamente.',
      });
      
      // Registrar tentativa inválida
      await registrarTentativaInvalida(funcId, tipo, error.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Registrar tentativa inválida para auditoria
  const registrarTentativaInvalida = async (funcionarioId: string, tipo: PontoTipo, motivo: string) => {
    try {
      const tentativasRef = collection(db, `companies/${companyId}/pontosTentativasInvalidas`);
      await addDoc(tentativasRef, {
        funcionarioId,
        tipo,
        motivo,
        timestamp: Timestamp.fromDate(new Date()),
        companyId,
        userId: user?.uid || 'system',
      });
    } catch (error) {
      console.error('Erro ao registrar tentativa inválida:', error);
    }
  };

  const handleMarcarPago = async (funcionarioId: string) => {
    abrirConfirmacao(
      'Confirmar Pagamento',
      'Confirmar pagamento da diária deste funcionário?',
      async () => {
        setLoading(true);

        try {
          const funcionarioRef = doc(db, `companies/${companyId}/funcionarios`, funcionarioId);
          await updateDoc(funcionarioRef, {
            pagoDia: new Date().toISOString().split('T')[0],
            updatedAt: Timestamp.fromDate(new Date()),
          });

          // Recarregar funcionários
          await carregarFuncionarios();
          
          toast.success({
            title: 'Sucesso!',
            message: 'Pagamento registrado com sucesso!',
          });
        } catch (error) {
          console.error('Erro ao marcar como pago:', error);
          toast.error({
            title: 'Erro',
            message: 'Erro ao registrar pagamento. Tente novamente.',
          });
        } finally {
          setLoading(false);
        }
      },
      'info'
    );
  };

  const getTipoPontoLabel = (tipo: PontoTipo | null): string => {
    if (!tipo) return 'Nenhum';
    
    switch (tipo) {
      case 'entrada':
        return 'Entrada';
      case 'almoco_saida':
        return 'Saída para Almoço';
      case 'almoco_volta':
        return 'Volta do Almoço';
      case 'saida':
        return 'Saída Final';
      default:
        return tipo;
    }
  };

  const abrirModalNovo = () => {
    setFuncionarioEdicao(null);
    setFormNome('');
    setFormFuncao('');
    setFormDiariaBase('150');
    setFormEmail('');
    setFormSenha('');
    setFormConfirmarSenha('');
    setMostrarModalGestao(true);
  };

  const abrirModalEdicao = (funcionario: Funcionario) => {
    setFuncionarioEdicao(funcionario);
    setFormNome(funcionario.nome);
    setFormFuncao(funcionario.funcao);
    setFormDiariaBase(funcionario.diariaBase.toString());
    setFormEmail(''); // Não permite editar email
    setFormSenha('');
    setFormConfirmarSenha('');
    setMostrarModalGestao(true);
  };

  const fecharModalGestao = () => {
    setMostrarModalGestao(false);
    setFuncionarioEdicao(null);
  };

  const salvarFuncionario = async () => {
    if (!formNome.trim() || !formFuncao.trim()) {
      toast.warning({
        title: 'Atenção',
        message: 'Nome e função são obrigatórios',
      });
      return;
    }

    // Validações para novo funcionário
    if (!funcionarioEdicao) {
      if (!formEmail.trim()) {
        toast.warning({
          title: 'Atenção',
          message: 'Email é obrigatório para criar login',
        });
        return;
      }

      if (!formSenha || formSenha.length < 6) {
        toast.warning({
          title: 'Atenção',
          message: 'Senha deve ter no mínimo 6 caracteres',
        });
        return;
      }

      if (formSenha !== formConfirmarSenha) {
        toast.warning({
          title: 'Atenção',
          message: 'As senhas não coincidem',
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formEmail)) {
        toast.warning({
          title: 'Atenção',
          message: 'Email inválido',
        });
        return;
      }
    }

    const diariaBase = parseFloat(formDiariaBase) || 150;

    setLoading(true);

    try {
      if (funcionarioEdicao) {
        // Editar funcionário existente (apenas dados do Firestore)
        const funcionarioRef = doc(db, `companies/${companyId}/funcionarios`, funcionarioEdicao.id);
        await updateDoc(funcionarioRef, {
          nome: formNome.trim(),
          funcao: formFuncao.trim(),
          diariaBase,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        toast.success({
          title: 'Sucesso!',
          message: 'Funcionário atualizado com sucesso!',
        });
      } else {
        // Criar novo funcionário
        console.log('🔵 Iniciando criação de funcionário...');
        
        // 1. Criar usuário no Firebase Authentication via backend
        const response = await fetch('/api/usuarios/create-funcionario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            email: formEmail.trim(),
            password: formSenha,
            name: formNome.trim(),
            companyId,
            role: 'user', // Funcionário sempre é 'user'
          }),
        });

        console.log('🔵 Response status:', response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error('❌ Erro na resposta:', error);
          throw new Error(error.message || 'Erro ao criar usuário');
        }

        const responseData = await response.json();
        console.log('🔵 Response data:', responseData);
        
        const userId = responseData.data?.userId;
        console.log('🔵 userId extraído:', userId);

        if (!userId) {
          console.error('❌ userId não encontrado na resposta:', responseData);
          throw new Error('Erro: userId não retornado pelo servidor');
        }

        // 2. Criar documento do funcionário no Firestore
        console.log('🔵 Criando documento no Firestore...');
        const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
        const docData = {
          userId, // Referência ao usuário do Firebase Auth
          nome: formNome.trim(),
          funcao: formFuncao.trim(),
          diariaBase,
          email: formEmail.trim(),
          deletedAt: null,
          pagoDia: null,
          companyId,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        };
        console.log('🔵 Dados do documento:', docData);
        
        await addDoc(funcionariosRef, docData);
        console.log('✅ Funcionário criado com sucesso!');

        toast.success({
          title: 'Sucesso!',
          message: `Funcionário cadastrado!\n\nLogin criado:\nEmail: ${formEmail}\nSenha: ${formSenha}\n\nO funcionário já pode fazer login.`,
        });
      }

      await carregarFuncionarios();
      fecharModalGestao();
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      
      // Mensagens de erro específicas do Firebase Auth
      if (error.message?.includes('email-already-in-use')) {
        toast.error({
          title: 'Erro',
          message: 'Este email já está cadastrado no sistema',
        });
      } else if (error.message?.includes('invalid-email')) {
        toast.error({
          title: 'Erro',
          message: 'Email inválido',
        });
      } else if (error.message?.includes('weak-password')) {
        toast.error({
          title: 'Erro',
          message: 'Senha muito fraca. Use no mínimo 6 caracteres',
        });
      } else {
        toast.error({
          title: 'Erro',
          message: `Erro ao salvar funcionário: ${error.message}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const desativarFuncionario = async (funcionarioId: string) => {
    abrirConfirmacao(
      'Desativar Funcionário',
      'Desativar este funcionário? Ele não poderá mais bater ponto.',
      async () => {
        setLoading(true);

        try {
          const funcionarioRef = doc(db, `companies/${companyId}/funcionarios`, funcionarioId);
          await updateDoc(funcionarioRef, {
            deletedAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
          });

          await carregarFuncionarios();
          setFuncionarioSelecionado(null);
          toast.success({
            title: 'Sucesso!',
            message: 'Funcionário desativado com sucesso!',
          });
        } catch (error) {
          console.error('Erro ao desativar funcionário:', error);
          toast.error({
            title: 'Erro',
            message: 'Erro ao desativar funcionário. Tente novamente.',
          });
        } finally {
          setLoading(false);
        }
      },
      'danger'
    );
  };

  const podeGerenciar = userRole === 'admin_platform' || userRole === 'owner';

  const getStatusColor = (status: PontoStatus) => {
    switch (status) {
      case 'trabalhando':
        return '#34C759';
      case 'almoco':
        return '#FF9500';
      case 'deslocamento':
        return '#007AFF';
      case 'fora':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: PontoStatus) => {
    switch (status) {
      case 'trabalhando':
        return 'Trabalhando';
      case 'almoco':
        return 'Em almoço';
      case 'deslocamento':
        return 'Em deslocamento';
      case 'fora':
        return 'Fora / Ausente';
      default:
        return 'Desconhecido';
    }
  };

  const calcularHorasTrabalhadas = (pontos: Ponto[]): number => {
    // Usar função de pontoValidation.ts que já tem a lógica correta
    return calcularHoras(pontos);
  };

  const calcularDiaria = (funcionario: Funcionario): number => {
    const horasTrabalhadas = calcularHorasTrabalhadas(funcionario.pontosHoje);
    const horasMinimas = 8;
    
    if (horasTrabalhadas >= horasMinimas) {
      return funcionario.diariaBase;
    }
    
    // Proporcional
    return (funcionario.diariaBase / horasMinimas) * horasTrabalhadas;
  };

  const funcionarioAtual = funcionarios.find(f => f.id === funcionarioSelecionado);

  // Tela de Bater Ponto
  if (mostrarPonto) {
    const proximoTipo = funcionarios[0] ? proximoPontoPermitido(funcionarios[0].pontosHoje) : 'entrada';
    
    return (
      <>
        <div 
          className="ponto-virtual-container"
          style={{
            padding: '20px',
            paddingBottom: '120px',
            background: '#FFFFFF',
            minHeight: '100vh',
          }}
        >
          <header 
            className="ponto-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <button
              onClick={() => setMostrarPonto(false)}
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: '#F8F8F8',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#007AFF',
              }}
            >
              ← Voltar
            </button>
            <h1
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: '#000000',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Registrar Ponto
            </h1>
            <div style={{ width: '80px' }} />
          </header>

          {/* Localização */}
          <div
            style={{
              padding: '18px',
              background: localizacaoAtual ? 'rgba(52, 199, 89, 0.08)' : 'rgba(255, 149, 0, 0.08)',
              border: `1px solid ${localizacaoAtual ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 149, 0, 0.2)'}`,
              borderRadius: '14px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {loading ? (
                <Loader className="animate-spin" style={{ width: '20px', height: '20px', color: '#FF9500' }} />
              ) : (
                <MapPin style={{ width: '20px', height: '20px', color: localizacaoAtual ? '#34C759' : '#FF9500', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {loading ? 'Obtendo localização...' : localizacaoAtual ? 'Localização obtida' : 'Erro na localização'}
                </span>
                {localizacaoAtual && (
                  <span
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#666666',
                      display: 'block',
                    }}
                  >
                    {localizacaoAtual.endereco}
                  </span>
                )}
                {erroLocalizacao && (
                  <span
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#FF3B30',
                      display: 'block',
                    }}
                  >
                    {erroLocalizacao}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Próximo Ponto Permitido */}
          {proximoTipo && (
            <div
              style={{
                padding: '16px',
                background: 'rgba(0, 122, 255, 0.08)',
                border: '1px solid rgba(0, 122, 255, 0.2)',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#007AFF',
                }}
              >
                Próximo ponto: {getTipoPontoLabel(proximoTipo)}
              </span>
            </div>
          )}

          {/* Botões de Ponto */}
          <div className="ponto-botoes" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleBaterPonto('entrada')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'entrada'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'entrada' ? 'linear-gradient(135deg, #34C759, #30D158)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'entrada') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'entrada' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'entrada' ? '0 3px 12px rgba(52, 199, 89, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'entrada' ? 1 : 0.5,
              }}
            >
              <Clock style={{ width: '24px', height: '24px' }} />
              <span>Entrada</span>
            </button>

            <button
              onClick={() => handleBaterPonto('almoco_saida')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'almoco_saida'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'almoco_saida' ? 'linear-gradient(135deg, #FF9500, #FF8C00)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'almoco_saida') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'almoco_saida' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'almoco_saida' ? '0 3px 12px rgba(255, 149, 0, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'almoco_saida' ? 1 : 0.5,
              }}
            >
              <Coffee style={{ width: '24px', height: '24px' }} />
              <span>Saída Almoço</span>
            </button>

            <button
              onClick={() => handleBaterPonto('almoco_volta')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'almoco_volta'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'almoco_volta' ? 'linear-gradient(135deg, #007AFF, #0051D5)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'almoco_volta') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'almoco_volta' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'almoco_volta' ? '0 3px 12px rgba(0, 122, 255, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'almoco_volta' ? 1 : 0.5,
              }}
            >
              <CheckCircle2 style={{ width: '24px', height: '24px' }} />
              <span>Volta Almoço</span>
            </button>

            <button
              onClick={() => handleBaterPonto('saida')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'saida'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'saida' ? 'linear-gradient(135deg, #FF3B30, #FF2D55)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'saida') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'saida' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'saida' ? '0 3px 12px rgba(255, 59, 48, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'saida' ? 1 : 0.5,
              }}
            >
              <LogOut style={{ width: '24px', height: '24px' }} />
              <span>Saída Final</span>
            </button>
          </div>

          {/* Aviso Legal */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: '#F8F8F8',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#666666', flexShrink: 0, marginTop: '2px' }} />
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666666',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                Seu ponto será registrado com data, hora e localização GPS. Este registro tem validade legal e será usado para cálculo de pagamento.
              </p>
            </div>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  // Tela de Detalhes do Funcionário
  if (funcionarioSelecionado && funcionarioAtual) {
    const diariaCalculada = calcularDiaria(funcionarioAtual);
    const horasTrabalhadas = calcularHorasTrabalhadas(funcionarioAtual.pontosHoje);
    
    return (
      <>
        <div
          className="funcionario-detalhe-container"
          style={{
            padding: '0',
            paddingBottom: '100px',
            background: 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)',
            minHeight: '100vh',
          }}
        >
          {/* Header com Botão Voltar */}
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              padding: '16px 20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <button
              onClick={() => setFuncionarioSelecionado(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                color: '#007AFF',
              }}
            >
              <ChevronRight style={{ width: '18px', height: '18px', transform: 'rotate(180deg)' }} />
              <span>Equipe</span>
            </button>
          </header>

          {/* Hero Card - Avatar e Info Principal */}
          <div
            style={{
              padding: '24px 20px',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Avatar Grande Premium */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${getStatusColor(funcionarioAtual.status)}15 0%, ${getStatusColor(funcionarioAtual.status)}08 100%)`,
                    padding: '5px',
                    boxShadow: `0 8px 24px ${getStatusColor(funcionarioAtual.status)}20`,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      fontSize: '38px',
                      fontWeight: 700,
                      letterSpacing: '-1.5px',
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {funcionarioAtual.nome.charAt(0)}
                  </div>
                </div>
                
                {/* Status Indicator Grande */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: getStatusColor(funcionarioAtual.status),
                    border: '4px solid #FFFFFF',
                    boxShadow: `0 3px 12px ${getStatusColor(funcionarioAtual.status)}60`,
                    animation: 'pulse-status 2s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Nome e Cargo */}
              <h1
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#000000',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.8px',
                }}
              >
                {funcionarioAtual.nome}
              </h1>
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#666666',
                  margin: '0 0 12px 0',
                }}
              >
                {funcionarioAtual.funcao}
              </p>

              {/* Status Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: `linear-gradient(135deg, ${getStatusColor(funcionarioAtual.status)}12 0%, ${getStatusColor(funcionarioAtual.status)}08 100%)`,
                  borderRadius: '20px',
                  border: `1px solid ${getStatusColor(funcionarioAtual.status)}20`,
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getStatusColor(funcionarioAtual.status),
                    boxShadow: `0 0 8px ${getStatusColor(funcionarioAtual.status)}60`,
                  }}
                />
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: getStatusColor(funcionarioAtual.status),
                  }}
                >
                  {getStatusLabel(funcionarioAtual.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas em Grid */}
          <div
            style={{
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            {/* Horas Trabalhadas */}
            <div
              style={{
                padding: '20px 16px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto 12px auto',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.08) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock style={{ width: '20px', height: '20px', color: '#007AFF' }} />
              </div>
              <div
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#007AFF',
                  marginBottom: '4px',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-1px',
                }}
              >
                {horasTrabalhadas.toFixed(1)}h
              </div>
              <div
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Trabalhadas
              </div>
            </div>

            {/* Diária */}
            <div
              style={{
                padding: '20px 16px',
                background: funcionarioAtual.pagoDia
                  ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'
                  : 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
                borderRadius: '16px',
                border: funcionarioAtual.pagoDia
                  ? '1px solid rgba(16, 185, 129, 0.2)'
                  : '1px solid rgba(245, 158, 11, 0.2)',
                boxShadow: funcionarioAtual.pagoDia
                  ? '0 2px 12px rgba(16, 185, 129, 0.1)'
                  : '0 2px 12px rgba(245, 158, 11, 0.1)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto 12px auto',
                  borderRadius: '12px',
                  background: funcionarioAtual.pagoDia ? '#10B981' : '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: funcionarioAtual.pagoDia
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                <DollarSign style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </div>
              <div
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: funcionarioAtual.pagoDia ? '#10B981' : '#F59E0B',
                  marginBottom: '4px',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.8px',
                }}
              >
                R$ {diariaCalculada.toFixed(2)}
              </div>
              <div
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: funcionarioAtual.pagoDia ? '#059669' : '#D97706',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {funcionarioAtual.pagoDia ? 'PAGO' : 'PENDENTE'}
              </div>
            </div>
          </div>

          {/* Botão Marcar como Pago */}
          {!funcionarioAtual.pagoDia && (
            <div style={{ padding: '0 20px 20px 20px' }}>
              <button
                onClick={() => handleMarcarPago(funcionarioAtual.id)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #34C759, #30D158)',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(52, 199, 89, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                <span>{loading ? 'Processando...' : 'Marcar como Pago'}</span>
              </button>
            </div>
          )}

          {/* Timeline de Pontos */}
          <div style={{ padding: '0 20px 20px 20px' }}>
            <h3
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 16px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Registro de Pontos
            </h3>

            {funcionarioAtual.pontosHoje.length > 0 ? (
              <div style={{ position: 'relative' }}>
                {/* Linha Vertical da Timeline */}
                <div
                  style={{
                    position: 'absolute',
                    left: '19px',
                    top: '20px',
                    bottom: '20px',
                    width: '2px',
                    background: 'linear-gradient(180deg, #007AFF 0%, rgba(0, 122, 255, 0.2) 100%)',
                  }}
                />

                {/* Pontos da Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {funcionarioAtual.pontosHoje.map((ponto) => (
                    <div
                      key={ponto.id}
                      style={{
                        position: 'relative',
                        paddingLeft: '52px',
                      }}
                    >
                      {/* Dot da Timeline */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '8px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#007AFF',
                          border: '3px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.4)',
                          zIndex: 1,
                        }}
                      />

                      {/* Card do Ponto */}
                      <div
                        style={{
                          padding: '14px 16px',
                          background: '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {/* Hora e Tipo */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock style={{ width: '16px', height: '16px', color: '#007AFF' }} />
                            <span
                              style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#000000',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {ponto.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span
                            style={{
                              padding: '4px 10px',
                              background: 'rgba(0, 122, 255, 0.1)',
                              borderRadius: '8px',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#007AFF',
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                            }}
                          >
                            {getTipoPontoLabel(ponto.tipo)}
                          </span>
                        </div>

                        {/* Localização */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin style={{ width: '14px', height: '14px', color: '#999999', marginTop: '2px', flexShrink: 0 }} />
                          <span
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#666666',
                              lineHeight: '1.4',
                            }}
                          >
                            {ponto.localizacao.endereco}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    margin: '0 auto 16px auto',
                    borderRadius: '50%',
                    background: '#F8F8F8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock style={{ width: '28px', height: '28px', color: '#CCCCCC' }} />
                </div>
                <p
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#999999',
                    margin: 0,
                  }}
                >
                  Nenhum ponto registrado hoje
                </p>
              </div>
            )}
          </div>

          {/* Ações de Gestão */}
          {podeGerenciar && (
            <div style={{ padding: '0 20px 20px 20px' }}>
              <div
                style={{
                  padding: '16px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <h4
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#666666',
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Ações de Gestão
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => abrirModalEdicao(funcionarioAtual)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#007AFF',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => desativarFuncionario(funcionarioAtual.id)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#FF3B30',
                    }}
                  >
                    Desativar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Dock />
      </>
    );
  }

  // Lista Principal de Funcionários
  return (
    <>
      <div
        className="equipe-container"
        style={{
          padding: '20px',
          paddingBottom: '120px',
          background: '#FFFFFF',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '26px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 4px 0',
                letterSpacing: '-0.6px',
              }}
            >
              Equipe
            </h1>
            <p
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#666666',
                margin: 0,
              }}
            >
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {podeGerenciar && (
              <button
                onClick={abrirModalNovo}
                disabled={loading}
                style={{
                  padding: '11px 18px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#007AFF',
                }}
              >
                Gerenciar Equipe
              </button>
            )}
            <button
              onClick={() => setMostrarPonto(true)}
              disabled={loading}
              style={{
                padding: '11px 18px',
                background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                border: 'none',
                borderRadius: '11px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                boxShadow: '0 3px 10px rgba(0, 122, 255, 0.3)',
              }}
            >
              {loading ? 'Carregando...' : 'Bater Ponto'}
            </button>
          </div>
        </header>

        {/* Cards de Funcionários */}
        {loadingInicial ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
            }}
          >
            <Loader className="animate-spin" style={{ width: '32px', height: '32px', color: '#007AFF' }} />
          </div>
        ) : funcionarios.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {funcionarios.map((funcionario) => {
              const diariaCalculada = calcularDiaria(funcionario);
              
              return (
                <div
                  key={funcionario.id}
                  onClick={() => setFuncionarioSelecionado(funcionario.id)}
                  className="employee-card-luxury"
                  style={{
                    position: 'relative',
                    padding: '0',
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Barra de Status Lateral */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: `linear-gradient(180deg, ${getStatusColor(funcionario.status)} 0%, ${getStatusColor(funcionario.status)}CC 100%)`,
                      boxShadow: `0 0 12px ${getStatusColor(funcionario.status)}40`,
                      borderTopLeftRadius: '20px',
                      borderBottomLeftRadius: '20px',
                    }}
                  />

                  {/* Shimmer Effect */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                      animation: 'shimmer 3s infinite',
                      pointerEvents: 'none',
                    }}
                  />

                  <div style={{ padding: '16px 16px 16px 20px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Avatar Compacto Premium */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${getStatusColor(funcionario.status)}12 0%, ${getStatusColor(funcionario.status)}06 100%)`,
                            padding: '3px',
                            boxShadow: `0 2px 12px ${getStatusColor(funcionario.status)}20`,
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                              fontSize: '22px',
                              fontWeight: 700,
                              letterSpacing: '-0.5px',
                              boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            {funcionario.nome.charAt(0)}
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: getStatusColor(funcionario.status),
                            border: '2.5px solid #FFFFFF',
                            boxShadow: `0 2px 6px ${getStatusColor(funcionario.status)}50`,
                            animation: 'pulse-status 2s ease-in-out infinite',
                          }}
                        />
                      </div>

                      {/* Informações Compactas */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Nome e Cargo */}
                        <h3
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            fontSize: '17px',
                            fontWeight: 700,
                            color: '#000000',
                            margin: '0 0 3px 0',
                            letterSpacing: '-0.4px',
                            lineHeight: '1.2',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {funcionario.nome}
                        </h3>
                        <p
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#666666',
                            margin: '0 0 8px 0',
                            letterSpacing: '-0.1px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {funcionario.funcao}
                        </p>

                        {/* Métricas Inline */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* Status Badge Compacto */}
                          <div
                            style={{
                              padding: '4px 10px',
                              background: `linear-gradient(135deg, ${getStatusColor(funcionario.status)}10 0%, ${getStatusColor(funcionario.status)}06 100%)`,
                              borderRadius: '8px',
                              border: `1px solid ${getStatusColor(funcionario.status)}18`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <div
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: getStatusColor(funcionario.status),
                                boxShadow: `0 0 6px ${getStatusColor(funcionario.status)}50`,
                              }}
                            />
                            <span
                              style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: getStatusColor(funcionario.status),
                                letterSpacing: '-0.1px',
                              }}
                            >
                              {getStatusLabel(funcionario.status)}
                            </span>
                          </div>

                          {/* Último Ponto Compacto */}
                          {funcionario.ultimoPonto && (
                            <>
                              <span style={{ color: '#DDDDDD', fontSize: '10px' }}>•</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock style={{ width: '11px', height: '11px', color: '#007AFF', opacity: 0.7 }} />
                                <span
                                  style={{
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#007AFF',
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {funcionario.ultimoPonto.timestamp.toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Valor e Chevron */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                        {/* Valor Compacto */}
                        <div
                          style={{
                            padding: '6px 10px',
                            background: funcionario.pagoDia 
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)'
                              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
                            borderRadius: '10px',
                            border: funcionario.pagoDia 
                              ? '1px solid rgba(16, 185, 129, 0.2)'
                              : '1px solid rgba(245, 158, 11, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              fontSize: '9px',
                              fontWeight: 600,
                              color: funcionario.pagoDia ? '#059669' : '#D97706',
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                              marginBottom: '2px',
                            }}
                          >
                            {funcionario.pagoDia ? 'PAGO' : 'PEND'}
                          </div>
                          <div
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                              fontSize: '15px',
                              fontWeight: 800,
                              color: funcionario.pagoDia ? '#10B981' : '#F59E0B',
                              fontVariantNumeric: 'tabular-nums',
                              letterSpacing: '-0.5px',
                              lineHeight: '1',
                            }}
                          >
                            R$ {diariaCalculada.toFixed(2)}
                          </div>
                        </div>

                        {/* Chevron */}
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: 'rgba(0, 0, 0, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ChevronRight style={{ width: '14px', height: '14px', color: '#999999' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8F8F8',
                borderRadius: '18px',
                marginBottom: '20px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <AlertCircle style={{ width: '36px', height: '36px', color: '#999999' }} />
            </div>
            <h3
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#000000',
                margin: '0 0 8px 0',
              }}
            >
              Nenhum funcionário cadastrado
            </h3>
            <p
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#666666',
                margin: 0,
                maxWidth: '280px',
              }}
            >
              Cadastre funcionários no sistema para começar o controle de ponto
            </p>
          </div>
        )}
      </div>

      {/* Modal - Gestão de Funcionário */}
      {mostrarModalGestao && (
        <div 
          className="modal-overlay" 
          onClick={fecharModalGestao}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '18px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div 
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000000',
                  margin: 0,
                  letterSpacing: '-0.4px',
                }}
              >
                {funcionarioEdicao ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <button
                onClick={fecharModalGestao}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F8F8F8',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#666666',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div 
              style={{
                padding: '20px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Nome */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#000000',
                      marginBottom: '8px',
                    }}
                  >
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#000000',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>

                {/* Função */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#000000',
                      marginBottom: '8px',
                    }}
                  >
                    Função *
                  </label>
                  <input
                    type="text"
                    value={formFuncao}
                    onChange={(e) => setFormFuncao(e.target.value)}
                    placeholder="Ex: Operador de Carga"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#000000',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>

                {/* Email (apenas para novo funcionário) */}
                {!funcionarioEdicao && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#000000',
                        marginBottom: '8px',
                      }}
                    >
                      Email (Login) *
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="funcionario@empresa.com"
                      autoComplete="off"
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#000000',
                        background: '#F8F8F8',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '11px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <p
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#666666',
                        margin: '6px 0 0 0',
                      }}
                    >
                      Email será usado para login no sistema
                    </p>
                  </div>
                )}

                {/* Senha (apenas para novo funcionário) */}
                {!funcionarioEdicao && (
                  <>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#000000',
                          marginBottom: '8px',
                        }}
                      >
                        Senha *
                      </label>
                      <input
                        type="password"
                        value={formSenha}
                        onChange={(e) => setFormSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        style={{
                          width: '100%',
                          padding: '14px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#000000',
                          background: '#F8F8F8',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '11px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#000000',
                          marginBottom: '8px',
                        }}
                      >
                        Confirmar Senha *
                      </label>
                      <input
                        type="password"
                        value={formConfirmarSenha}
                        onChange={(e) => setFormConfirmarSenha(e.target.value)}
                        placeholder="Digite a senha novamente"
                        autoComplete="new-password"
                        style={{
                          width: '100%',
                          padding: '14px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#000000',
                          background: '#F8F8F8',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '11px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Diária Base */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#000000',
                      marginBottom: '8px',
                    }}
                  >
                    Diária Base (R$)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={formDiariaBase}
                    onChange={(e) => setFormDiariaBase(e.target.value)}
                    placeholder="150.00"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#000000',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  <p
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#666666',
                      margin: '6px 0 0 0',
                    }}
                  >
                    Valor pago por dia completo de trabalho (8 horas)
                  </p>
                </div>

                {/* Aviso */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '14px',
                    background: 'rgba(0, 122, 255, 0.08)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    borderRadius: '11px',
                  }}
                >
                  <AlertCircle style={{ width: '16px', height: '16px', color: '#007AFF', flexShrink: 0, marginTop: '2px' }} />
                  <p
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#007AFF',
                      margin: 0,
                      lineHeight: '1.4',
                    }}
                  >
                    {funcionarioEdicao 
                      ? 'As alterações serão aplicadas imediatamente no sistema de ponto.'
                      : 'O funcionário poderá bater ponto assim que for cadastrado.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              style={{
                padding: '20px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                onClick={fecharModalGestao}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#666666',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarFuncionario}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                  border: 'none',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 3px 10px rgba(0, 122, 255, 0.3)',
                }}
              >
                {loading ? 'Salvando...' : funcionarioEdicao ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {modalConfirmacao.aberto && (
        <div 
          className="modal-overlay" 
          onClick={fecharConfirmacao}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: '#FFFFFF',
              borderRadius: '18px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease',
            }}
          >
            {/* Ícone e Título */}
            <div 
              style={{
                padding: '24px 24px 16px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 16px auto',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: modalConfirmacao.tipo === 'danger' 
                    ? 'rgba(255, 59, 48, 0.1)' 
                    : modalConfirmacao.tipo === 'warning'
                    ? 'rgba(255, 149, 0, 0.1)'
                    : 'rgba(0, 122, 255, 0.1)',
                }}
              >
                <AlertTriangle 
                  style={{ 
                    width: '28px', 
                    height: '28px', 
                    color: modalConfirmacao.tipo === 'danger' 
                      ? '#FF3B30' 
                      : modalConfirmacao.tipo === 'warning'
                      ? '#FF9500'
                      : '#007AFF',
                  }} 
                />
              </div>
              <h2
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000000',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.4px',
                }}
              >
                {modalConfirmacao.titulo}
              </h2>
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#666666',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                {modalConfirmacao.mensagem}
              </p>
            </div>

            {/* Botões */}
            <div 
              style={{
                padding: '16px 24px 24px 24px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                onClick={fecharConfirmacao}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#666666',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: modalConfirmacao.tipo === 'danger'
                    ? 'linear-gradient(135deg, #FF3B30, #FF2D55)'
                    : modalConfirmacao.tipo === 'warning'
                    ? 'linear-gradient(135deg, #FF9500, #FF8C00)'
                    : 'linear-gradient(135deg, #007AFF, #0051D5)',
                  border: 'none',
                  borderRadius: '11px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: modalConfirmacao.tipo === 'danger'
                    ? '0 3px 10px rgba(255, 59, 48, 0.3)'
                    : modalConfirmacao.tipo === 'warning'
                    ? '0 3px 10px rgba(255, 149, 0, 0.3)'
                    : '0 3px 10px rgba(0, 122, 255, 0.3)',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock />
    </>
  );
};

export default FuncionariosPageCore;
