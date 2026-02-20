import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Check, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase.config';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Step1TipoCliente } from './steps/Step1TipoCliente';
import { Step2Identificacao } from './steps/Step2Identificacao';
import { Step3Contato } from './steps/Step3Contato';
import { Step4Revisao } from './steps/Step4Revisao';
import './NovoClienteMultiStep.css';

type TipoCliente = 'PF' | 'PJ' | null;

interface DadosCliente {
  tipo: TipoCliente;
  // PF
  nome?: string;
  cpf?: string;
  dataNascimento?: string;
  // PJ
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  situacaoCadastral?: string;
  // Contato
  telefone?: string;
  email?: string;
  whatsapp?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  // Tags
  tags?: string[];
}

interface NovoClienteMultiStepProps {
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, label: 'Tipo' },
  { id: 2, label: 'Dados' },
  { id: 3, label: 'Contato' },
  { id: 4, label: 'Revisar' }
];

export const NovoClienteMultiStep: React.FC<NovoClienteMultiStepProps> = ({
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [dados, setDados] = useState<DadosCliente>({ tipo: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarDados = (novosDados: Partial<DadosCliente>) => {
    setDados(prev => ({ ...prev, ...novosDados }));
  };

  const proximaEtapa = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const etapaAnterior = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validarDuplicidade = async (): Promise<boolean> => {
    try {
      const clientesRef = collection(db, `companies/${user?.companyId}/clientes`);
      
      // Verificar CNPJ/CPF
      if (dados.cnpj) {
        const q = query(
          clientesRef,
          where('cnpj', '==', dados.cnpj),
          where('deletedAt', '==', null)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setError('Já existe um cliente com este CNPJ');
          return false;
        }
      }
      
      if (dados.cpf) {
        const q = query(
          clientesRef,
          where('cpf', '==', dados.cpf),
          where('deletedAt', '==', null)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setError('Já existe um cliente com este CPF');
          return false;
        }
      }
      
      // Verificar telefone
      if (dados.telefone) {
        const q = query(
          clientesRef,
          where('telefone', '==', dados.telefone),
          where('deletedAt', '==', null)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setError('Já existe um cliente com este telefone');
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao validar duplicidade:', err);
      return true;
    }
  };

  const salvarCliente = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validar duplicidade
      const isValido = await validarDuplicidade();
      if (!isValido) {
        setLoading(false);
        return;
      }

      const clientesRef = collection(db, `companies/${user?.companyId}/clientes`);
      
      const clienteData: any = {
        tipo: dados.tipo,
        status: 'ativo',
        deletedAt: null,
        companyId: user?.companyId,
        createdAt: Timestamp.now(),
        createdBy: user?.uid,
      };

      if (dados.tipo === 'PF') {
        clienteData.nome = dados.nome;
        clienteData.nomeLower = dados.nome?.toLowerCase();
        clienteData.cpf = dados.cpf;
        clienteData.dataNascimento = dados.dataNascimento;
      } else {
        clienteData.cnpj = dados.cnpj;
        clienteData.razaoSocial = dados.razaoSocial;
        clienteData.nomeFantasia = dados.nomeFantasia;
        clienteData.nome = dados.nomeFantasia || dados.razaoSocial;
        clienteData.nomeLower = (dados.nomeFantasia || dados.razaoSocial)?.toLowerCase();
        clienteData.situacaoCadastral = dados.situacaoCadastral;
      }

      clienteData.telefone = dados.telefone;
      clienteData.email = dados.email || null;
      clienteData.whatsapp = dados.whatsapp || dados.telefone;
      clienteData.endereco = dados.endereco || null;
      clienteData.cidade = dados.cidade || null;
      clienteData.estado = dados.estado || null;
      clienteData.cep = dados.cep || null;
      clienteData.tags = dados.tags || [];

      await addDoc(clientesRef, clienteData);

      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Erro ao salvar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="multi-step-overlay" onClick={onClose}>
      <div className="multi-step-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag Handle */}
        <div className="sheet-handle" />

        {/* Header */}
        <div className="multi-step-header">
          {currentStep > 1 && (
            <button className="btn-back" onClick={etapaAnterior}>
              <ChevronLeft size={24} />
            </button>
          )}
          <h2 className="multi-step-title">Adicionar Cliente à Base</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`progress-step ${currentStep >= step.id ? 'active' : ''}`}>
                <span className="progress-label">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="progress-divider">•</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Steps Content */}
        <div className="multi-step-content">
          {currentStep === 1 && (
            <Step1TipoCliente
              dados={dados}
              onUpdate={atualizarDados}
              onNext={proximaEtapa}
            />
          )}

          {currentStep === 2 && (
            <Step2Identificacao
              dados={dados}
              onUpdate={atualizarDados}
              onNext={proximaEtapa}
            />
          )}

          {currentStep === 3 && (
            <Step3Contato
              dados={dados}
              onUpdate={atualizarDados}
              onNext={proximaEtapa}
            />
          )}

          {currentStep === 4 && (
            <Step4Revisao
              dados={dados}
              onEdit={(step) => setCurrentStep(step)}
              onSave={salvarCliente}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
