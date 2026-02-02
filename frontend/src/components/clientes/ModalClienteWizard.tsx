import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Building2,
  User,
  MapPin,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';

interface ClienteData {
  // Step 1: Tipo e Identificação
  tipo: 'pj' | 'pf';
  razaoSocial: string;
  nomeFantasia: string;
  cpfCnpj: string;
  
  // Step 2: Contato
  telefone: string;
  email: string;
  contato: string; // Nome do contato
  
  // Step 3: Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  
  // Step 4: Dados Fiscais
  inscricaoEstadual: string;
  tipoInscricaoEstadual: 'contribuinte' | 'isento' | 'nao_contribuinte';
  observacoes: string;
}

interface ModalClienteWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClienteData) => Promise<void>;
  clienteInicial?: Partial<ClienteData>;
  modoEdicao?: boolean;
}

export const ModalClienteWizard: React.FC<ModalClienteWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  clienteInicial,
  modoEdicao = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClienteData>({
    tipo: 'pj',
    razaoSocial: '',
    nomeFantasia: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    contato: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'GO',
    inscricaoEstadual: '',
    tipoInscricaoEstadual: 'contribuinte',
    observacoes: '',
  });

  useEffect(() => {
    if (clienteInicial) {
      setFormData(prev => ({ ...prev, ...clienteInicial }));
    }
  }, [clienteInicial]);

  const totalSteps = 4;

  const steps = [
    { number: 1, title: 'Identificação', icon: Building2 },
    { number: 2, title: 'Contato', icon: User },
    { number: 3, title: 'Endereço', icon: MapPin },
    { number: 4, title: 'Dados Fiscais', icon: FileText },
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (formData.tipo === 'pj') {
          return !!(formData.razaoSocial && formData.cpfCnpj);
        } else {
          return !!(formData.razaoSocial && formData.cpfCnpj);
        }
      case 2:
        return !!formData.telefone;
      case 3:
        return !!(formData.logradouro && formData.cidade && formData.estado);
      case 4:
        return true; // Dados fiscais são opcionais
      default:
        return true;
    }
  };

  const formatCPFCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (formData.tipo === 'pf') {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .slice(0, 18);
    }
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || 'GO',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="wizard-overlay" onClick={onClose}>
        <div className="wizard-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="wizard-header">
            <div className="wizard-header-content">
              <h2 className="wizard-title">
                {modoEdicao ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <p className="wizard-subtitle">
                {steps[currentStep - 1].title}
              </p>
            </div>
            <button className="wizard-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="wizard-progress">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div 
                    className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setCurrentStep(step.number)}
                  >
                    <div className="wizard-step-icon">
                      {isCompleted ? (
                        <Check size={16} strokeWidth={3} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>
                    <span className="wizard-step-label">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`wizard-step-connector ${isCompleted ? 'completed' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Body */}
          <div className="wizard-body">

            {/* Step 1: Identificação */}
            {currentStep === 1 && (
              <div className="wizard-step-content">
                {/* Tipo de Cliente */}
                <div className="form-group">
                  <label className="form-label">Tipo de Cliente *</label>
                  <div className="tipo-cliente-selector">
                    <button
                      type="button"
                      className={`tipo-option ${formData.tipo === 'pj' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, tipo: 'pj', cpfCnpj: '' }))}
                    >
                      <Building2 size={20} />
                      <span>Pessoa Jurídica</span>
                    </button>
                    <button
                      type="button"
                      className={`tipo-option ${formData.tipo === 'pf' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, tipo: 'pf', cpfCnpj: '' }))}
                    >
                      <User size={20} />
                      <span>Pessoa Física</span>
                    </button>
                  </div>
                </div>

                {/* Razão Social / Nome Completo */}
                <div className="form-group">
                  <label className="form-label">
                    {formData.tipo === 'pj' ? 'Razão Social *' : 'Nome Completo *'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={formData.tipo === 'pj' ? 'Ex: BRC Alimentos LTDA' : 'Ex: João Silva'}
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                    autoFocus
                  />
                </div>

                {/* Nome Fantasia (apenas PJ) */}
                {formData.tipo === 'pj' && (
                  <div className="form-group">
                    <label className="form-label">Nome Fantasia</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: BRC Alimentos"
                      value={formData.nomeFantasia}
                      onChange={(e) => setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                    />
                  </div>
                )}

                {/* CPF/CNPJ */}
                <div className="form-group">
                  <label className="form-label">
                    {formData.tipo === 'pj' ? 'CNPJ *' : 'CPF *'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={formData.tipo === 'pj' ? '00.000.000/0000-00' : '000.000.000-00'}
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cpfCnpj: formatCPFCNPJ(e.target.value) 
                    }))}
                    maxLength={formData.tipo === 'pj' ? 18 : 14}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contato */}
            {currentStep === 2 && (
              <div className="wizard-step-content">
                {/* Telefone */}
                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      telefone: formatTelefone(e.target.value) 
                    }))}
                    maxLength={15}
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="contato@empresa.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                {/* Nome do Contato */}
                <div className="form-group">
                  <label className="form-label">Nome do Contato</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: João Silva"
                    value={formData.contato}
                    onChange={(e) => setFormData(prev => ({ ...prev, contato: e.target.value }))}
                  />
                  <span className="form-hint">Pessoa responsável pelo contato</span>
                </div>
              </div>
            )}

            {/* Step 3: Endereço */}
            {currentStep === 3 && (
              <div className="wizard-step-content">
                {/* CEP */}
                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => {
                      const cep = formatCEP(e.target.value);
                      setFormData(prev => ({ ...prev, cep }));
                      if (cep.replace(/\D/g, '').length === 8) {
                        buscarCEP(cep);
                      }
                    }}
                    maxLength={9}
                    autoFocus
                  />
                  <span className="form-hint">Preencha o CEP para buscar o endereço automaticamente</span>
                </div>

                {/* Logradouro */}
                <div className="form-group">
                  <label className="form-label">Logradouro *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Rua, Avenida, etc."
                    value={formData.logradouro}
                    onChange={(e) => setFormData(prev => ({ ...prev, logradouro: e.target.value }))}
                  />
                </div>

                {/* Número e Complemento */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Número</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123"
                      value={formData.numero}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Sala, Apto, etc."
                      value={formData.complemento}
                      onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Bairro */}
                <div className="form-group">
                  <label className="form-label">Bairro</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome do bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  />
                </div>

                {/* Cidade e Estado */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Cidade *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nome da cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">UF *</label>
                    <select
                      className="form-input"
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                    >
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Dados Fiscais */}
            {currentStep === 4 && (
              <div className="wizard-step-content">
                {/* Tipo de Inscrição Estadual */}
                <div className="form-group">
                  <label className="form-label">Inscrição Estadual</label>
                  <select
                    className="form-input"
                    value={formData.tipoInscricaoEstadual}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tipoInscricaoEstadual: e.target.value as any,
                      inscricaoEstadual: e.target.value !== 'contribuinte' ? '' : prev.inscricaoEstadual
                    }))}
                    autoFocus
                  >
                    <option value="contribuinte">Contribuinte</option>
                    <option value="isento">Isento</option>
                    <option value="nao_contribuinte">Não Contribuinte</option>
                  </select>
                </div>

                {/* Número da Inscrição Estadual */}
                {formData.tipoInscricaoEstadual === 'contribuinte' && (
                  <div className="form-group">
                    <label className="form-label">Número da Inscrição Estadual</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="000.000.000.000"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => setFormData(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                    />
                  </div>
                )}

                {/* Observações */}
                <div className="form-group">
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Informações adicionais sobre o cliente..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Resumo */}
                <div className="wizard-summary">
                  <div className="summary-title">Resumo do Cadastro</div>
                  <div className="summary-item">
                    <span className="summary-label">Cliente:</span>
                    <span className="summary-value">{formData.razaoSocial || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">{formData.tipo === 'pj' ? 'CNPJ:' : 'CPF:'}</span>
                    <span className="summary-value">{formData.cpfCnpj || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Telefone:</span>
                    <span className="summary-value">{formData.telefone || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Cidade:</span>
                    <span className="summary-value">{formData.cidade ? `${formData.cidade}/${formData.estado}` : '-'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="wizard-footer">
            {currentStep > 1 && (
              <button 
                className="wizard-btn wizard-btn-secondary"
                onClick={handlePrev}
                disabled={loading}
              >
                <ChevronLeft size={20} />
                <span>Voltar</span>
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button 
                className="wizard-btn wizard-btn-primary"
                onClick={handleNext}
                disabled={!validateCurrentStep()}
              >
                <span>Próximo</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                className="wizard-btn wizard-btn-success"
                onClick={handleSubmit}
                disabled={loading || !validateCurrentStep()}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>{modoEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Importar estilos do CSS externo */
        @import './ModalClienteWizard.css';
      `}</style>
    </>
  );
};

export default ModalClienteWizard;
