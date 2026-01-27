import React, { useState, useEffect } from 'react';

interface CompanyConfigFormProps {
  companyId: string;
}

interface Config {
  valorCargaPorToneladaCentavos: number;
  valorDescargaPorToneladaCentavos: number;
}

export const CompanyConfigForm: React.FC<CompanyConfigFormProps> = ({ companyId }) => {
  const [config, setConfig] = useState<Config>({
    valorCargaPorToneladaCentavos: 0,
    valorDescargaPorToneladaCentavos: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [companyId]);

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/empresas/${companyId}`);
      const data = await response.json();
      
      if (data.config) {
        setConfig({
          valorCargaPorToneladaCentavos: data.config.valorCargaPorToneladaCentavos || 0,
          valorDescargaPorToneladaCentavos: data.config.valorDescargaPorToneladaCentavos || 0
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/empresas/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            ...config
          }
        })
      });
      alert('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  const reaisToCentavos = (reais: number): number => {
    return Math.round(reais * 100);
  };

  const centavosToReais = (centavos: number): number => {
    return centavos / 100;
  };

  return (
    <div className="company-config-form">
      <h2>Configuração de Valores Padrão</h2>
      <p>Configure os valores padrão por tonelada para carga e descarga.</p>

      <div className="form-group">
        <label>Valor por Tonelada - Carga (R$):</label>
        <input
          type="number"
          step="0.01"
          value={centavosToReais(config.valorCargaPorToneladaCentavos)}
          onChange={(e) => setConfig({
            ...config,
            valorCargaPorToneladaCentavos: reaisToCentavos(parseFloat(e.target.value) || 0)
          })}
          placeholder="0.00"
        />
        <small>Este valor será sugerido automaticamente ao criar trabalhos de carga</small>
      </div>

      <div className="form-group">
        <label>Valor por Tonelada - Descarga (R$):</label>
        <input
          type="number"
          step="0.01"
          value={centavosToReais(config.valorDescargaPorToneladaCentavos)}
          onChange={(e) => setConfig({
            ...config,
            valorDescargaPorToneladaCentavos: reaisToCentavos(parseFloat(e.target.value) || 0)
          })}
          placeholder="0.00"
        />
        <small>Este valor será sugerido automaticamente ao criar trabalhos de descarga</small>
      </div>

      <div className="preview">
        <h3>Exemplo de Cálculo:</h3>
        <p>
          Carga de 10 toneladas = R$ {centavosToReais(config.valorCargaPorToneladaCentavos * 10).toFixed(2)}
        </p>
        <p>
          Descarga de 10 toneladas = R$ {centavosToReais(config.valorDescargaPorToneladaCentavos * 10).toFixed(2)}
        </p>
      </div>

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Configuração'}
      </button>
    </div>
  );
};
