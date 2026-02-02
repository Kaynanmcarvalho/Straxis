# Trabalhos - Integração Firebase

**Data**: 02/02/2026  
**Versão**: Alpha 0.12.0  
**Status**: ✅ Concluído

## 📋 Objetivo

Integrar a página de Trabalhos com o Firebase para persistir dados entre reloads, eliminando o problema de perda de dados ao atualizar a página.

## 🔧 Mudanças Implementadas

### 1. Estrutura de Tipos

**Problema**: Conflito entre tipo `Trabalho` do Firebase e tipo local da página.

**Solução**: Criada interface `TrabalhoLocal` completa e independente:

```typescript
interface TrabalhoLocal {
  id: string;
  tipo: 'carga' | 'descarga';
  cliente: string;
  local: string;
  toneladas: number;
  toneladasParciais: number;
  status: 'planejado' | 'em_execucao' | 'pausado' | 'finalizado' | 'cancelado';
  funcionarios: Funcionario[];
  registrosPresenca: RegistroPresenca[];
  historico: HistoricoAlteracao[];
  pausas?: Pausa[];
  dataInicio?: Date;
  dataFim?: Date;
}
```

### 2. Carregamento de Dados

**Implementado**:
- `useEffect` para carregar trabalhos ao montar componente
- Função `loadTrabalhos()` async que busca do Firebase
- Conversão de `Trabalho` (Firebase) para `TrabalhoLocal` (UI)
- Loading state com spinner

```typescript
const loadTrabalhos = async () => {
  try {
    setLoading(true);
    const data = await trabalhoService.list();
    
    // Converter trabalhos do Firebase para formato local
    const trabalhosLocais: TrabalhoLocal[] = data.map(t => ({
      id: t.id,
      tipo: t.tipo,
      cliente: '', // TODO: adicionar campo cliente no backend
      local: '', // TODO: adicionar campo local no backend
      toneladas: t.tonelagem,
      toneladasParciais: 0, // TODO: adicionar campo no backend
      status: 'planejado', // TODO: adicionar campo status no backend
      funcionarios: [], // TODO: mapear de t.funcionarios
      registrosPresenca: [],
      historico: [],
      pausas: [],
    }));
    
    setTrabalhos(trabalhosLocais);
  } catch (error) {
    console.error('Erro ao carregar trabalhos:', error);
    alert('Erro ao carregar trabalhos');
  } finally {
    setLoading(false);
  }
};
```

### 3. Criação de Trabalhos

**Implementado**:
- Criação via `trabalhoService.create()`
- Conversão de dados do form para formato Firebase
- Conversão do trabalho criado para formato local
- Atualização do estado local após criação

```typescript
const criarNovoTrabalho = async () => {
  // ... validações ...
  
  try {
    // Criar trabalho no Firebase
    const trabalhoData = {
      tipo: novoTrabalho.tipo,
      tonelagem: toneladas,
      valorRecebidoCentavos: 0,
      funcionarios: [],
      totalPagoCentavos: 0,
      lucroCentavos: 0,
      observacoes: `Cliente: ${novoTrabalho.cliente} | Local: ${novoTrabalho.local}`,
    };

    const novoTrabalhoCriado = await trabalhoService.create(trabalhoData);
    
    // Converter para formato local
    const trabalhoLocal: TrabalhoLocal = {
      id: novoTrabalhoCriado.id,
      tipo: novoTrabalhoCriado.tipo,
      cliente: novoTrabalho.cliente,
      local: novoTrabalho.local,
      toneladas: novoTrabalhoCriado.tonelagem,
      toneladasParciais: 0,
      status: 'planejado',
      funcionarios: [],
      registrosPresenca: [],
      historico: [],
      pausas: [],
    };
    
    setTrabalhos(prev => [...prev, trabalhoLocal]);
    // ...
  } catch (error) {
    console.error('Erro ao criar trabalho:', error);
    alert('❌ Erro ao criar trabalho. Tente novamente.');
  }
};
```

### 4. UI - Loading State

**Adicionado**:
- Spinner animado durante carregamento
- Mensagem "Carregando operações..."
- Empty state só aparece quando `!loading && trabalhos.length === 0`

```tsx
{loading && (
  <div className="loading-state">
    <div className="loading-spinner"></div>
    <p>Carregando operações...</p>
  </div>
)}
```

**CSS**:
```css
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

## 📝 TODOs - Backend

Os seguintes campos precisam ser adicionados no backend para funcionalidade completa:

### Modelo `Trabalho` (Firebase)

```typescript
interface Trabalho {
  // Campos existentes
  id: string;
  companyId: string;
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorRecebidoCentavos: number;
  funcionarios: TrabalhoFuncionario[];
  totalPagoCentavos: number;
  lucroCentavos: number;
  observacoes?: string;
  
  // NOVOS CAMPOS NECESSÁRIOS
  cliente: string;                    // Nome do cliente
  local: string;                      // Local da operação
  toneladasParciais: number;          // Progresso da operação
  status: 'planejado' | 'em_execucao' | 'pausado' | 'finalizado' | 'cancelado';
  pausas?: Array<{                    // Histórico de pausas
    inicio: Date;
    fim?: Date;
    motivo: string;
  }>;
  registrosPresenca?: Array<{         // Registros detalhados de presença
    funcionarioId: string;
    tipo: 'presente_integral' | 'meia_diaria' | 'falta_total' | 'atraso' | 'saida_antecipada';
    horarioEntrada?: string;
    horarioSaida?: string;
    observacao?: string;
    registradoEm: Date;
  }>;
  historico?: Array<{                 // Auditoria de alterações
    id: string;
    tipo: string;
    campo: string;
    valorAnterior: string;
    valorNovo: string;
    usuario: string;
    timestamp: Date;
  }>;
  dataInicio?: Date;                  // Quando iniciou execução
  dataFim?: Date;                     // Quando finalizou
  
