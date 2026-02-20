import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import './FiltrosSheet.css';

interface FiltrosSheetProps {
  filtrosAtivos: Record<string, string>;
  onAplicar: (filtros: Record<string, string>) => void;
  onClose: () => void;
}

export const FiltrosSheet: React.FC<FiltrosSheetProps> = ({
  filtrosAtivos,
  onAplicar,
  onClose
}) => {
  const [status, setStatus] = useState(filtrosAtivos.status || '');

  const aplicar = () => {
    const filtros: Record<string, string> = {};
    if (status) filtros.status = status;
    onAplicar(filtros);
  };

  const limpar = () => {
    setStatus('');
    onAplicar({});
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-content filtros-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        
        <div className="sheet-header">
          <h2 className="sheet-title">Filtros</h2>
          <button className="sheet-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="sheet-body">
          <div className="filtro-group">
            <label className="filtro-label">Status</label>
            <div className="filtro-opcoes">
              <button
                className={`filtro-opcao ${status === '' ? 'active' : ''}`}
                onClick={() => setStatus('')}
              >
                Todos
              </button>
              <button
                className={`filtro-opcao ${status === 'ativo' ? 'active' : ''}`}
                onClick={() => setStatus('ativo')}
              >
                Ativos
              </button>
              <button
                className={`filtro-opcao ${status === 'em_servico' ? 'active' : ''}`}
                onClick={() => setStatus('em_servico')}
              >
                Em Serviço
              </button>
              <button
                className={`filtro-opcao ${status === 'inativo' ? 'active' : ''}`}
                onClick={() => setStatus('inativo')}
              >
                Inativos
              </button>
            </div>
          </div>
        </div>

        <div className="sheet-footer">
          <button className="btn-sheet-secondary" onClick={limpar}>
            Limpar
          </button>
          <button className="btn-sheet-primary" onClick={aplicar}>
            <Check size={20} />
            <span>Aplicar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
