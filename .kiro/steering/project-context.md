# Contexto do Projeto Straxis SaaS

## 📋 Informações do Sistema
- **Nome**: Straxis SaaS
- **Versão Atual**: Alpha 0.7.8
- **Última Atualização**: 27/01/2026
- **Status**: Em Desenvolvimento Ativo

## 👥 Desenvolvedores

### Kaynan Moreira (Desenvolvedor Principal)
- **Telefone**: (62) 99451-0649
- **Responsabilidades**: 
  - Arquitetura do sistema
  - Backend (Node.js + TypeScript)
  - Integração Firebase
  - Tasks 1-5, 9-35
- **Horário de Trabalho**: Detectado automaticamente pelo Kiro

### Renier (Colaborador)
- **Telefone**: (62) 99278-2003
- **Responsabilidades**:
  - Frontend (React + TypeScript)
  - UI/UX Design System
  - Tasks 6-8 (a partir da task 6)
- **Horário de Trabalho**: Detectado automaticamente pelo Kiro

## 🔄 Sistema de Versionamento Automático

### IMPORTANTE: Atualizar Versão Antes de Commit/Push

**SEMPRE antes de fazer commit ou push para o Git:**

1. **Kiro detecta automaticamente**:
   - Data e hora atual (27/01/2026 - Tuesday)
   - Desenvolvedor logado (Kaynan ou Renier)
   - Mudanças realizadas

2. **Atualizar versão no Sidebar**:
   - Arquivo: `frontend/src/components/common/Sidebar.tsx`
   - Localizar: `<span className="version-number">Alpha 0.7.8</span>`
   - Incrementar versão conforme tipo de mudança:
     - **Patch** (0.7.X): Correções de bugs, ajustes pequenos
     - **Minor** (0.X.0): Novas funcionalidades, tasks concluídas
     - **Major** (X.0.0): Mudanças arquiteturais, breaking changes

3. **Atualizar também**:
   - `<span className="version-number-collapsed">v0.7.8</span>`
   - Atributo `title="Última atualização: 27/01/2026"`

4. **Exemplo de atualização**:
```tsx
// ANTES
<span className="version-number">Alpha 0.7.8</span>
<span className="version-number-collapsed">v0.7.8</span>
title="Última atualização: 27/01/2026"

// DEPOIS (nova funcionalidade)
<span className="version-number">Alpha 0.8.0</span>
<span className="version-number-collapsed">v0.8.0</span>
title="Última atualização: 27/01/2026"
```

### Convenção de Versionamento
- **Alpha 0.X.X**: Desenvolvimento inicial (atual)
- **Beta 1.X.X**: Testes e refinamento
- **Release 2.X.X**: Produção estável

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + PWA
- **Backend**: Node.js 18+ + TypeScript + Express
- **Database**: Firebase Firestore (NoSQL)
- **Auth**: Firebase Authentication
- **IA**: OpenAI GPT-4/3.5 + Google Gemini Pro
- **WhatsApp**: Baileys (WhatsApp Web API)
- **Testes**: Jest + fast-check (property-based testing)
- **UI**: Lucide React (ícones) + Recharts (gráficos) + Framer Motion (animações)

### Tipos de Usuários
1. **Admin Plataforma**: Dono do SaaS, gerencia empresas
2. **Dono Empresa**: Cliente, gerencia usuários e configurações
3. **Usuário Comum**: Operacional, registra trabalhos

## 🔒 Regras Críticas de Segurança

### 1. Valores Monetários (CRÍTICO!)
```typescript
// ❌ ERRADO - NUNCA FAZER
valorRecebido: number; // float - PERIGOSO!

// ✅ CORRETO - SEMPRE FAZER
valorRecebidoCentavos: number; // integer - SEGURO!

// Conversão
reaisToCentavos(100.50) → 10050
centavosToReais(10050) → 100.50
```
- **SEMPRE** armazenar em centavos (integer)
- **NUNCA** usar float para dinheiro
- Converter para reais apenas na UI
- Previne fraudes e erros de arredondamento

