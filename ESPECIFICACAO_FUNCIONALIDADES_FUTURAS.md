# 📋 Especificação Técnica - Funcionalidades Futuras
**Versão**: Alpha 0.14.0  
**Data**: 02/02/2026  
**Status**: Especificação Completa

---

## 🎯 Visão Geral

Este documento especifica 3 funcionalidades complexas que requerem implementação backend + frontend:

1. **Agendamentos → Trabalhos Automático**
2. **Autocomplete de Clientes**
3. **Gestão de Funções Reutilizáveis**

---

## 📦 FUNCIONALIDADE 1: Agendamentos → Trabalhos Automático

### 🎯 Objetivo
Converter agendamentos em trabalhos automaticamente na data correta, com regras diferentes para agendamentos manuais vs. IA.

### 📐 Regras de Negócio

#### Agendamentos Manuais
- **Conversão**: Automática às 00:00 da data agendada
- **Sem confirmação**: Aparecem direto em `/trabalhos`
- **Status inicial**: `em_andamento`

#### Agendamentos da IA
- **Conversão**: Requer confirmação do usuário
- **Badge visual**: Ícone ✨ "IA" no card
- **Botão**: "Confirmar" → converte em trabalho
- **Botão**: "Rejeitar" → marca como cancelado

### 🗄️ Estrutura de Dados Firebase


#### Collection: `companies/{companyId}/agendamentos`
```typescript
interface Agendamento {
  id: string;
  cliente: string;
  local: string;
  data: Timestamp; // Data do agendamento
  horarioInicio: string; // "08:00"
  horarioFim: string; // "12:00"
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  origem: 'ia' | 'manual'; // NOVO CAMPO
  status: 'pendente' | 'confirmado' | 'cancelado' | 'convertido'; // NOVO STATUS
  trabalhoId?: string; // ID do trabalho criado (quando convertido)
  convertidoEm?: Timestamp; // Data/hora da conversão
  companyId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}
```

### 🔧 Backend - Endpoints Necessários

#### 1. POST `/api/agendamentos/:id/confirmar`
**Descrição**: Confirma agendamento da IA e converte em trabalho  
**Permissões**: `owner`, `admin_platform`  
**Request Body**: Nenhum  
**Response**:
```typescript
{
  success: true,
  trabalho: Trabalho, // Trabalho criado
  agendamento: Agendamento // Agendamento atualizado
}
```

#### 2. POST `/api/agendamentos/:id/rejeitar`
**Descrição**: Rejeita agendamento da IA  
**Permissões**: `owner`, `admin_platform`  
**Request Body**:
```typescript
{
  motivo?: string // Opcional
}
```


#### 3. Job/Cron: `convertAgendamentosJob`
**Descrição**: Roda diariamente às 00:00 para converter agendamentos manuais  
**Lógica**:
```typescript
// Pseudo-código
async function convertAgendamentosJob() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Buscar agendamentos manuais de hoje que ainda não foram convertidos
  const agendamentos = await firestore
    .collectionGroup('agendamentos')
    .where('data', '==', hoje)
    .where('origem', '==', 'manual')
    .where('status', '==', 'pendente')
    .get();
  
  for (const agendamento of agendamentos.docs) {
    const data = agendamento.data();
    
    // Criar trabalho
    const trabalho = await criarTrabalho({
      cliente: data.cliente,
      local: data.local,
      tipo: data.tipo,
      tonelagem: data.tonelagem,
      status: 'em_andamento',
      agendamentoId: agendamento.id,
      companyId: data.companyId,
    });
    
    // Atualizar agendamento
    await agendamento.ref.update({
      status: 'convertido',
      trabalhoId: trabalho.id,
      convertidoEm: Timestamp.now(),
    });
    
    // Log de auditoria
    await registrarLog({
      tipo: 'agendamento_convertido',
      agendamentoId: agendamento.id,
      trabalhoId: trabalho.id,
      companyId: data.companyId,
    });
  }
}
```

