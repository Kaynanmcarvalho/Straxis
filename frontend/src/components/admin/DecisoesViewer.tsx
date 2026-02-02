/**
 * Visualizador de Decisões - Straxis SaaS
 * Alpha 13.0.0 - MAJOR
 * 29/01/2026
 * 
 * Substituição completa do LogsViewer com UX humanizada
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissoes } from '../../hooks/usePermissoes';
import { Permissao } from '../../types/permissoes.types';
import {
  RegistroDecisao,
  FiltrosDecisao,
  TipoDecisao,
  OrigemDecisao,
  CriticidadeDecisao,
  TIPO_DECISAO_LABELS,
  ORIGEM_DECISAO_LABELS,
  CRITICIDADE_DECISAO_LABELS,
} from '../../types/decisao.types';
import { decisaoService } from '../../services/decisao.service';
import { DecisaoItem } from './DecisaoItem';

export const DecisoesViewer: React.FC = () => {
  const { user } = useAuth();
  const { temPermissao, isAdmin, isOwner } = usePermissoes();
  const [decisoes, setDecisoes] = useState<RegistroDecisao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtros
  const [busca, setBusca] = useState('');
  const [tiposSelecionados, setTiposSelecionados] = useState<TipoDecisao[]>([]);
  const [origensSelecionadas, setOrigensSelecionadas] = useState<OrigemDecisao[]>([]);
  const [criticidadesSelecionadas, setCriticidadesSelecionadas] = useState<CriticidadeDecisao[]>([]);
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const decisoesPorPagina = 20;

  // Admin Platform e Owner têm acesso total
  const temAcesso = isAdmin || isOwner || temPermissao(Permissao.VER_LOGS);

  // Verificar permissão
  useEffect(() => {
    if (!temAcesso) {
      setError('Você não tem permissão para ver logs de auditoria');
      setLoading(false);
      return;
    }

    carregarDecisoes();
  }, [paginaAtual, tiposSelecionados, origensSelecionadas, criticidadesSelecionadas, dataInicio, dataFim, temAcesso]);

  const carregarDecisoes = async () => {
    if (!user?.companyId) {
      setError('CompanyId não encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filtros: FiltrosDecisao = {
        companyId: user.companyId,
        tipos: tiposSelecionados.length > 0 ? tiposSelecionados : undefined,
        origens: origensSelecionadas.length > 0 ? origensSelecionadas : undefined,
        criticidades: criticidadesSelecionadas.length > 0 ? criticidadesSelecionadas : undefined,
        dataInicio,
        dataFim,
        busca: busca || undefined,
        limit: decisoesPorPagina,
        offset: (paginaAtual - 1) * decisoesPorPagina,
      };

      const data = await decisaoService.listar(filtros);
      setDecisoes(data);

      // Calcular total de páginas (simplificado)
      setTotalPaginas(Math.ceil(data.length / decisoesPorPagina) || 1);
    } catch (err: any) {
      // Se erro 404, significa que a API ainda não foi implementada - não mostrar erro
      if (err.response?.status === 404 || err.suppressLog) {
        setDecisoes([]);
        // Não mostrar mensagem de erro, apenas deixar vazio
      } else {
        console.error('Erro ao carregar decisões:', err);
        setError(err.message || 'Erro ao carregar decisões');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPaginaAtual(1);
    carregarDecisoes();
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setTiposSelecionados([]);
    setOrigensSelecionadas([]);
    setCriticidadesSelecionadas([]);
    setDataInicio(undefined);
    setDataFim(undefined);
    setPaginaAtual(1);
  };

  const handleExportar = async () => {
    if (!user?.companyId) return;

    try {
      const blob = await decisaoService.exportarParaAuditoria(
        user.companyId,
        dataInicio,
        dataFim
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Erro ao exportar:', err);
      alert('Erro ao exportar decisões');
    }
  };

  const toggleTipo = (tipo: TipoDecisao) => {
    setTiposSelecionados((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const toggleOrigem = (origem: OrigemDecisao) => {
    setOrigensSelecionadas((prev) =>
      prev.includes(origem) ? prev.filter((o) => o !== origem) : [...prev, origem]
    );
  };

  const toggleCriticidade = (criticidade: CriticidadeDecisao) => {
    setCriticidadesSelecionadas((prev) =>
      prev.includes(criticidade)
        ? prev.filter((c) => c !== criticidade)
        : [...prev, criticidade]
    );
  };

  if (!temAcesso) {
    return (
      <div className="decisoes-viewer-error">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h3>Acesso Negado</h3>
        <p>Você não tem permissão para visualizar logs de auditoria</p>
      </div>
    );
  }

  return (
    <div className="decisoes-viewer">
      {/* Header */}
      <div className="viewer-header">
        <div className="header-left">
          <Shield className="w-6 h-6" />
          <div>
            <h2>Registro de Decisões</h2>
            <p>Auditoria completa com valor jurídico</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="btn-secondary"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          <button onClick={handleExportar} className="btn-primary">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="busca-container">
        <div className="busca-input-wrapper">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
          />
        </div>
        <button onClick={handleBuscar} className="btn-primary">
          Buscar
        </button>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="filtros-container">
          <div className="filtros-section">
            <h4>Tipo de Decisão</h4>
            <div className="filtros-chips">
              {Object.values(TipoDecisao).slice(0, 10).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => toggleTipo(tipo)}
                  className={`chip ${tiposSelecionados.includes(tipo) ? 'active' : ''}`}
                >
                  {TIPO_DECISAO_LABELS[tipo]}
                </button>
              ))}
            </div>
          </div>

          <div className="filtros-section">
            <h4>Origem</h4>
            <div className="filtros-chips">
              {Object.values(OrigemDecisao).map((origem) => (
                <button
                  key={origem}
                  onClick={() => toggleOrigem(origem)}
                  className={`chip ${origensSelecionadas.includes(origem) ? 'active' : ''}`}
                >
                  {ORIGEM_DECISAO_LABELS[origem]}
                </button>
              ))}
            </div>
          </div>

          <div className="filtros-section">
            <h4>Criticidade</h4>
            <div className="filtros-chips">
              {Object.values(CriticidadeDecisao).map((criticidade) => (
                <button
                  key={criticidade}
                  onClick={() => toggleCriticidade(criticidade)}
                  className={`chip ${criticidadesSelecionadas.includes(criticidade) ? 'active' : ''}`}
                >
                  {CRITICIDADE_DECISAO_LABELS[criticidade]}
                </button>
              ))}
            </div>
          </div>

          <div className="filtros-section">
            <h4>Período</h4>
            <div className="filtros-datas">
              <input
                type="date"
                value={dataInicio?.toISOString().split('T')[0] || ''}
                onChange={(e) =>
                  setDataInicio(e.target.value ? new Date(e.target.value) : undefined)
                }
              />
              <span>até</span>
              <input
                type="date"
                value={dataFim?.toISOString().split('T')[0] || ''}
                onChange={(e) =>
                  setDataFim(e.target.value ? new Date(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <button onClick={handleLimparFiltros} className="btn-secondary">
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Carregando decisões...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-container">
          <AlertTriangle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      )}

      {/* Lista de Decisões */}
      {!loading && !error && (
        <>
          <div className="decisoes-info">
            <span>
              {decisoes.length} decisão(ões) encontrada(s)
            </span>
          </div>

          {decisoes.length === 0 ? (
            <div className="empty-state">
              <Shield className="w-12 h-12" />
              <h3>Nenhuma decisão encontrada</h3>
              <p>Tente ajustar os filtros ou buscar por outros termos</p>
            </div>
          ) : (
            <div className="decisoes-lista">
              {decisoes.map((decisao) => (
                <DecisaoItem key={decisao.id} decisao={decisao} />
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="paginacao">
              <button
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="btn-page"
              >
                ← Anterior
              </button>
              <span className="page-info">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="btn-page"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .decisoes-viewer {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: var(--color-surface, #ffffff);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-left h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text, #212121);
          margin: 0;
        }

        .header-left p {
          font-size: 0.875rem;
          color: var(--color-textSecondary, #757575);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .busca-container {
          display: flex;
          gap: 0.75rem;
        }

        .busca-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .busca-input-wrapper svg {
          position: absolute;
          left: 1rem;
          color: var(--color-textSecondary, #757575);
        }

        .busca-input-wrapper input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid var(--color-border, #e0e0e0);
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .busca-input-wrapper input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filtros-container {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e0e0e0);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filtros-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text, #212121);
          margin-bottom: 0.75rem;
        }

        .filtros-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .chip {
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-border, #e0e0e0);
          border-radius: 20px;
          background: var(--color-surface, #ffffff);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chip:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .chip.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .filtros-datas {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filtros-datas input {
          padding: 0.5rem;
          border: 1px solid var(--color-border, #e0e0e0);
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .decisoes-info {
          padding: 0.75rem 1rem;
          background: var(--color-background, #fafafa);
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--color-textSecondary, #757575);
        }

        .decisoes-lista {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .loading-container,
        .error-container,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--color-border, #e0e0e0);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-container {
          color: #f44336;
        }

        .paginacao {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .btn-primary,
        .btn-secondary,
        .btn-page {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary {
          background: var(--color-surface, #ffffff);
          color: var(--color-text, #212121);
          border: 1px solid var(--color-border, #e0e0e0);
        }

        .btn-secondary:hover {
          background: var(--color-background, #fafafa);
        }

        .btn-page:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .viewer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
          }

          .busca-container {
            flex-direction: column;
          }

          .filtros-datas {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};