### 2. Soft Delete (Preservar Histórico)
```typescript
// ❌ ERRADO
await firestore.collection('trabalhos').doc(id).delete();

// ✅ CORRETO
await firestore.collection('trabalhos').doc(id).update({
  deletedAt: new Date()
});

// Queries sempre filtram soft-deleted
.where('deletedAt', '==', null)
```
- **NUNCA** deletar permanentemente (exceto Admin)
- Usar `deletedAt: Date | null`
- Preserva histórico financeiro e auditoria

### 3. Multi-Tenant (Isolamento Total)
```typescript
// ✅ SEMPRE filtrar por companyId
const trabalhos = await firestore
  .collection('companies/{companyId}/trabalhos')
  .where('deletedAt', '==', null)
  .get();
```
- **SEMPRE** filtrar por `companyId`
- Isolar completamente dados entre empresas
- Validar permissões em todas as operações
- Firestore Rules bloqueiam acesso cross-tenant

### 4. Rate Limiting
- **WhatsApp**: 1000 msg/dia, 10 msg/min, 30s cooldown
- **IA**: 60 req/min por empresa, 500 req/dia por usuário
- Previne custos descontrolados e spam

### 5. Fallback Operacional
- IA falha → Mensagem padrão + notificação
- WhatsApp desconecta → Alerta no painel
- Retry com backoff exponencial (máx 3 tentativas)

## 📊 Estrutura de Dados (Firestore)

```
firestore/
├── companies/                    # Empresas (tenants)
│   └── {companyId}/
│       ├── trabalhos/            # deletedAt (soft delete)
│       ├── agendamentos/         # deletedAt (soft delete)
│       ├── funcionarios/         # deletedAt (soft delete)
│       ├── iaUsage/              # Custos de IA
│       ├── whatsappSessions/     # Sessões WhatsApp
│       └── whatsappMessages/     # Mensagens
├── users/                        # Usuários (deletedAt)
├── logs/                         # Auditoria completa
├── rateLimitCounters/            # Controle de uso
└── globalConfig/                 # Configurações globais
```

## 🎯 Funcionalidades Principais

1. **Gestão de Trabalhos**: Carga/descarga, cálculo automático de lucro
2. **Agendamentos**: Planejamento futuro de operações
3. **Funcionários**: Histórico, estatísticas, pagamentos
4. **Relatórios**: Diário/semanal/mensal, export PDF/Excel
5. **WhatsApp**: Integração Baileys, mensagens automáticas
6. **IA**: OpenAI/Gemini, controle de custos, anti-alucinação
7. **Dashboard**: Indicadores, gráficos interativos, dark mode
8. **PWA**: Offline-first, sincronização automática

## 🧪 Estratégia de Testes

### Property-Based Testing (fast-check)
- **69 propriedades** de correção definidas
- Mínimo **100 iterações** por teste
- Tag format: `Feature: straxis-saas, Property {número}: {descrição}`
- Valida invariantes universais

### Testes Unitários (Jest)
- Exemplos específicos e casos de borda
- Cobertura mínima: **80%**
- Testes de integração (API, Firebase)
- Testes E2E (fluxos completos)

## 📁 Estrutura de Pastas

```
straxis-saas/
├── .kiro/specs/straxis-saas/     # Especificações
│   ├── requirements.md           # Requisitos (EARS)
│   ├── design.md                 # Design técnico
│   └── tasks.md                  # Plano de implementação
├── backend/src/
│   ├── controllers/              # Lógica de rotas
│   ├── services/                 # Lógica de negócio
│   ├── models/                   # Interfaces TypeScript
│   ├── middleware/               # Auth, tenant, validation
│   ├── routes/                   # Definição de rotas
│   ├── utils/                    # Funções auxiliares
│   ├── config/                   # Configurações
│   └── __tests__/                # Testes
├── frontend/src/
│   ├── components/               # Componentes React
│   │   ├── common/               # Reutilizáveis (Button, Card, etc)
│   │   ├── dashboard/            # Dashboard
│   │   ├── trabalhos/            # Módulo trabalhos
│   │   ├── agendamentos/         # Módulo agendamentos
│   │   ├── funcionarios/         # Módulo funcionários
│   │   ├── relatorios/           # Módulo relatórios
│   │   ├── admin/                # Painel admin
│   │   ├── whatsapp/             # WhatsApp
│   │   ├── ia/                   # IA config
│   │   └── users/                # Gestão usuários
│   ├── pages/                    # Páginas
│   ├── services/                 # API calls
│   ├── hooks/                    # Custom hooks
│   ├── contexts/                 # Context API
│   ├── types/                    # TypeScript types
│   └── styles/                   # CSS/Tailwind
├── firebase.json                 # Config Firebase
├── firestore.rules               # Regras de segurança
└── firestore.indexes.json        # Índices Firestore
```

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                       # Frontend + Backend
cd backend && npm run dev         # Apenas backend
cd frontend && npm run dev        # Apenas frontend