### 🎨 Frontend - Mudanças Necessárias


#### Arquivo: `frontend/src/pages/AgendamentosPageCore.tsx`

**Mudanças**:
1. Adicionar campo `origem` ao criar agendamento (sempre `'manual'`)
2. Adicionar botões "Confirmar" e "Rejeitar" para agendamentos da IA
3. Adicionar badge visual ✨ "IA" para agendamentos da IA
4. Implementar funções `confirmarAgendamento()` e `rejeitarAgendamento()`

**Código**:
```typescript
const confirmarAgendamento = async (id: string) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/agendamentos/${id}/confirmar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Erro ao confirmar');
    
    const { trabalho } = await response.json();
    
    toast.success({
      title: 'Agendamento confirmado!',
      message: `Trabalho criado: ${trabalho.cliente}`,
    });
    
    // Recarregar agendamentos
    await carregarAgendamentos();
    
    // Navegar para trabalhos
    navigate('/trabalhos');
  } catch (error) {
    toast.error({
      title: 'Erro',
      message: 'Erro ao confirmar agendamento',
    });
  } finally {
    setLoading(false);
  }
};
```

---

## 📦 FUNCIONALIDADE 2: Autocomplete de Clientes

### 🎯 Objetivo
Ao digitar 3+ letras no campo "Cliente", mostrar sugestões de clientes cadastrados em `/clientes`.


### 📐 Regras de Negócio

1. **Trigger**: Usuário digita 3+ caracteres no campo "Cliente"
2. **Debounce**: 300ms para evitar requests excessivos
3. **Busca**: Case-insensitive, busca por nome ou código
4. **Limite**: Máximo 10 sugestões
5. **Seleção**: Ao clicar, preenche o campo automaticamente
6. **Criação**: Se não encontrar, permite criar novo cliente inline

### 🗄️ Estrutura de Dados Firebase

#### Collection: `companies/{companyId}/clientes`
```typescript
interface Cliente {
  id: string;
  nome: string; // "BRC Transportes"
  codigo?: string; // "BRC-001" (opcional)
  endereco?: string;
  telefone?: string;
  email?: string;
  companyId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}
```

### 🔧 Backend - Endpoints Necessários

#### 1. GET `/api/clientes/search?q={query}`
**Descrição**: Busca clientes por nome ou código  
**Permissões**: `owner`, `admin_platform`, `user`  
**Query Params**:
- `q`: string (mínimo 3 caracteres)
- `limit`: number (default: 10)

**Response**:
```typescript
{
  success: true,
  data: Cliente[] // Máximo 10 resultados
}
```

**Lógica**:
```typescript
// Pseudo-código
async function searchClientes(query: string, companyId: string) {
  const queryLower = query.toLowerCase();
  
  // Buscar por nome (case-insensitive)
  const clientesPorNome = await firestore
    .collection(`companies/${companyId}/clientes`)
    .where('deletedAt', '==', null)
    .orderBy('nome')
    .startAt(queryLower)
    .endAt(queryLower + '\uf8ff')
    .limit(10)
    .get();
  
  return clientesPorNome.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```


#### 2. POST `/api/clientes`
**Descrição**: Cria novo cliente  
**Permissões**: `owner`, `admin_platform`  
**Request Body**:
```typescript
{
  nome: string, // Obrigatório
  codigo?: string,
  endereco?: string,
  telefone?: string,
  email?: string
}
```

### 🎨 Frontend - Componente Autocomplete

#### Arquivo: `frontend/src/components/common/AutocompleteCliente.tsx`

**Novo componente**:
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  codigo?: string;
  endereco?: string;
}

