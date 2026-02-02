import React, { useState } from 'react';
import { Search, MoreVertical, FileText, Mail, Calendar, User, Package, AlertCircle, XCircle, CheckCircle, X, Download } from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './RelatoriosPageCore.css';

interface ResumoGeral { totalTrabalhos: number; totalToneladas: number; valorPago: number; valorPendente: number; }
interface ClienteResumo { id: string; nome: string; trabalhos: number; toneladas: number; valor: number; }
interface FuncionarioResumo { id: string; nome: string; diarias: number; meias: number; valor: number; }
interface Excecao { id: string; tipo: 'critico' | 'atencao' | 'info'; descricao: string; trabalhoId?: string; data: Date; }
type PeriodoSelecionado = 'hoje' | 'semana' | 'mes' | 'personalizado';

const RelatoriosPageCore: React.FC = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoSelecionado>('semana');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarModalData, setMostrarModalData] = useState(false);
  const [mostrarModalExcecao, setMostrarModalExcecao] = useState<Excecao | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [relatorioGerado, setRelatorioGerado] = useState(false);

  const [resumoGeral] = useState<ResumoGeral>({ totalTrabalhos: 12, totalToneladas: 385.5, valorPago: 24850, valorPendente: 1200 });
  const [clientes] = useState<ClienteResumo[]>([
    { id: '1', nome: 'Armazém Central', trabalhos: 5, toneladas: 125.5, valor: 8450 },
    { id: '2', nome: 'Distribuidora Norte', trabalhos: 4, toneladas: 98.0, valor: 6200 },
    { id: '3', nome: 'Logística Sul', trabalhos: 3, toneladas: 162.0, valor: 10200 }
  ]);
  const [funcionarios] = useState<FuncionarioResumo[]>([
    { id: 'f1', nome: 'João Silva', diarias: 5, meias: 2, valor: 850 },
    { id: 'f2', nome: 'Maria Santos', diarias: 6, meias: 0, valor: 900 },
    { id: 'f3', nome: 'Pedro Costa', diarias: 4, meias: 1, valor: 675 }
  ]);
  const [excecoes] = useState<Excecao[]>([
    { id: 'e1', tipo: 'critico', descricao: '3 faltas registradas', data: new Date() },
    { id: 'e2', tipo: 'atencao', descricao: '2 ajustes de tonelagem', data: new Date() },
    { id: 'e3', tipo: 'info', descricao: '1 trabalho cancelado', data: new Date() }
  ]);

  const formatarMoeda = (valor: number): string => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const gerarAnalise = () => { setCarregando(true); setTimeout(() => { setCarregando(false); setRelatorioGerado(true); }, 1500); };
  const selecionarPeriodo = (periodo: PeriodoSelecionado) => { if (periodo === 'personalizado') { setMostrarModalData(true); } else { setPeriodoSelecionado(periodo); setRelatorioGerado(false); } };
  const confirmarDataPersonalizada = () => { if (!dataInicio || !dataFim) { alert('Selecione as datas'); return; } if (new Date(dataInicio) > new Date(dataFim)) { alert('Data início maior que fim'); return; } setPeriodoSelecionado('personalizado'); setMostrarModalData(false); setRelatorioGerado(false); };

  return (
    <>
      <div className="rel-container">
        <div className="rel-nav">
          <div className="rel-nav-content">
            <div className="rel-title-group">
              <h1 className="rel-title">Relatórios</h1>
              <span className="rel-subtitle">Análise operacional e financeira</span>
            </div>
            <button className="rel-btn-menu" onClick={() => setMostrarMenu(!mostrarMenu)}><MoreVertical size={20} strokeWidth={2} /></button>
          </div>
        </div>

        {mostrarMenu && (
          <div className="rel-menu-overlay" onClick={() => setMostrarMenu(false)}>
            <div className="rel-menu" onClick={(e) => e.stopPropagation()}>
              <button className="rel-menu-item" onClick={() => { alert('PDF'); setMostrarMenu(false); }}><Download size={20} /><span>Exportar PDF</span></button>
              <button className="rel-menu-item" onClick={() => { alert('Email'); setMostrarMenu(false); }}><Mail size={20} /><span>Enviar Email</span></button>
              <button className="rel-menu-item" onClick={() => { alert('Resumo'); setMostrarMenu(false); }}><Calendar size={20} /><span>Resumo Semanal</span></button>
              <button className="rel-menu-item" onClick={() => { alert('Fechamento'); setMostrarMenu(false); }}><FileText size={20} /><span>Fechamento Diário</span></button>
            </div>
          </div>
        )}

        <div className="rel-content">
          <div className="rel-periodo-selector">
            <button className={`rel-periodo-card ${periodoSelecionado === 'hoje' ? 'selected' : ''}`} onClick={() => selecionarPeriodo('hoje')}>
              <span className="rel-periodo-label">Hoje</span>
              <span className="rel-periodo-value">{new Date().getDate()}</span>
              <span className="rel-periodo-date">{new Date().toLocaleDateString('pt-BR', { month: 'short' })}</span>
            </button>
            <button className={`rel-periodo-card ${periodoSelecionado === 'semana' ? 'selected' : ''}`} onClick={() => selecionarPeriodo('semana')}>
              <span className="rel-periodo-label">Semana</span>
              <span className="rel-periodo-value">7 dias</span>
              <span className="rel-periodo-date">Atual</span>
            </button>
            <button className={`rel-periodo-card ${periodoSelecionado === 'mes' ? 'selected' : ''}`} onClick={() => selecionarPeriodo('mes')}>
              <span className="rel-periodo-label">Mês</span>
              <span className="rel-periodo-value">{new Date().toLocaleDateString('pt-BR', { month: 'short' })}</span>
              <span className="rel-periodo-date">{new Date().getFullYear()}</span>
            </button>
            <button className={`rel-periodo-card ${periodoSelecionado === 'personalizado' ? 'selected' : ''}`} onClick={() => selecionarPeriodo('personalizado')}>
              <span className="rel-periodo-label">Personalizado</span>
              <span className="rel-periodo-value"><Calendar size={20} /></span>
              <span className="rel-periodo-date">Escolher</span>
            </button>
          </div>

          <button className="rel-btn-gerar" onClick={gerarAnalise} disabled={carregando}>
            {carregando ? <><Search size={20} className="spinning" /><span>Analisando...</span></> : <><Search size={20} /><span>Gerar Análise</span></>}
          </button>

          {!relatorioGerado && !carregando && (
            <div className="rel-empty">
              <div className="rel-empty-icon"><FileText size={48} strokeWidth={1.5} /></div>
              <h3 className="rel-empty-title">Nenhuma análise gerada</h3>
              <p className="rel-empty-desc">Selecione o período e clique em Gerar Análise</p>
            </div>
          )}

          {relatorioGerado && !carregando && (
            <div className="rel-resultado">
              <div className="rel-resumo-geral">
                <div className="rel-resumo-periodo">Período: Semana Atual</div>
                <div className="rel-resumo-grid">
                  <div className="rel-metrica"><span className="rel-metrica-valor">{resumoGeral.totalTrabalhos}</span><span className="rel-metrica-label">Trabalhos</span></div>
                  <div className="rel-metrica"><span className="rel-metrica-valor">{resumoGeral.totalToneladas}t</span><span className="rel-metrica-label">Toneladas</span></div>
                  <div className="rel-metrica"><span className="rel-metrica-valor pago">{formatarMoeda(resumoGeral.valorPago)}</span><span className="rel-metrica-label">Pago</span></div>
                  <div className="rel-metrica"><span className="rel-metrica-valor pendente">{formatarMoeda(resumoGeral.valorPendente)}</span><span className="rel-metrica-label">Pendente</span></div>
                </div>
              </div>

              <div className="rel-secao">
                <div className="rel-secao-header"><span className="rel-secao-title">Por Cliente</span><User size={18} className="rel-secao-icon" /></div>
                {clientes.map(c => (
                  <div key={c.id} className="rel-item" onClick={() => alert(`Cliente: ${c.nome}`)}>
                    <div className="rel-item-content">
                      <h4 className="rel-item-nome">{c.nome}</h4>
                      <p className="rel-item-detalhes">{c.trabalhos} trabalhos  {c.toneladas}t</p>
                      <div className="rel-item-valor">{formatarMoeda(c.valor)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rel-secao">
                <div className="rel-secao-header"><span className="rel-secao-title">Por Funcionário</span><Package size={18} className="rel-secao-icon" /></div>
                {funcionarios.map(f => (
                  <div key={f.id} className="rel-item" onClick={() => alert(`Funcionário: ${f.nome}`)}>
                    <div className="rel-item-content">
                      <h4 className="rel-item-nome">{f.nome}</h4>
                      <p className="rel-item-detalhes">{f.diarias} diárias  {f.meias} meias</p>
                      <div className="rel-item-valor">{formatarMoeda(f.valor)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rel-excecoes">
                <div className="rel-excecoes-header"><AlertCircle size={18} /><span>Exceções e Ajustes</span></div>
                {excecoes.map(e => (
                  <div key={e.id} className="rel-excecao-item" onClick={() => setMostrarModalExcecao(e)}>
                    {e.tipo === 'critico' && <XCircle size={16} className="rel-excecao-icon-critical" />}
                    {e.tipo === 'atencao' && <AlertCircle size={16} className="rel-excecao-icon-warning" />}
                    {e.tipo === 'info' && <CheckCircle size={16} className="rel-excecao-icon-info" />}
                    <span className="rel-excecao-texto">{e.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {mostrarModalData && (
          <div className="rel-menu-overlay" onClick={() => setMostrarModalData(false)}>
            <div className="rel-menu" onClick={(e) => e.stopPropagation()} style={{ minWidth: '300px', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Período Personalizado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><label style={{ fontSize: '13px', fontWeight: '500', color: '#8E8E93', display: 'block', marginBottom: '6px' }}>Data Início</label><input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                <div><label style={{ fontSize: '13px', fontWeight: '500', color: '#8E8E93', display: 'block', marginBottom: '6px' }}>Data Fim</label><input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={() => setMostrarModalData(false)} style={{ flex: 1, padding: '12px', background: '#f0f0f0', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={confirmarDataPersonalizada} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', border: 'none', borderRadius: '10px', fontWeight: '600', color: '#FFF', cursor: 'pointer' }}>Confirmar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mostrarModalExcecao && (
          <div className="rel-menu-overlay" onClick={() => setMostrarModalExcecao(null)}>
            <div className="rel-menu" onClick={(e) => e.stopPropagation()} style={{ minWidth: '320px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Detalhes</h3>
                <button onClick={() => setMostrarModalExcecao(null)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><span style={{ fontSize: '13px', fontWeight: '500', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>Tipo</span><span style={{ fontSize: '15px', textTransform: 'capitalize' }}>{mostrarModalExcecao.tipo}</span></div>
                <div><span style={{ fontSize: '13px', fontWeight: '500', color: '#8E8E93', display: 'block', marginBottom: '4px' }}>Descrição</span><span style={{ fontSize: '15px' }}>{mostrarModalExcecao.descricao}</span></div>
                <button onClick={() => setMostrarModalExcecao(null)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', border: 'none', borderRadius: '10px', fontWeight: '600', color: '#FFF', cursor: 'pointer', marginTop: '8px' }}>Fechar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Dock />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spinning { animation: spin 1s linear infinite; }`}</style>
    </>
  );
};

export default RelatoriosPageCore;
