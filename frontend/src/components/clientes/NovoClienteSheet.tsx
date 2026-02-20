import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { db } from '../../config/firebase.config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './NovoClienteSheet.css';

interface NovoClienteSheetProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NovoClienteSheet: React.FC<NovoClienteSheetProps> = ({
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');

  const formatarTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    }
    return value;
  };

  const handleTelefoneChange = (value: string) => {
    setTelefone(formatarTelefone(value));
  };

  const salvar = async () => {
    if (!nome.trim() || !telefone.trim()) return;

    setLoading(true);
    try {
      const clientesRef = collection(db, `companies/${user?.companyId}/clientes`);
      await addDoc(clientesRef, {
        nome: nome.trim(),
        nomeLower: nome.trim().toLowerCase(),
        telefone: telefone.trim(),
        email: email.trim() || null,
        endereco: endereco.trim() || null,
        status: 'ativo',
        deletedAt: null,
        companyId: user?.companyId,
        createdAt: Timestamp.now(),
        createdBy: user?.uid,
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-content novo-cliente-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        
        <div className="sheet-header">
          <h2 className="sheet-title">Novo Cliente</h2>
          <button className="sheet-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="sheet-body">
          <div className="form-group-minimal">
            <label className="form-label-minimal">Nome do Cliente</label>
            <input
              type="text"
              className="form-input-minimal"
              placeholder="Ex: Armazém Central"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group-minimal">
            <label className="form-label-minimal">Telefone</label>
            <input
              type="tel"
              className="form-input-minimal"
              placeholder="(62) 99999-9999"
              value={telefone}
              onChange={(e) => handleTelefoneChange(e.target.value)}
            />
          </div>

          <div className="form-group-minimal">
            <label className="form-label-minimal">Email (opcional)</label>
            <input
              type="email"
              className="form-input-minimal"
              placeholder="cliente@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group-minimal">
            <label className="form-label-minimal">Endereço (opcional)</label>
            <input
              type="text"
              className="form-input-minimal"
              placeholder="Ex: Galpão 3 - Setor B"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <div className="form-aviso-minimal">
            <AlertCircle size={16} />
            <span>O sistema valida automaticamente telefones duplicados</span>
          </div>
        </div>

        <div className="sheet-footer">
          <button 
            className="btn-sheet-primary"
            onClick={salvar}
            disabled={loading || !nome.trim() || !telefone.trim()}
          >
            <Check size={20} />
            <span>{loading ? 'Salvando...' : 'Salvar Cliente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