interface AutocompleteClienteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (cliente: Cliente) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const AutocompleteCliente: React.FC<AutocompleteClienteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Nome do cliente',
  autoFocus = false,
}) => {
  const [sugestoes, setSugestoes] = useState<Cliente[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce de 300ms
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length >= 3) {
      timeoutRef.current = setTimeout(() => {
        buscarClientes(value);
      }, 300);
    } else {
      setSugestoes([]);
      setMostrarSugestoes(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const buscarClientes = async (query: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/clientes/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erro ao buscar clientes');

      const { data } = await response.json();
      setSugestoes(data);
      setMostrarSugestoes(true);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setSugestoes([]);
    } finally {
      setLoading(false);
    }
  };

  const selecionarCliente = (cliente: Cliente) => {
    onChange(cliente.nome);
    setMostrarSugestoes(false);
    if (onSelect) {
      onSelect(cliente);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!mostrarSugestoes || sugestoes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < sugestoes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selecionarCliente(sugestoes[selectedIndex]);
        }
        break;
      case 'Escape':
        setMostrarSugestoes(false);
        break;
    }
  };

  return (
    <div className="autocomplete-container" style={{ position: 'relative' }}>
      <div className="input-wrapper" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          className="modal-input-luxury"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 3 && setMostrarSugestoes(true)}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {loading && (
          <div className="input-icon" style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <Search size={18} className="animate-spin" style={{ color: '#999' }} />
          </div>
        )}
      </div>

      {mostrarSugestoes && sugestoes.length > 0 && (
        <div className="sugestoes-dropdown" style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          maxHeight: '240px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {sugestoes.map((cliente, index) => (
            <button
              key={cliente.id}
              type="button"
              className={`sugestao-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => selecionarCliente(cliente)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                background: index === selectedIndex ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                borderBottom: index < sugestoes.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="sugestao-nome" style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#000',
                marginBottom: '2px',
              }}>
                {cliente.nome}
              </div>
              {cliente.codigo && (
                <div className="sugestao-codigo" style={{
                  fontSize: '13px',
                  color: '#666',
                }}>
                  {cliente.codigo}
                </div>
              )}
              {cliente.endereco && (
                <div className="sugestao-endereco" style={{
                  fontSize: '12px',
                  color: '#999',
                  marginTop: '2px',
                }}>
                  {cliente.endereco}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {mostrarSugestoes && value.length >= 3 && sugestoes.length === 0 && !loading && (
        <div className="sugestoes-empty" style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          padding: '16px',
          textAlign: 'center',
          zIndex: 1000,
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Nenhum cliente encontrado
          </div>
          <button
            type="button"
            className="btn-criar-cliente"
            onClick={() => {
              // TODO: Abrir modal de criar cliente
              alert('Criar novo cliente: ' + value);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Criar "{value}"
          </button>
        </div>
      )}
    </div>
  );
};
```


#### Integração nos Modais

**Arquivo**: `frontend/src/pages/AgendamentosPageCore.tsx`
```typescript
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';

// Substituir input de cliente por:
<AutocompleteCliente
  value={novoAgendamento.cliente}
  onChange={(value) => setNovoAgendamento(prev => ({ ...prev, cliente: value }))}
  placeholder="Nome do cliente"
  autoFocus
/>
```

**Arquivo**: `frontend/src/pages/DashboardPageCore.tsx`
```typescript
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';

// Substituir input de cliente por:
<AutocompleteCliente
  value={novoTrabalho.cliente}
  onChange={(value) => setNovoTrabalho(prev => ({ ...prev, cliente: value }))}
  placeholder="Nome do cliente"
  autoFocus
/>
```

---

## 📦 FUNCIONALIDADE 3: Gestão de Funções Reutilizáveis

### 🎯 Objetivo
Permitir cadastrar funções reutilizáveis (Operador, Motorista, Supervisor) ao invés de digitar toda vez no modal "Novo Funcionário".

### 📐 Regras de Negócio

1. **Cadastro**: Dono da empresa pode criar/editar/deletar funções
2. **Seleção**: Dropdown com funções cadastradas + opção "Outra..."
3. **Padrão**: Sistema vem com 3 funções pré-cadastradas:
   - Operador
   - Motorista
   - Supervisor
4. **Validação**: Nome da função é obrigatório e único por empresa

### 🗄️ Estrutura de Dados Firebase

#### Collection: `companies/{companyId}/funcoes`
```typescript
interface Funcao {
  id: string;
  nome: string; // "Operador", "Motorista", etc.
  descricao?: string; // Opcional
  diariaBasePadrao?: number; // Diária padrão para esta função
  cor?: string; // Cor para badge (opcional)
  ordem: number; // Para ordenação customizada
  companyId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}
```


### 🔧 Backend - Endpoints Necessários

#### 1. GET `/api/funcoes`
**Descrição**: Lista funções da empresa  
**Permissões**: `owner`, `admin_platform`, `user`  
**Response**:
```typescript
{
  success: true,
  data: Funcao[]
}
```

#### 2. POST `/api/funcoes`
**Descrição**: Cria nova função  
**Permissões**: `owner`, `admin_platform`  
**Request Body**:
```typescript
{
  nome: string, // Obrigatório
  descricao?: string,
  diariaBasePadrao?: number,
  cor?: string
}
```

#### 3. PUT `/api/funcoes/:id`
**Descrição**: Atualiza função  
**Permissões**: `owner`, `admin_platform`  
**Request Body**: Mesmos campos do POST

#### 4. DELETE `/api/funcoes/:id`
**Descrição**: Deleta função (soft delete)  
**Permissões**: `owner`, `admin_platform`  
**Validação**: Não permitir deletar se houver funcionários usando esta função

#### 5. POST `/api/funcoes/seed`
**Descrição**: Cria funções padrão para empresa nova  
**Permissões**: `admin_platform` (chamado automaticamente ao criar empresa)  
**Lógica**:
```typescript
async function seedFuncoesPadrao(companyId: string) {
  const funcoesPadrao = [
    { nome: 'Operador', diariaBasePadrao: 150, ordem: 1 },
    { nome: 'Motorista', diariaBasePadrao: 180, ordem: 2 },
    { nome: 'Supervisor', diariaBasePadrao: 250, ordem: 3 },
  ];
  
  for (const funcao of funcoesPadrao) {
    await firestore.collection(`companies/${companyId}/funcoes`).add({
      ...funcao,
      companyId,
      deletedAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}
```


### 🎨 Frontend - Mudanças Necessárias

#### Arquivo: `frontend/src/pages/FuncionariosPageCore.tsx`

**Mudanças**:
1. Carregar funções ao montar componente
2. Substituir input de função por dropdown
3. Adicionar botão "Gerenciar Funções" (abre modal)
4. Implementar modal de gestão de funções

**Código**:
```typescript
// Estado
const [funcoes, setFuncoes] = useState<Funcao[]>([]);
const [mostrarModalFuncoes, setMostrarModalFuncoes] = useState(false);
const [funcaoSelecionada, setFuncaoSelecionada] = useState<string>('');
const [funcaoOutra, setFuncaoOutra] = useState('');

// Carregar funções
useEffect(() => {
  carregarFuncoes();
}, [companyId]);

const carregarFuncoes = async () => {
  try {
    const response = await fetch('/api/funcoes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    
    if (!response.ok) throw new Error('Erro ao carregar funções');
    
    const { data } = await response.json();
    setFuncoes(data);
  } catch (error) {
    console.error('Erro ao carregar funções:', error);
  }
};

// Dropdown de função
<div className="modal-field-luxury">
  <label className="modal-label-luxury">Função *</label>
  <select
    className="modal-input-luxury"
    value={funcaoSelecionada}
    onChange={(e) => {
      setFuncaoSelecionada(e.target.value);
      if (e.target.value !== 'outra') {
        setFormFuncao(e.target.value);
        // Preencher diária base padrão
        const funcao = funcoes.find(f => f.nome === e.target.value);
        if (funcao?.diariaBasePadrao) {
          setFormDiariaBase(funcao.diariaBasePadrao.toString());
        }
      }
    }}
  >
    <option value="">Selecione...</option>
    {funcoes.map(funcao => (
      <option key={funcao.id} value={funcao.nome}>
        {funcao.nome}
      </option>
    ))}
    <option value="outra">Outra...</option>
  </select>
</div>

{funcaoSelecionada === 'outra' && (
  <div className="modal-field-luxury">
    <label className="modal-label-luxury">Especifique a função *</label>
    <input
      type="text"
      className="modal-input-luxury"
      placeholder="Digite a função"
      value={funcaoOutra}
      onChange={(e) => {
        setFuncaoOutra(e.target.value);
        setFormFuncao(e.target.value);
      }}
    />
  </div>
)}

<button
  type="button"
  className="btn-gerenciar-funcoes"
  onClick={() => setMostrarModalFuncoes(true)}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'transparent',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#3b82f6',
    cursor: 'pointer',
    marginTop: '8px',
  }}
>
  <Settings size={16} />
  Gerenciar Funções
</button>
```


#### Modal de Gestão de Funções

**Componente**: `frontend/src/components/funcionarios/ModalGestaoFuncoes.tsx`

```typescript
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Funcao {
  id: string;
  nome: string;
  descricao?: string;
  diariaBasePadrao?: number;
  cor?: string;
}

interface ModalGestaoFuncoesProps {
  funcoes: Funcao[];
  onClose: () => void;
  onRefresh: () => void;
}

export const ModalGestaoFuncoes: React.FC<ModalGestaoFuncoesProps> = ({
  funcoes,
  onClose,
  onRefresh,
}) => {
  const [editando, setEditando] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formDiaria, setFormDiaria] = useState('150');

  const salvarFuncao = async () => {
    if (!formNome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      const url = editando 
        ? `/api/funcoes/${editando}` 
        : '/api/funcoes';
      
      const method = editando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formNome.trim(),
          diariaBasePadrao: parseFloat(formDiaria) || 150,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar função');

      setFormNome('');
      setFormDiaria('150');
      setEditando(null);
      setCriando(false);
      onRefresh();
    } catch (error) {
      console.error('Erro ao salvar função:', error);
      alert('Erro ao salvar função');
    }
  };

  const deletarFuncao = async (id: string) => {
    if (!confirm('Deletar esta função?')) return;

    try {
      const response = await fetch(`/api/funcoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao deletar função');
      }

      onRefresh();
    } catch (error: any) {
      console.error('Erro ao deletar função:', error);
      alert(error.message || 'Erro ao deletar função');
    }
  };

  return (
    <div className="modal-overlay-luxury" onClick={onClose}>
      <div 
        className="modal-container-luxury" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        <div className="modal-header-luxury">
          <h3 className="modal-title-luxury">Gerenciar Funções</h3>
          <button className="modal-close-luxury" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body-luxury">
          {/* Lista de funções */}
          <div className="funcoes-list" style={{ marginBottom: '16px' }}>
            {funcoes.map(funcao => (
              <div 
                key={funcao.id}
                className="funcao-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: '#fafafa',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '10px',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#000' }}>
                    {funcao.nome}
                  </div>
                  {funcao.diariaBasePadrao && (
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      Diária padrão: R$ {funcao.diariaBasePadrao.toFixed(2)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setEditando(funcao.id);
                      setFormNome(funcao.nome);
                      setFormDiaria(funcao.diariaBasePadrao?.toString() || '150');
                      setCriando(false);
                    }}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#3b82f6',
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deletarFuncao(funcao.id)}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulário de criar/editar */}
          {(criando || editando) && (
            <div 
              className="funcao-form"
              style={{
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.04)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            >
              <div className="modal-field-luxury" style={{ marginBottom: '12px' }}>
                <label className="modal-label-luxury">Nome da Função *</label>
                <input
                  type="text"
                  className="modal-input-luxury"
                  placeholder="Ex: Operador"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal-field-luxury" style={{ marginBottom: '12px' }}>
                <label className="modal-label-luxury">Diária Base Padrão (R$)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="modal-input-luxury"
                  placeholder="150.00"
                  value={formDiaria}
                  onChange={(e) => setFormDiaria(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setFormNome('');
                    setFormDiaria('150');
                    setEditando(null);
                    setCriando(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarFuncao}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editando ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          )}

          {/* Botão adicionar */}
          {!criando && !editando && (
            <button
              onClick={() => {
                setCriando(true);
                setFormNome('');
                setFormDiaria('150');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'transparent',
                border: '2px dashed rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#3b82f6',
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Adicionar Nova Função
            </button>
          )}
        </div>

        <div className="modal-footer-luxury">
          <button 
            className="modal-btn-luxury modal-btn-create-luxury" 
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📋 Checklist de Implementação

### Backend

#### Funcionalidade 1: Agendamentos → Trabalhos
- [ ] Adicionar campo `origem` ao model `Agendamento`
- [ ] Adicionar status `convertido` ao enum de status
- [ ] Criar endpoint `POST /api/agendamentos/:id/confirmar`
- [ ] Criar endpoint `POST /api/agendamentos/:id/rejeitar`
- [ ] Implementar job `convertAgendamentosJob` (cron diário às 00:00)
- [ ] Adicionar logs de auditoria para conversões
- [ ] Testar conversão manual vs. IA

#### Funcionalidade 2: Autocomplete Clientes
- [ ] Criar collection `companies/{companyId}/clientes`
- [ ] Criar endpoint `GET /api/clientes/search?q={query}`
- [ ] Criar endpoint `POST /api/clientes`
- [ ] Implementar busca case-insensitive
- [ ] Adicionar índice Firestore para busca por nome
- [ ] Testar performance com 1000+ clientes

#### Funcionalidade 3: Gestão de Funções
- [ ] Criar collection `companies/{companyId}/funcoes`
- [ ] Criar endpoint `GET /api/funcoes`
- [ ] Criar endpoint `POST /api/funcoes`
- [ ] Criar endpoint `PUT /api/funcoes/:id`
- [ ] Criar endpoint `DELETE /api/funcoes/:id`
- [ ] Criar endpoint `POST /api/funcoes/seed`
- [ ] Integrar seed ao criar nova empresa
- [ ] Validar unicidade de nome por empresa
- [ ] Validar que função não pode ser deletada se em uso

### Frontend

#### Funcionalidade 1: Agendamentos → Trabalhos
- [ ] Adicionar campo `origem: 'manual'` ao criar agendamento
- [ ] Adicionar badge ✨ "IA" para agendamentos da IA
- [ ] Adicionar botões "Confirmar" e "Rejeitar" para agendamentos IA
- [ ] Implementar função `confirmarAgendamento()`
- [ ] Implementar função `rejeitarAgendamento()`
- [ ] Adicionar toast de sucesso/erro
- [ ] Testar fluxo completo

#### Funcionalidade 2: Autocomplete Clientes
- [ ] Criar componente `AutocompleteCliente.tsx`
- [ ] Implementar debounce de 300ms
- [ ] Implementar navegação por teclado (↑↓ Enter Esc)
- [ ] Adicionar loading state
- [ ] Adicionar estado vazio com botão "Criar"
- [ ] Integrar em `AgendamentosPageCore.tsx`
- [ ] Integrar em `DashboardPageCore.tsx`
- [ ] Testar performance e UX

#### Funcionalidade 3: Gestão de Funções
- [ ] Criar componente `ModalGestaoFuncoes.tsx`
- [ ] Carregar funções ao montar `FuncionariosPageCore`
- [ ] Substituir input por dropdown de funções
- [ ] Adicionar opção "Outra..." no dropdown
- [ ] Adicionar botão "Gerenciar Funções"
- [ ] Implementar CRUD completo no modal
- [ ] Preencher diária base automaticamente ao selecionar função
- [ ] Testar fluxo completo

### Testes

- [ ] Testar conversão automática de agendamentos às 00:00
- [ ] Testar confirmação/rejeição de agendamentos IA
- [ ] Testar autocomplete com 3+ caracteres
- [ ] Testar autocomplete com caracteres especiais
- [ ] Testar criação de cliente inline
- [ ] Testar gestão de funções (CRUD)
- [ ] Testar validação de função em uso
- [ ] Testar seed de funções padrão

### Documentação

- [ ] Atualizar README com novas funcionalidades
- [ ] Documentar endpoints no `GUIA_BACKEND_ENDPOINTS.md`
- [ ] Criar guia de uso para usuários finais
- [ ] Atualizar versão no Sidebar para Alpha 0.14.0

---

## 🚀 Ordem de Implementação Recomendada

### Fase 1: Gestão de Funções (Mais Simples)
1. Backend: Collection + Endpoints
2. Backend: Seed de funções padrão
3. Frontend: Componente ModalGestaoFuncoes
4. Frontend: Integração em FuncionariosPageCore
5. Testes

### Fase 2: Autocomplete de Clientes (Média Complexidade)
1. Backend: Collection + Endpoint de busca
2. Frontend: Componente AutocompleteCliente
3. Frontend: Integração nos modais
4. Testes de performance

### Fase 3: Agendamentos → Trabalhos (Mais Complexa)
1. Backend: Atualizar model Agendamento
2. Backend: Endpoints confirmar/rejeitar
3. Backend: Job de conversão automática
4. Frontend: Botões e badges
5. Frontend: Funções de confirmação
6. Testes end-to-end

---

## 📊 Estimativa de Tempo

- **Gestão de Funções**: 4-6 horas
- **Autocomplete de Clientes**: 6-8 horas
- **Agendamentos → Trabalhos**: 8-12 horas
- **Testes e Ajustes**: 4-6 horas

**Total**: 22-32 horas (3-4 dias de trabalho)

---

## ✅ Critérios de Aceitação

### Funcionalidade 1: Agendamentos → Trabalhos
- ✅ Agendamentos manuais aparecem automaticamente em /trabalhos na data correta
- ✅ Agendamentos da IA mostram badge ✨ "IA"
- ✅ Agendamentos da IA requerem confirmação antes de aparecer em /trabalhos
- ✅ Botão "Rejeitar" marca agendamento como cancelado
- ✅ Job roda diariamente às 00:00 sem falhas
- ✅ Logs de auditoria registram todas as conversões

### Funcionalidade 2: Autocomplete de Clientes
- ✅ Sugestões aparecem após digitar 3+ caracteres
- ✅ Debounce de 300ms funciona corretamente
- ✅ Navegação por teclado (↑↓ Enter Esc) funciona
- ✅ Ao clicar em sugestão, preenche o campo automaticamente
- ✅ Estado vazio mostra botão "Criar novo cliente"
- ✅ Performance aceitável com 1000+ clientes

### Funcionalidade 3: Gestão de Funções
- ✅ Dropdown mostra funções cadastradas + "Outra..."
- ✅ Ao selecionar função, preenche diária base automaticamente
- ✅ Modal de gestão permite criar/editar/deletar funções
- ✅ Validação impede deletar função em uso
- ✅ Empresas novas recebem 3 funções padrão automaticamente
- ✅ Nome de função é único por empresa

---

**Documento criado em**: 02/02/2026  
**Próxima revisão**: Após implementação da Fase 1  
**Responsável**: Kaynan Moreira
