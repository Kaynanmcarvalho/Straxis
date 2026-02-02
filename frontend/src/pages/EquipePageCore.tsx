import React, { useState, useEffect } from 'react';
import { 
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Loader,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './EquipePageCore.css';
import { db } from '../config/firebase.config';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { validarPonto, calcularHorasTrabalhadas } from '../utils/pontoValidation';
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
  status: PontoStatus;
  ultimoPonto?: Ponto;
  pontosHoje: Ponto[];
  diariaBase: number;
  companyId: string;
}

const EquipePageCore: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string | null>(null);
  const [mostrarPonto, setMostrarPonto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<Localizacao | null>(null);
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);

  const toast = useToast();
  const { user } = useAuth();

  const companyId = user?.companyId || 'dev-company-id';
  const userRole = (user?.role as 'admin_platform' | 'owner' | 'user') || 'owner';

  useEffect(() => {
    carregarFuncionarios();
  }, []);

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

  const carregarFuncionarios = async () => {
    try {
      const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
      const q = query(funcionariosRef, where('deletedAt', '==', null));
      const snapshot = await getDocs(q);
      
      const funcionariosData: Funcionario[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const funcionarioId = docSnap.id;
        
        const pontosHoje = await carregarPontosHoje(funcionarioId);
        const ultimoPonto = pontosHoje.length > 0 ? pontosHoje[pontosHoje.length - 1] : undefined;
        const status = calcularStatus(pontosHoje);
        
        funcionariosData.push({
          id: funcionarioId,
          nome: data.nome,
          funcao: data.funcao || 'Operador',
          status,
          ultimoPonto,
          pontosHoje,
          diariaBase: data.diariaBase || 150,
          companyId,
        });
      }
      
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao carregar funcionários. Verifique a conexão.',
      });
    }
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
        return null;
      default:
        return 'entrada';
    }
  };

  const handleBaterPonto = async (tipo: PontoTipo) => {
    if (!localizacaoAtual) {
      toast.warning({
        title: 'Aguarde',
        message: 'Aguarde a localização ser obtida...',
      });
      return;
    }

    const funcId = user?.uid;
    
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
      const validacao = validarPonto(
        tipo,
        funcionario.pontosHoje,
        localizacaoAtual
      );

      if (!validacao.valido) {
        toast.warning({
          title: 'Ponto Inválido',
          message: validacao.erro || 'Não é possível registrar este ponto agora',
        });
        return;
      }

      await registrarPonto(
        companyId,
        funcId,
        user?.uid || 'system',
        tipo,
        localizacaoAtual
      );

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
    } finally {
      setLoading(false);
    }
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
        return 'Ausente';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusSymbol = (status: PontoStatus) => {
    switch (status) {
      case 'trabalhando':
        return '●';
      case 'almoco':
        return '◐';
      case 'deslocamento':
        return '◎';
      case 'fora':
        return '○';
      default:
        return '○';
    }
  };

  const calcularValorAcumulado = (funcionario: Funcionario): number => {
    const horasTrabalhadas = calcularHorasTrabalhadas(funcionario.pontosHoje);
    const horasMinimas = 8;
    
    if (horasTrabalhadas >= horasMinimas) {
      return funcionario.diariaBase;
    }
    
    return (funcionario.diariaBase / horasMinimas) * horasTrabalhadas;
  };

  const funcionarioAtual = funcionarios.find(f => f.id === funcionarioSelecionado);

  // Estatísticas
  const totalFuncionarios = funcionarios.length;
  const trabalhando = funcionarios.filter(f => f.status === 'trabalhando').length;
  const emPausa = funcionarios.filter(f => f.status === 'almoco').length;
  const ausentes = funcionarios.filter(f => f.status === 'fora').length;

  // Modal de Ponto
  if (mostrarPonto) {
    const funcionarioLogado = funcionarios.find(f => f.id === user?.uid);
    const proximoTipo = funcionarioLogado ? proximoPontoPermitido(funcionarioLogado.pontosHoje) : 'entrada';
    
    return (
      <>
        <div className="equipe-ponto-container">
          <header className="equipe-ponto-header">
            <button
              onClick={() => setMostrarPonto(false)}
              disabled={loading}
              className="btn-voltar"
            >
              ← Voltar
            </button>
            <h1 className="ponto-title">Registrar Ponto</h1>
            <div style={{ width: '80px' }} />
          </header>

          {/* Localização */}
          <div className={`localizacao-card ${localizacaoAtual ? 'success' : 'warning'}`}>
            <div className="localizacao-content">
              {loading ? (
                <Loader className="animate-spin localizacao-icon" />
              ) : (
                <MapPin className="localizacao-icon" />
              )}
              <div className="localizacao-info">
                <span className="localizacao-status">
                  {loading ? 'Obtendo localização...' : localizacaoAtual ? 'Localização obtida' : 'Erro na localização'}
                </span>
                {localizacaoAtual && (
                  <span className="localizacao-endereco">{localizacaoAtual.endereco}</span>
                )}
                {erroLocalizacao && (
                  <span className="localizacao-erro">{erroLocalizacao}</span>
                )}
              </div>
            </div>
          </div>

          {/* Próximo Ponto */}
          {proximoTipo && (
            <div className="proximo-ponto-card">
              <span className="proximo-ponto-label">
                Próximo ponto: {getTipoPontoLabel(proximoTipo)}
              </span>
            </div>
          )}

          {/* Botão de Ponto */}
          <button
            onClick={() => handleBaterPonto(proximoTipo!)}
            disabled={loading || !localizacaoAtual || !proximoTipo}
            className={`btn-bater-ponto ${proximoTipo ? 'active' : 'disabled'}`}
          >
            <Clock className="btn-icon" />
            <span>{getTipoPontoLabel(proximoTipo)}</span>
          </button>

          {/* Aviso Legal */}
          <div className="aviso-legal">
            <AlertCircle className="aviso-icon" />
            <p className="aviso-text">
              Seu ponto será registrado com data, hora e localização GPS. Este registro tem validade legal e será usado para cálculo de pagamento.
            </p>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  // Modal de Detalhes
  if (funcionarioSelecionado && funcionarioAtual) {
    const valorAcumulado = calcularValorAcumulado(funcionarioAtual);
    const horasTrabalhadas = calcularHorasTrabalhadas(funcionarioAtual.pontosHoje);
    
    return (
      <>
        <div className="equipe-detalhe-container">
          <header className="equipe-detalhe-header">
            <button
              onClick={() => setFuncionarioSelecionado(null)}
              className="btn-voltar"
            >
              ← Voltar
            </button>
          </header>

          {/* Card do Funcionário */}
          <div className="funcionario-card-detalhe">
            <div className="funcionario-header">
              <div className="funcionario-avatar">
                {funcionarioAtual.nome.charAt(0)}
              </div>
              <div className="funcionario-info">
                <h2 className="funcionario-nome">{funcionarioAtual.nome}</h2>
                <p className="funcionario-funcao">{funcionarioAtual.funcao}</p>
              </div>
            </div>

            <div className="funcionario-status-badge">
              <div 
                className="status-dot" 
                style={{ background: getStatusColor(funcionarioAtual.status) }}
              />
              <span className="status-label">{getStatusLabel(funcionarioAtual.status)}</span>
            </div>
          </div>

          {/* Horas Trabalhadas */}
          <div className="info-card">
            <div className="info-row">
              <div className="info-label-group">
                <Clock className="info-icon" />
                <span className="info-label">Horas Trabalhadas</span>
              </div>
              <span className="info-value">{horasTrabalhadas.toFixed(1)}h</span>
            </div>
          </div>

          {/* Valor Acumulado */}
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Valor Acumulado Hoje</span>
              <span className="info-value-money">R$ {valorAcumulado.toFixed(2)}</span>
            </div>
          </div>

          {/* Pontos de Hoje */}
          <div className="pontos-card">
            <h3 className="pontos-title">Registro de Pontos</h3>
            {funcionarioAtual.pontosHoje.length > 0 ? (
              <div className="pontos-lista">
                {funcionarioAtual.pontosHoje.map((ponto) => (
                  <div key={ponto.id} className="ponto-item">
                    <div className="ponto-info">
                      <div className="ponto-time-group">
                        <Clock className="ponto-icon" />
                        <span className="ponto-time">
                          {ponto.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="ponto-tipo">• {getTipoPontoLabel(ponto.tipo)}</span>
                      </div>
                      <div className="ponto-location">
                        <MapPin className="location-icon" />
                        <span className="location-text">{ponto.localizacao.endereco}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pontos-vazio">
                Nenhum ponto registrado hoje
              </div>
            )}
          </div>
        </div>
        <Dock />
      </>
    );
  }

  // Lista Principal
  return (
    <>
      <div className="equipe-container">
        {/* Topo Editorial */}
        <header className="equipe-header">
          <div className="equipe-title-group">
            <h1 className="equipe-title">Equipe</h1>
            <p className="equipe-date">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
          <div className="equipe-actions">
            <button
              onClick={() => setMostrarPonto(true)}
              disabled={loading}
              className="btn-bater-ponto-header"
            >
              Bater Ponto
            </button>
            {(userRole === 'admin_platform' || userRole === 'owner') && (
              <button
                onClick={() => window.location.href = '/funcionarios'}
                className="btn-gerenciar"
              >
                Gerenciar
              </button>
            )}
          </div>
        </header>

        {/* Visão Geral */}
        {totalFuncionarios > 0 && (
          <div className="equipe-overview">
            <span className="overview-item">
              <span className="overview-number">{totalFuncionarios}</span> total
            </span>
            <span className="overview-separator">•</span>
            <span className="overview-item">
              <span className="overview-number">{trabalhando}</span> trabalhando
            </span>
            <span className="overview-separator">•</span>
            <span className="overview-item">
              <span className="overview-number">{emPausa}</span> pausa
            </span>
            <span className="overview-separator">•</span>
            <span className="overview-item">
              <span className="overview-number">{ausentes}</span> ausentes
            </span>
          </div>
        )}

        {/* Lista de Funcionários */}
        <div className="equipe-content">
          {loading && funcionarios.length === 0 ? (
            <div className="equipe-loading">
              <Loader className="animate-spin" />
            </div>
          ) : funcionarios.length > 0 ? (
            <div className="funcionarios-lista">
              {funcionarios.map((funcionario) => {
                const valorAcumulado = calcularValorAcumulado(funcionario);
                
                return (
                  <div
                    key={funcionario.id}
                    onClick={() => setFuncionarioSelecionado(funcionario.id)}
                    className={`funcionario-card status-${funcionario.status}`}
                  >
                    <div className="card-status-indicator">
                      <span 
                        className="status-symbol"
                        style={{ color: getStatusColor(funcionario.status) }}
                      >
                        {getStatusSymbol(funcionario.status)}
                      </span>
                    </div>

                    <div className="card-content">
                      <div className="card-header-row">
                        <h3 className="card-nome">{funcionario.nome}</h3>
                        <ChevronRight className="card-chevron" />
                      </div>
                      
                      <p className="card-funcao">{funcionario.funcao}</p>

                      <div className="card-footer">
                        <div className="card-info-group">
                          {funcionario.ultimoPonto && (
                            <span className="card-ultima-acao">
                              {getTipoPontoLabel(funcionario.ultimoPonto.tipo)} {funcionario.ultimoPonto.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {!funcionario.ultimoPonto && (
                            <span className="card-ultima-acao">Ausente hoje</span>
                          )}
                        </div>
                        
                        <div className="card-valor">
                          R$ {valorAcumulado.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="equipe-vazio">
              <div className="vazio-icon">
                <Users />
              </div>
              <h3 className="vazio-title">Nenhum funcionário cadastrado</h3>
              <p className="vazio-desc">
                Adicione funcionários para começar a gerenciar a equipe e registrar pontos.
              </p>
              {(userRole === 'admin_platform' || userRole === 'owner') && (
                <button
                  onClick={() => window.location.href = '/funcionarios'}
                  className="btn-adicionar"
                >
                  Adicionar Funcionário
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Dock />
    </>
  );
};

export default EquipePageCore;
