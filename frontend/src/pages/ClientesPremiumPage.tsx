import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase.config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy
} from 'firebase/firestore';
import { Cliente, ClienteFiltros } from '../types/cliente.types';
import { 
  calcularStatusCliente, 
  calcularDiasSemAtividade,
  calcularMetricasCarteira,
  gerarTextoAlertaReativacao
} from '../utils/cliente.logic';
import { ClientePerfilSheet } from '../components/clientes/ClientePerfilSheet';
import { NovoClienteMultiStep } from '../components/clientes/NovoClienteMultiStep';
import { ClienteCelulaPremium } from '../components/clientes/ClienteCelulaPremium';
import { ResumoCompacto } from '../components/clientes/ResumoCompacto';
import { InsightCard } from '../components/clientes/InsightCard';
import { SuccessBanner } from '../components/clientes/SuccessBanner';
import '../styles/clientes-premium.css';

const ClientesPremiumPage: React.FC = () => {
  const { user } = useAuth();
  const companyId = user?.companyId || 'dev-company-id';
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [sheetNovoAberto, setSheetNovoAberto] = useState(false);
  const [filtrosAtivos] = useState<ClienteFiltros>({});
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [alertaDismissed, setAlertaDismissed] = useState(false);

  // Carregar clientes com lógica impecável
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
        const historico = await carregarHistoricoCliente(docSnap.id);
        
        // Datas canônicas
        const createdAt = data.createdAt?.toDate() || new Date();
        const firstActivityAt = data.firstActivityAt?.toDate() || null;
        const lastActivityAt = historico.lastActivityAt;
        const lastContactAt = data.lastContactAt?.toDate() || null;
        
        // Calcular status com lógica impecável
        const status = calcularStatusCliente({
          createdAt,
          firstActivityAt,
          lastActivityAt,
          operacoesAtivas: historico.operacoesAtivas
        });
        
        const diasSemAtividade = calcularDiasSemAtividade({
          createdAt,
          lastActivityAt
        });
        
        clientesData.push({
          id: docSnap.id,
          nome: data.nome,
          tipo: data.tipo || 'PF',
          cpf: data.cpf,
          cnpj: data.cnpj,
          telefone: data.telefone,
          email: data.email,
          endereco: data.endereco,
          status,
          createdAt,
          firstActivityAt,
          lastActivityAt,
          lastContactAt,
          totalOperacoes: historico.totalOperacoes,
          operacoesAtivas: historico.operacoesAtivas,
          receitaTotal: historico.receitaTotal,
          receitaMes: historico.receitaMes,
          ticketMedio: historico.ticketMedio,
          crescimentoMes: historico.crescimentoMes,
          diasSemAtividade,
          tags: data.tags || [],
          isVIP: data.isVIP || false,
          companyId: data.companyId,
          deletedAt: null
        });
      }
      
      setClientes(clientesData);
    });
    
    return () => unsubscribe();
  }, [companyId]);

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
      const trabalhos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          data: data.data?.toDate() || new Date(),
          valorRecebidoCentavos: data.valorRecebidoCentavos || 0,
          status: data.status || 'pendente'
        };
      });
      
      const totalOperacoes = trabalhos.length;
      const operacoesAtivas = trabalhos.filter(t => 
        t.status === 'em_andamento' || t.status === 'pendente'
      ).length;
      
      const receitaTotal = trabalhos.reduce((sum, t) => 
        sum + (t.valorRecebidoCentavos || 0), 0
      );
      
      const hoje = new Date();
      const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      
      const trabalhosMesAtual = trabalhos.filter(t => t.data >= mesAtual);
      const trabalhosMesAnterior = trabalhos.filter(t => 
        t.data >= mesAnterior && t.data < mesAtual
      );
      
      const receitaMes = trabalhosMesAtual.reduce((sum, t) => 
        sum + (t.valorRecebidoCentavos || 0), 0
      );
      const receitaMesAnterior = trabalhosMesAnterior.reduce((sum, t) => 
        sum + (t.valorRecebidoCentavos || 0), 0
      );
      
      const crescimentoMes = receitaMesAnterior > 0
        ? ((receitaMes - receitaMesAnterior) / receitaMesAnterior) * 100
        : 0;
      
      const ticketMedio = totalOperacoes > 0 ? receitaTotal / totalOperacoes : 0;
      
      const lastActivityAt = trabalhos[0]?.data || null;
      
      return {
        totalOperacoes,
        operacoesAtivas,
        receitaTotal,
        receitaMes,
        ticketMedio,
        crescimentoMes,
        lastActivityAt
      };
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return {
        totalOperacoes: 0,
        operacoesAtivas: 0,
        receitaTotal: 0,
        receitaMes: 0,
        ticketMedio: 0,
        crescimentoMes: 0,
        lastActivityAt: null
      };
    }
  };

  // Métricas da carteira com lógica impecável
  const metricas = useMemo(() => {
    return calcularMetricasCarteira(clientes);
  }, [clientes]);

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      const matchSearch = cliente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cliente.telefone.includes(searchQuery);
      
      if (!matchSearch) return false;
      
      // Aplicar filtros de status
      if (filtrosAtivos.status && filtrosAtivos.status.length > 0) {
        if (!filtrosAtivos.status.includes(cliente.status)) {
          return false;
        }
      }
      
      // Aplicar filtros de tipo
      if (filtrosAtivos.tipo && filtrosAtivos.tipo.length > 0) {
        if (!filtrosAtivos.tipo.includes(cliente.tipo)) {
          return false;
        }
      }
      
      return true;
    });
  }, [clientes, searchQuery, filtrosAtivos]);

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(centavos / 100);
  };

  const handleClienteSuccess = () => {
    setSheetNovoAberto(false);
    setShowSuccessBanner(true);
  };

  const handleNovaOperacao = (cliente: Cliente) => {
    // TODO: Navegar para criar operação com cliente pré-selecionado
    setClienteSelecionado(cliente);
  };

  const handleCobrar = (cliente: Cliente) => {
    // TODO: Navegar para criar cobrança com cliente pré-selecionado
    setClienteSelecionado(cliente);
  };

  const handleReativar = () => {
    // TODO: Abrir sheet de reativação
    setAlertaDismissed(true);
  };

  const handleBannerNovaOperacao = () => {
    // TODO: Navegar para criar operação
    setShowSuccessBanner(false);
  };

  const handleBannerCobrar = () => {
    // TODO: Navegar para criar cobrança
    setShowSuccessBanner(false);
  };

  const textoAlerta = gerarTextoAlertaReativacao(metricas.clientesRisco);

  return (
    <div className="clientes-premium-page clientes-redesign-v2" style={{
      minHeight: '100vh',
      background: '#F5F5F7',
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
    }}>
      {/* Success Banner */}
      {showSuccessBanner && (
        <SuccessBanner
          titulo="Cliente adicionado"
          subtexto="Você pode criar uma operação agora"
          acoes={[
            {
              label: 'Criar operação',
              onClick: handleBannerNovaOperacao,
              primary: true
            },
            {
              label: 'Criar cobrança',
              onClick: handleBannerCobrar
            }
          ]}
          onDismiss={() => setShowSuccessBanner(false)}
        />
      )}

      {/* Header Editorial */}
      <header className="clientes-premium-header" style={{
        padding: '32px 16px 24px',
        background: '#FFFFFF'
      }}>
        <div className="header-title-section">
          <h1 className="header-title">Clientes</h1>
          <button 
            className="btn-add-circular"
            onClick={() => setSheetNovoAberto(true)}
            aria-label="Adicionar cliente"
          >
            <Plus size={24} />
          </button>
        </div>
        
        <div className="header-metrics">
          <span className="metric-item">{metricas.ativos} ativos</span>
          <span className="metric-divider">•</span>
          <span className="metric-item">Receita mês {formatCurrency(metricas.receitaMes)}</span>
          <span className="metric-divider">•</span>
          <span className="metric-item">Ticket médio {formatCurrency(metricas.ticketMedio)}</span>
        </div>
      </header>

      {/* Barra de Ação - Busca */}
      <div className="action-bar">
        <div className="search-premium">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar cliente"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Resumo Compacto - Apple Health Style */}
      <ResumoCompacto metricas={metricas} />

      {/* Insight Card - Alerta de Risco */}
      {metricas.clientesRisco > 0 && !alertaDismissed && (
        <InsightCard
          texto={textoAlerta}
          ctaLabel="Reativar"
          onCTA={handleReativar}
          onDismiss={() => setAlertaDismissed(true)}
        />
      )}

      {/* Lista de Clientes - Células Premium */}
      <div className="clientes-lista-premium">
        {clientesFiltrados.map((cliente) => (
          <ClienteCelulaPremium
            key={cliente.id}
            cliente={cliente}
            onClick={() => setClienteSelecionado(cliente)}
            onNovaOperacao={() => handleNovaOperacao(cliente)}
            onCobrar={() => handleCobrar(cliente)}
          />
        ))}
      </div>

      {/* Empty State */}
      {clientesFiltrados.length === 0 && clientes.length === 0 && (
        <div className="empty-state-premium">
          <h3 className="empty-title">Sua base começa aqui.</h3>
          <p className="empty-subtitle">
            Adicione seu primeiro cliente e organize operações e cobranças.
          </p>
          <button 
            className="btn-empty-primary"
            onClick={() => setSheetNovoAberto(true)}
          >
            Adicionar cliente
          </button>
        </div>
      )}

      {clientesFiltrados.length === 0 && clientes.length > 0 && (
        <div className="empty-state-premium">
          <h3 className="empty-title">Nenhum resultado.</h3>
          <p className="empty-subtitle">
            Tente ajustar sua busca ou filtros.
          </p>
        </div>
      )}

      {/* Sheets */}
      {clienteSelecionado && (
        <ClientePerfilSheet
          cliente={clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
          onUpdate={() => {
            // Dados recarregam automaticamente via onSnapshot
          }}
        />
      )}

      {sheetNovoAberto && (
        <NovoClienteMultiStep
          onClose={() => setSheetNovoAberto(false)}
          onSuccess={handleClienteSuccess}
        />
      )}
    </div>
  );
};

export default ClientesPremiumPage;