  // Campos existentes
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### Endpoints Necessários

1. **GET /trabalhos** - ✅ Já existe
2. **POST /trabalhos** - ✅ Já existe (precisa aceitar novos campos)
3. **PUT /trabalhos/:id** - ✅ Já existe (precisa aceitar novos campos)
4. **DELETE /trabalhos/:id** - ✅ Já existe (soft delete)

### Validações Backend

- `cliente`: obrigatório, string não vazia
- `local`: obrigatório, string não vazia
- `toneladasParciais`: número >= 0, <= tonelagem
- `status`: enum válido
- `pausas`: array opcional, validar estrutura
- `registrosPresenca`: array opcional, validar estrutura
- `historico`: array opcional, validar estrutura

## 🔄 Fluxo de Dados

```
1. Usuário abre página
   ↓
2. useEffect dispara loadTrabalhos()
   ↓
3. trabalhoService.list() busca do Firebase
   ↓
4. Conversão Trabalho → TrabalhoLocal
   ↓
5. setTrabalhos() atualiza UI
   ↓
6. Usuário cria novo trabalho
   ↓
7. trabalhoService.create() salva no Firebase
   ↓
8. Conversão Trabalho → TrabalhoLocal
   ↓
9. setTrabalhos() adiciona ao estado
   ↓
10. UI atualiza instantaneamente
```

## ⚠️ Limitações Atuais

1. **Campos temporários**: `cliente`, `local`, `toneladasParciais`, `status` são armazenados apenas localmente
2. **Sem sincronização**: Alterações (tonelagem, equipe, presença) não são salvas no Firebase
3. **Sem atualização**: Mudanças de outros usuários não aparecem em tempo real
4. **Observações**: Campos `cliente` e `local` são salvos no campo `observacoes` como workaround

## 🎯 Próximos Passos

### Fase 1: Backend (Prioridade Alta)
- [ ] Adicionar campos ao modelo `Trabalho` no backend
- [ ] Atualizar validações no controller
- [ ] Atualizar endpoints para aceitar novos campos
- [ ] Testar criação e atualização com novos campos

### Fase 2: Frontend (Prioridade Alta)
- [ ] Implementar `trabalhoService.update()` para salvar alterações
- [ ] Chamar `update()` em:
  - Ajuste de tonelagem
  - Mudança de status
  - Adição/remoção de funcionários
  - Registro de presença
  - Pausas
- [ ] Adicionar debounce para evitar muitas chamadas

### Fase 3: Tempo Real (Prioridade Média)
- [ ] Implementar listener Firestore para atualizações em tempo real
- [ ] Sincronizar mudanças entre múltiplos usuários
- [ ] Adicionar indicador de "outro usuário editando"

### Fase 4: Offline (Prioridade Baixa)
- [ ] Implementar cache local (IndexedDB)
- [ ] Queue de operações offline
- [ ] Sincronização ao voltar online

## 📊 Impacto

### Antes
- ❌ Dados perdidos ao recarregar página
- ❌ Trabalhos apenas em memória
- ❌ Sem persistência

### Depois
- ✅ Dados persistem no Firebase
- ✅ Trabalhos carregados ao abrir página
- ✅ Criação salva automaticamente
- ⚠️ Alterações ainda não sincronizam (próxima fase)

## 🐛 Erros Corrigidos

1. **Conflito de tipos**: `TrabalhoLocal` vs `Trabalho` (Firebase)
2. **Import não usado**: Removido `TrabalhoType`
3. **Loading não usado**: Adicionado loading state na UI
4. **Conversão de dados**: Mapeamento correto entre formatos

## 📦 Arquivos Modificados

- `frontend/src/pages/TrabalhosPageCore.tsx` - Lógica de integração
- `frontend/src/pages/TrabalhosPageCore.css` - Loading state CSS
- `frontend/src/components/common/Sidebar.tsx` - Versão atualizada para 0.12.0

## ✅ Checklist de Qualidade

- [x] Código TypeScript sem erros
- [x] Loading state implementado
- [x] Empty state funcional
- [x] Conversão de tipos correta
- [x] Error handling implementado
- [x] Versão atualizada no Sidebar
- [x] Documentação criada
- [ ] Testes unitários (pendente)
- [ ] Testes de integração (pendente)

## 🎨 Design

Mantido design luxury operacional existente:
- Cards com gradientes e animações
- Controles de tonelagem intuitivos
- Gestão de equipe visual
- Estados visuais claros (ativo, pausado, finalizado)

## 🔐 Segurança

- ✅ Validações no frontend
- ⚠️ Validações no backend (pendente para novos campos)
- ✅ Soft delete preservado
- ✅ Multi-tenant (companyId) mantido

---

**Desenvolvedor**: Kaynan Moreira  
**Data**: 02/02/2026  
**Versão**: Alpha 0.12.0