# Testes
npm test                          # Todos os testes
npm run test:coverage             # Com cobertura
npm run test:watch                # Modo watch

# Build e Deploy
npm run build                     # Build completo
firebase deploy --only firestore:rules
firebase deploy --only hosting

# Utilitários
npm run lint                      # Linting
npm run format                    # Prettier
node backend/create-admin-user.js # Criar admin
```

## 📝 Padrões de Código

### TypeScript
- **Strict mode** habilitado
- Interfaces explícitas para todos os tipos
- Evitar `any`, usar `unknown` quando necessário
- Documentação JSDoc em funções complexas

### Nomenclatura
- **Arquivos**: kebab-case (`trabalho.service.ts`)
- **Componentes**: PascalCase (`TrabalhoForm.tsx`)
- **Funções**: camelCase (`calcularLucro()`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase com `I` opcional (`Trabalho` ou `ITrabalho`)

### Comentários
- Português para lógica de negócio
- Inglês para código técnico genérico
- Sempre comentar cálculos financeiros
- Explicar decisões não-óbvias

## 🎨 Design System

### Cores Semânticas
- **Success**: Verde (#4caf50)
- **Error**: Vermelho (#f44336)
- **Warning**: Laranja (#ff9800)
- **Info**: Azul (#03a9f4)
- **Primary**: Azul (#2196f3)

### Ícones (Lucide React)
- Dashboard: `LayoutDashboard`
- Trabalhos: `Package`
- Agendamentos: `Calendar`
- Funcionários: `Users`
- Relatórios: `FileText`
- WhatsApp: `MessageSquare`
- IA: `Brain`
- Logs: `ScrollText`

### Responsividade
- **Mobile**: 320px+
- **Tablet**: 768px+
- **Desktop**: 1024px+

## ⚠️ Checklist Antes de Commit

- [ ] **Atualizar versão no Sidebar** (`Sidebar.tsx`)
- [ ] Executar `npm run lint` (sem erros)
- [ ] Executar `npm test` (todos passando)
- [ ] Verificar valores monetários em centavos
- [ ] Verificar soft delete implementado
- [ ] Verificar filtro por `companyId`
- [ ] Testar em mobile (DevTools)
- [ ] Verificar dark mode funcionando
- [ ] Documentar mudanças no commit message

## 📚 Links Importantes

- **Spec Completa**: `.kiro/specs/straxis-saas/`
- **Tasks**: `.kiro/specs/straxis-saas/tasks.md` (35 tasks)
- **Design**: `.kiro/specs/straxis-saas/design.md`
- **Requirements**: `.kiro/specs/straxis-saas/requirements.md` (23 requisitos)
- **README**: `README.md` (documentação completa)
- **Setup Admin**: `SETUP_ADMIN.md`

## 🔥 Prioridades de Desenvolvimento

1. **Segurança**: Isolamento multi-tenant, validação de permissões
2. **Integridade Financeira**: Valores em centavos, cálculos corretos
3. **Auditoria**: Logs completos, soft delete
4. **Performance**: Queries otimizadas, cache, rate limiting
5. **UX**: Mobile-first, dark mode, responsivo, PWA offline

## 💡 Dicas Importantes

- **Sempre ler a spec** antes de implementar nova funcionalidade
- **Seguir padrão existente** de nomenclatura e estrutura
- **Testar localmente** antes de commitar
- **Documentar decisões** importantes em comentários
- **Perguntar quando houver dúvidas** - melhor prevenir que corrigir
- **Kiro detecta automaticamente** data/hora e desenvolvedor logado
- **Atualizar versão no Sidebar** é OBRIGATÓRIO antes de push
