# Straxis SaaS - Sistema de Gestão de Carga e Descarga

**Data de Criação:** 26/01/2026  
**Última Atualização:** 04/02/2026  
**Desenvolvedores Principais:** Kaynan e Renier
**Versão:** Beta 1.33.7  
**Status:** Em Desenvolvimento Ativo ✅


---

## 📋 Visão Geral

O Straxis é um sistema SaaS B2B multi-tenant para gestão de operações de carga e descarga. Oferece controle financeiro completo, gestão de funcionários, integração com WhatsApp via Baileys, e assistente de IA opcional (OpenAI/Google Gemini).

### Características Principais

- 🏢 **Multi-tenant** com isolamento total de dados
- 📱 **Mobile-first** PWA com suporte offline
- 💬 **WhatsApp** integrado via Baileys
- 🤖 **IA opcional** (OpenAI/Gemini) com controle de custos
- 📊 **Relatórios** completos (PDF/Excel)
- 🌙 **Dark mode** completo
- 🔒 **Segurança** com Firebase Rules rigorosas
- 📝 **Logs** completos de auditoria
- 🗑️ **Soft delete** para preservar histórico financeiro
- 💰 **Valores em centavos** (padrão bancário)
- 🚦 **Rate limiting** WhatsApp e IA
- 🔄 **Fallback operacional** para falhas

---

## 🏗️ Arquitetura

### Stack Tecnológica

**Frontend:**
- React + TypeScript
- PWA (Progressive Web App)
- Firebase SDK (Auth, Firestore, Storage)
- Dark mode completo
- Layout responsivo

**Backend:**
- Node.js + TypeScript
- Express.js
- Baileys (WhatsApp Web API)
- Firebase Admin SDK
- OpenAI SDK / Google Generative AI SDK

**Infraestrutura:**
- Firebase Firestore (banco de dados)
- Firebase Auth (autenticação)
- Firebase Storage (arquivos)
- Firebase Hosting (deploy)

### Diagrama de Arquitetura

```mermaid
flowchart TB
    subgraph Frontend["🎨 Frontend - React PWA"]
        UI[Interface Mobile-First]
        SW[Service Worker]
        Cache[Local Cache]
    end
    
    subgraph Backend["⚙️ Backend - Node.js"]
        API[API REST]
        WA[WhatsApp Baileys]
        AI[AI Service]
        RL[Rate Limiter]
        FB[Fallback Handler]
    end
    
    subgraph Firebase["🔥 Firebase"]
        Auth[Firebase Auth]
        FS[Firestore]
        Storage[Firebase Storage]
    end
    
    subgraph External["🌐 External Services"]
        OpenAI[OpenAI API]
        Gemini[Google Gemini API]
        WhatsApp[WhatsApp Web]
    end
    
    UI --> API
    UI --> Auth
    SW --> Cache
    API --> RL
    RL --> FS
    API --> Storage
    WA --> WhatsApp
    WA --> FS
    AI --> OpenAI
    AI --> Gemini
    AI --> FS
    API --> AI
    WA --> AI
    AI --> FB
    WA --> FB
    
    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style Firebase fill:#ffe1e1
    style External fill:#e1ffe1
```

---

## 👥 Tipos de Usuários

### 1. Admin da Plataforma (Dono do SaaS)
- Cria e gerencia empresas clientes
- Define planos (tempo em meses)
- Ativa/desativa empresas
- Visualiza logs globais
- Monitora uso de IA por empresa e usuário

### 2. Dono da Empresa (Cliente)
- Gerencia usuários da empresa
- Define permissões
- Configura WhatsApp
- Configura IA (provider, modelo, prompts)
- Define valores de carga/descarga
- Visualiza relatórios

### 3. Usuário Comum (Operacional)
- Registra trabalhos (carga/descarga)
- Cria agendamentos
- Visualiza dados permitidos
- Usa WhatsApp integrado

---

## 🗄️ Estrutura de Dados (Firestore)

### Coleções Principais

```mermaid
flowchart TB
    subgraph Root["📁 Root Collections"]
        Companies[🏢 companies/]
        Users[👥 users/]
        Logs[📝 logs/]
        GlobalConfig[⚙️ globalConfig/]
        RateLimit[🚦 rateLimitCounters/]
    end
    
    subgraph CompanySub["📂 Company Subcollections"]
        Trabalhos[📦 trabalhos/<br/>deletedAt]
        Agendamentos[📅 agendamentos/<br/>deletedAt]
        Funcionarios[👷 funcionarios/<br/>deletedAt]
        IAUsage[🤖 iaUsage/]
        WhatsAppSessions[💬 whatsappSessions/]
        WhatsAppMessages[📱 whatsappMessages/]
    end
    
    Companies --> Trabalhos
    Companies --> Agendamentos
    Companies --> Funcionarios
    Companies --> IAUsage
    Companies --> WhatsAppSessions
    Companies --> WhatsAppMessages
    
    style Root fill:#e1f5ff
    style CompanySub fill:#fff4e1
    style Trabalhos fill:#ffe1e1
    style Agendamentos fill:#ffe1e1
    style Funcionarios fill:#ffe1e1
```

### Estrutura Detalhada

```
firestore/
├── companies/                    # Empresas clientes
│   └── {companyId}/
│       ├── name, planMonths, planStartDate, planEndDate, active
│       ├── config (valores em centavos, whatsapp, ia, rate limits)
│       ├── trabalhos/            # Operações de carga/descarga
│       │   └── deletedAt (soft delete)
│       ├── agendamentos/         # Agendamentos futuros
│       │   └── deletedAt (soft delete)
│       ├── funcionarios/         # Equipe operacional
│       │   └── deletedAt (soft delete)
│       ├── iaUsage/              # Uso de IA (custos)
│       ├── whatsappSessions/     # Sessões WhatsApp
│       └── whatsappMessages/     # Mensagens WhatsApp
│
├── users/                        # Usuários do sistema
│   └── {userId}/
│       ├── email, name, companyId, role, permissions
│       ├── iaConfig (prompt personalizado)
│       └── deletedAt (soft delete)
│
├── logs/                         # Logs de auditoria
│   └── {logId}/
│       └── companyId, userId, type, action, details, timestamp
│
└── globalConfig/                 # Configurações globais
    └── system/
        ├── iaGlobalPrompt, iaModels
        ├── rateLimits (WhatsApp, IA)
        └── fallbackConfig (mensagens padrão)
```

---

## 🔐 Segurança Multi-Tenant

### Isolamento de Dados

Cada empresa é completamente isolada:
- Firestore Rules validam `companyId` em todas as operações
- Usuários só acessam dados da própria empresa
- Admin da Plataforma tem acesso global

### Controle de Acesso

```mermaid
flowchart LR
    User([👤 Usuário]) --> Auth[🔐 Firebase Auth]
    Auth --> Token[🎫 Token JWT]
    Token --> Middleware[🛡️ Tenant Middleware]
    Middleware --> Validate{✅ Valida<br/>CompanyID?}
    Validate -->|✓ OK| CheckPlan{📅 Plano<br/>Ativo?}
    Validate -->|✗ Erro| Deny[🚫 Bloqueia Acesso]
    CheckPlan -->|✓ Sim| Allow[✅ Permite Acesso]
    CheckPlan -->|✗ Não| Deny
    
    style User fill:#e1f5ff
    style Auth fill:#ffe1e1
    style Allow fill:#e1ffe1
    style Deny fill:#ffe1e1
```

### Bloqueio por Plano Vencido

- Empresas com `planEndDate < hoje` são bloqueadas
- Validação em Firestore Rules e middleware
- Usuários não conseguem acessar dados

---

## 💬 Integração WhatsApp

### Fluxo de Conexão

```mermaid
flowchart TD
    Start([👤 Dono Empresa]) --> Activate[Ativa WhatsApp no Painel]
    Activate --> Request[📤 POST /whatsapp/connect]
    Request --> InitSession[🔄 Baileys Inicia Sessão]
    InitSession --> GenQR[📱 Gera QR Code]
    GenQR --> Display[🖥️ Exibe QR Code na Tela]
    Display --> Scan{📸 Escaneia<br/>QR Code?}
    Scan -->|✓ Sim| Connect[🔗 WhatsApp Conecta]
    Scan -->|✗ Não| Timeout[⏱️ Timeout 2min]
    Timeout --> Display
    Connect --> SaveSession[💾 Salva Sessão no Firestore]
    SaveSession --> Notify[✅ Notifica: Conectado]
    Notify --> End([🎉 WhatsApp Ativo])
    
    style Start fill:#e1f5ff
    style End fill:#e1ffe1
    style Timeout fill:#ffe1e1
```

### Fluxo de Mensagens com IA

```mermaid
flowchart TD
    Start([📱 Mensagem WhatsApp]) --> Receive[📥 Baileys Recebe]
    Receive --> Save1[💾 Salva no Firestore]
    Save1 --> CheckRL{🚦 Rate Limit<br/>OK?}
    CheckRL -->|✗ Não| SendLimit[📤 Envia: Limite Atingido]
    CheckRL -->|✓ Sim| CheckIA{🤖 IA<br/>Ativa?}
    CheckIA -->|✗ Não| SendDefault[📤 Resposta Padrão]
    CheckIA -->|✓ Sim| ProcessIA[🧠 Processa com IA]
    ProcessIA --> QueryFS[🔍 Busca Dados no Firestore]
    QueryFS --> ValidateData{✅ Dados<br/>Válidos?}
    ValidateData -->|✗ Não| Fallback[⚠️ Fallback: Mensagem Padrão]
    ValidateData -->|✓ Sim| Generate[✨ Gera Resposta]
    Generate --> CheckHallucination{🔍 Validar<br/>Resposta?}
    CheckHallucination -->|✗ Alucinação| Fallback
    CheckHallucination -->|✓ OK| LogUsage[📊 Registra Uso IA]
    LogUsage --> SendResponse[📤 Envia Resposta]
    SendDefault --> End
    SendLimit --> End
    Fallback --> End
    SendResponse --> Save2[💾 Salva Mensagem Enviada]
    Save2 --> End([✅ Concluído])
    
    style Start fill:#e1f5ff
    style End fill:#e1ffe1
    style Fallback fill:#ffe1e1
    style CheckHallucination fill:#fff4e1
```

---

## 🤖 Assistente de IA

### Providers Suportados

- **OpenAI** (ChatGPT): GPT-4, GPT-3.5-turbo
- **Google Gemini**: Gemini Pro, Gemini Pro Vision

### Controle de Custos

**Categorização de Modelos:**
- 💚 **Baratos**: GPT-3.5-turbo, Gemini Pro
- 💛 **Médios**: GPT-4
- 🔴 **Caros**: GPT-4-turbo, modelos especializados

**Monitoramento:**
- Uso registrado por empresa e por usuário
- Custos calculados baseado em tokens
- Alertas quando limite é atingido
- Dashboard de custos para Admin

### Prevenção de Alucinação

**Estratégia:**
1. IA **APENAS** consulta dados do Firestore
2. Validação de respostas antes de enviar
3. Todos os valores numéricos devem existir no banco
4. Fallback para mensagem padrão em caso de erro
5. Valores monetários sempre em centavos (integer)
6. Rate limiting: 60 req/min por empresa, 1000 msg/dia WhatsApp

### Sistema de Prompts

```mermaid
flowchart TD
    Global[🌐 Prompt Global do Sistema] --> Merge1{🔀 Merge}
    Company[🏢 Prompt da Empresa] --> Merge1
    Merge1 --> Merge2{🔀 Merge}
    User[👤 Prompt do Usuário] --> Merge2
    Merge2 --> Validate[✅ Valida Composição]
    Validate --> Final[📝 Prompt Final Composto]
    Final --> Send[📤 Envia para IA]
    
    style Global fill:#e1f5ff
    style Company fill:#fff4e1
    style User fill:#e1ffe1
    style Final fill:#ffe1e1
```

- **Prompt Global**: Definido pelo Admin da Plataforma
- **Prompt da Empresa**: Personalizado pelo Dono da Empresa
- **Prompt do Usuário**: Personalizado pelo usuário individual

---

## 📊 Funcionalidades Principais

### 1. Gestão de Trabalhos

- Registro de carga/descarga
- Tonelagem, valor recebido
- Associação com funcionários
- Cálculo automático de:
  - Total pago aos funcionários
  - Lucro (recebido - pago)

### 2. Agendamentos

- Planejamento de trabalhos futuros
- Data, tipo, tonelagem, valor estimado
- Associação com funcionários
- Status: pendente, confirmado, cancelado, concluído

### 3. Gestão de Funcionários

- Cadastro de equipe operacional
- Histórico de trabalhos
- Estatísticas:
  - Total recebido por período
  - Quantidade de trabalhos
  - Performance

### 4. Relatórios

**Períodos:**
- Diário
- Semanal
- Mensal

**Métricas:**
- Faturamento total
- Custos totais
- Lucro total
- Por funcionário

**Exportação:**
- PDF
- Excel

### 5. Dashboard

**Indicadores:**
- 💰 Faturamento do mês
- 💸 Custos do mês
- 📈 Lucro do mês
- 🤖 Uso de IA
- 👷 Funcionários ativos

**Gráficos:**
- Faturamento mensal
- Evolução de lucro
- Uso de IA

---

## 🔄 Fluxos Principais

### Fluxo de Criação de Trabalho

```mermaid
flowchart TD
    Start([👤 Usuário]) --> Form[📝 Preenche Formulário]
    Form --> ValidateUI[✅ Valida Campos UI]
    ValidateUI --> ConvertCents[💰 Converte Reais → Centavos]
    ConvertCents --> Send[📤 POST /trabalhos]
    Send --> CheckAuth{🔐 Autenticado?}
    CheckAuth -->|✗ Não| Error401[❌ 401 Unauthorized]
    CheckAuth -->|✓ Sim| CheckPerm{🛡️ Tem<br/>Permissão?}
    CheckPerm -->|✗ Não| Error403[❌ 403 Forbidden]
    CheckPerm -->|✓ Sim| ValidateData[✅ Valida Dados]
    ValidateData --> CalcTotal[🧮 Calcula totalPagoCentavos]
    CalcTotal --> CalcProfit[📊 Calcula lucroCentavos]
    CalcProfit --> SaveFS[💾 Salva no Firestore]
    SaveFS --> LogAction[📝 Registra Log]
    LogAction --> Success[✅ Retorna Trabalho Criado]
    Success --> Display[🖥️ Exibe Confirmação]
    Display --> End([🎉 Concluído])
    Error401 --> End
    Error403 --> End
    
    style Start fill:#e1f5ff
    style End fill:#e1ffe1
    style Error401 fill:#ffe1e1
    style Error403 fill:#ffe1e1
    style CalcTotal fill:#fff4e1
    style CalcProfit fill:#fff4e1
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ e npm/yarn
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**
- Conta Firebase (Blaze plan para Cloud Functions)
- Chaves de API (opcional):
  - OpenAI API Key
  - Google Gemini API Key

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd straxis-saas
```

### 2. Configuração do Firebase

```bash
# Login no Firebase
firebase login

# Inicializar projeto Firebase
firebase init

# Selecione:
# - Firestore
# - Authentication
# - Hosting
# - Storage
```

### 3. Configuração do Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

**Edite o arquivo `.env`:**

```env
# Firebase
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=seu-service-account@projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Google Gemini (opcional)
GEMINI_API_KEY=AIza...

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Configuração do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

**Edite o arquivo `.env`:**

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_API_URL=http://localhost:3000/api
```

### 5. Deploy das Firestore Rules

```bash
# Na raiz do projeto
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 6. Executar em Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: `http://localhost:5173`

### 7. Build para Produção

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## ⚙️ Configuração Avançada

### Firebase Authentication

1. Acesse o Console Firebase
2. Vá em **Authentication** > **Sign-in method**
3. Ative os provedores desejados:
   - Email/Password
   - Google (opcional)

### Firestore Indexes

Os índices compostos necessários estão em `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "trabalhos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "deletedAt", "order": "ASCENDING" },
        { "fieldPath": "data", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy: `firebase deploy --only firestore:indexes`

### WhatsApp (Baileys)

A integração WhatsApp usa Baileys e requer:

1. Dispositivo Android/iOS com WhatsApp instalado
2. Escanear QR Code no painel da empresa
3. Manter sessão ativa (reconexão automática)

**Limitações:**
- 1 sessão por empresa
- Requer WhatsApp Business (recomendado)
- Rate limiting: 1000 msg/dia, 10 msg/min

### IA (OpenAI/Gemini)

**Configuração por Empresa:**

1. Dono da Empresa acessa **Configurações > IA**
2. Seleciona provider (OpenAI ou Gemini)
3. Escolhe modelo:
   - **Baratos**: GPT-3.5-turbo, Gemini Pro
   - **Médios**: GPT-4
   - **Caros**: GPT-4-turbo
4. Define limite de custo mensal (opcional)
5. Personaliza prompts

**Custos Estimados (Jan 2026):**
- GPT-3.5-turbo: ~$0.002/1K tokens
- GPT-4: ~$0.03/1K tokens
- Gemini Pro: ~$0.00025/1K tokens

---

## 📁 Estrutura de Pastas

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Componentes reutilizáveis
│   │   ├── dashboard/        # Dashboard
│   │   ├── trabalhos/        # Módulo de trabalhos
│   │   ├── agendamentos/     # Módulo de agendamentos
│   │   ├── funcionarios/     # Módulo de funcionários
│   │   ├── relatorios/       # Módulo de relatórios
│   │   ├── admin/            # Painel admin
│   │   ├── whatsapp/         # Integração WhatsApp
│   │   ├── users/            # Gestão de usuários
│   │   └── ia/               # Configuração IA
│   ├── contexts/             # React Context
│   │   ├── AuthContext.tsx
│   │   ├── CompanyContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useFirestore.ts
│   │   └── useTheme.ts
│   ├── services/             # Serviços de API
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── firestore.service.ts
│   │   └── offline.service.ts
│   ├── types/                # TypeScript types
│   │   ├── user.types.ts
│   │   ├── trabalho.types.ts
│   │   ├── agendamento.types.ts
│   │   ├── funcionario.types.ts
│   │   └── empresa.types.ts
│   ├── utils/                # Utilitários
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── calculations.ts
│   ├── styles/               # Estilos e tema
│   │   ├── theme.ts
│   │   └── global.css
│   ├── App.tsx
│   └── index.tsx
└── public/
    ├── manifest.json         # PWA manifest
    ├── service-worker.js     # Service Worker
    └── icons/                # Ícones PWA

```

### Backend

```
backend/
├── src/
│   ├── controllers/          # Controllers de API
│   │   ├── auth.controller.ts
│   │   ├── empresa.controller.ts
│   │   ├── user.controller.ts
│   │   ├── trabalho.controller.ts
│   │   ├── agendamento.controller.ts
│   │   ├── funcionario.controller.ts
│   │   ├── relatorio.controller.ts
│   │   ├── whatsapp.controller.ts
│   │   ├── ia.controller.ts
│   │   └── log.controller.ts
│   ├── services/             # Lógica de negócio
│   │   ├── firestore.service.ts
│   │   ├── auth.service.ts
│   │   ├── whatsapp.service.ts
│   │   ├── ia.service.ts
│   │   ├── openai.service.ts
│   │   ├── gemini.service.ts
│   │   ├── log.service.ts
│   │   ├── export.service.ts
│   │   └── dashboard.service.ts
│   ├── middleware/           # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/               # Modelos TypeScript
│   │   ├── user.model.ts
│   │   ├── empresa.model.ts
│   │   ├── trabalho.model.ts
│   │   ├── agendamento.model.ts
│   │   ├── funcionario.model.ts
│   │   └── log.model.ts
│   ├── routes/               # Rotas de API
│   │   ├── auth.routes.ts
│   │   ├── empresa.routes.ts
│   │   ├── user.routes.ts
│   │   ├── trabalho.routes.ts
│   │   ├── agendamento.routes.ts
│   │   ├── funcionario.routes.ts
│   │   ├── relatorio.routes.ts
│   │   ├── whatsapp.routes.ts
│   │   ├── ia.routes.ts
│   │   └── log.routes.ts
│   ├── utils/                # Utilitários
│   │   ├── validators.ts
│   │   ├── calculations.ts
│   │   └── formatters.ts
│   ├── config/               # Configurações
│   │   ├── firebase.config.ts
│   │   ├── openai.config.ts
│   │   └── gemini.config.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── .env                      # Variáveis de ambiente
├── .env.example              # Template de variáveis
├── package.json
└── tsconfig.json
```

### Raiz do Projeto

```
straxis-saas/
├── .kiro/                    # Especificações Kiro
│   └── specs/
│       └── straxis-saas/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── backend/                  # Backend Node.js
├── frontend/                 # Frontend React
├── firebase.json             # Configuração Firebase
├── firestore.rules           # Regras de segurança
├── firestore.indexes.json    # Índices Firestore
├── .gitignore
├── package.json              # Scripts raiz
└── README.md                 # Este arquivo
```

---

## 🚀 APIs do Backend

### Autenticação
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Empresas (Admin)
```
GET    /api/empresas
POST   /api/empresas
PUT    /api/empresas/:id
PATCH  /api/empresas/:id/activate
```

### Trabalhos
```
GET    /api/trabalhos
POST   /api/trabalhos
PUT    /api/trabalhos/:id
DELETE /api/trabalhos/:id
```

### Relatórios
```
GET    /api/relatorios/diario
GET    /api/relatorios/semanal
GET    /api/relatorios/mensal
POST   /api/relatorios/export/pdf
POST   /api/relatorios/export/excel
```

### WhatsApp
```
POST   /api/whatsapp/connect
GET    /api/whatsapp/qrcode
GET    /api/whatsapp/status
POST   /api/whatsapp/send
```

### IA
```
POST   /api/ia/query
GET    /api/ia/usage
PUT    /api/ia/config
PUT    /api/ia/prompt
```

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Alucinação da IA | Alto | Validação rigorosa, apenas consultar Firestore, valores em centavos |
| Custos de IA descontrolados | Alto | Limites por empresa, alertas, categorização, rate limiting |
| Instabilidade do WhatsApp | Alto | Monitoramento, fallback operacional, mensagens padrão |
| Vazamento de dados entre empresas | Alto | Firestore Rules rigorosas, testes de segurança |
| Conflitos de sincronização offline | Médio | Timestamps, last-write-wins, conflict resolution |
| Perda de histórico financeiro | Alto | Soft delete (deletedAt), delete real apenas Admin |
| Fraude com valores monetários | Alto | Valores em centavos (integer), validação rigorosa |

---

## 📈 Escalabilidade

### Otimizações

**Firestore:**
- Índices compostos
- Paginação (50 itens/página)
- Cache de dados frequentes
- Batch writes

**Frontend:**
- Code splitting
- Lazy loading
- Virtualização de listas
- Memoização

**Backend:**
- Rate limiting
- Connection pooling
- Compressão gzip

### Limites

**Por Empresa:**
- 1000 trabalhos/mês (soft limit)
- 500 funcionários ativos
- 100 usuários
- 10.000 mensagens WhatsApp/mês

**IA:**
- Limite configurável de custo mensal
- 60 requisições/minuto por empresa
- Timeout de 30 segundos

---

## 📝 Documentação Técnica

### Documentos Disponíveis

1. **requirements.md** - Requisitos completos (EARS + INCOSE)
2. **design.md** - Design técnico detalhado
3. **tasks.md** - Plano de implementação

### Localização

```
.kiro/specs/straxis-saas/
├── requirements.md
├── design.md
└── tasks.md
```

---

## 🧪 Estratégia de Testes

### Abordagem Dual

**Testes Unitários:**
- Exemplos específicos
- Casos de borda
- Condições de erro

**Testes de Propriedade (Property-Based):**
- Propriedades universais
- 100+ iterações por teste
- Validação de invariantes

### Bibliotecas

- **Jest**: Framework de testes
- **fast-check**: Property-based testing
- **React Testing Library**: Testes de componentes
- **Supertest**: Testes de API
- **Firebase Emulator**: Testes com Firestore local

### Cobertura

- Mínimo 80% de cobertura de código
- 69 propriedades de correção definidas
- Testes de segurança (Firestore Rules)
- Testes de integração (IA, WhatsApp)
- Testes E2E (fluxos completos)

### Executar Testes

**Backend:**
```bash
cd backend

# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

**Frontend:**
```bash
cd frontend

# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e
```

**Firebase Emulator:**
```bash
# Iniciar emulador
firebase emulators:start

# Executar testes contra emulador
npm run test:emulator
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação Firebase

**Sintoma:** `Error: Could not load the default credentials`

**Solução:**
```bash
# Verificar se o arquivo .env está configurado
cat backend/.env

# Verificar se a chave privada está correta (deve ter \n)
# Regenerar service account key no Firebase Console se necessário
```

#### 2. WhatsApp não Conecta

**Sintoma:** QR Code não aparece ou timeout

**Solução:**
- Verificar se a porta 3000 está aberta
- Limpar sessões antigas: `rm -rf backend/.wwebjs_auth`
- Verificar logs do backend para erros do Baileys
- Tentar com outro número de telefone

#### 3. IA não Responde

**Sintoma:** Mensagens não são processadas pela IA

**Solução:**
```bash
# Verificar se as chaves de API estão configuradas
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY

# Verificar se a IA está ativada para a empresa no Firestore
# Verificar rate limiting no console
```

#### 4. Erro de CORS

**Sintoma:** `Access-Control-Allow-Origin error`

**Solução:**
```bash
# Verificar FRONTEND_URL no backend/.env
# Deve corresponder à URL do frontend (ex: http://localhost:5173)

# Reiniciar o backend após alterar .env
```

#### 5. Firestore Rules Bloqueando Acesso

**Sintoma:** `Missing or insufficient permissions`

**Solução:**
```bash
# Verificar se as rules foram deployadas
firebase deploy --only firestore:rules

# Testar rules no Firebase Console > Firestore > Rules > Simulator
# Verificar se o usuário tem companyId correto
```

#### 6. PWA não Instala

**Sintoma:** Botão de instalação não aparece

**Solução:**
- Verificar se está usando HTTPS (ou localhost)
- Verificar `manifest.json` está correto
- Verificar service worker está registrado
- Abrir DevTools > Application > Manifest

#### 7. Valores Monetários Incorretos

**Sintoma:** Valores aparecem multiplicados por 100

**Solução:**
- Verificar se a conversão centavos ↔ reais está correta
- Usar `centavosToReais()` ao exibir
- Usar `reaisToCentavos()` ao salvar
- Todos os valores no Firestore devem ser integers (centavos)

#### 8. Rate Limit Atingido

**Sintoma:** `429 Too Many Requests`

**Solução:**
- Aguardar reset do contador (meia-noite para diário)
- Admin pode ajustar limites em `CompanyConfig.rateLimits`
- Verificar logs para identificar uso excessivo

### Logs e Debugging

**Backend:**
```bash
# Logs em tempo real
cd backend
npm run dev

# Logs do Firebase Functions (produção)
firebase functions:log
```

**Frontend:**
```bash
# Console do navegador
# DevTools > Console

# Service Worker
# DevTools > Application > Service Workers

# Firestore
# DevTools > Application > IndexedDB
```

**Firestore:**
```bash
# Visualizar dados
firebase firestore:get /companies/{companyId}

# Exportar dados
firebase firestore:export gs://seu-bucket/backup
```

---

## 🎯 Próximos Passos

```mermaid
flowchart LR
    subgraph Fase1["📦 Fase 1: Setup<br/>(Tasks 1-4)"]
        T1[Setup Projeto]
        T2[Autenticação]
        T3[Firestore Rules]
        T4[Checkpoint]
    end
    
    subgraph Fase2["🏗️ Fase 2: Core<br/>(Tasks 5-13)"]
        T5[Empresas]
        T6[Usuários]
        T7[Logs]
        T9[Funcionários]
        T10[Agendamentos]
        T11[Trabalhos]
        T13[Relatórios]
    end
    
    subgraph Fase3["🔌 Fase 3: Integrações<br/>(Tasks 14-19)"]
        T14[WhatsApp]
        T16[IA OpenAI/Gemini]
        T17[Custos IA]
        T18[IA + WhatsApp]
    end
    
    subgraph Fase4["🎨 Fase 4: UX/PWA<br/>(Tasks 20-24)"]
        T20[Dashboard]
        T21[PWA Offline]
        T22[Dark Mode]
        T23[Serialização]
    end
    
    subgraph Fase5["🔒 Fase 5: Segurança<br/>(Tasks 28-32)"]
        T28[Soft Delete]
        T29[Valores Centavos]
        T30[Rate Limiting]
        T31[Fallback]
        T32[Conflitos Offline]
    end
    
    subgraph Fase6["🚀 Fase 6: Deploy<br/>(Tasks 26-27, 33)"]
        T26[Testes E2E]
        T27[CI/CD Deploy]
        T33[Checkpoint Final]
    end
    
    Fase1 --> Fase2
    Fase2 --> Fase3
    Fase3 --> Fase4
    Fase4 --> Fase5
    Fase5 --> Fase6
    
    style Fase1 fill:#e1f5ff
    style Fase2 fill:#e1ffe1
    style Fase3 fill:#fff4e1
    style Fase4 fill:#ffe1e1
    style Fase5 fill:#ffe1f5
    style Fase6 fill:#f5e1ff
```

---

## 📞 Contato

**Desenvolvedor Principal:**  
- Kaynan Moreira  
- 📱 (62) 99451-0649

**Colaborador:**  
- Renier  
- 📱 (62) 99278-2003

**Data de Criação:** 26/01/2026  
**Versão:** Beta 1.33.7  
**Última Atualização:** 04/02/2026

---

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

---

## 📊 Histórico de Desenvolvimento

### 04/02/2026 - Correções Críticas WhatsApp e Limpeza (Beta 1.33.3 → Beta 1.33.7)
**Desenvolvedor:** Kaynan Moreira  
**Versão:** Beta 1.33.7  
**Mudanças:**
- ✅ **Correção Crítica WhatsApp (Beta 1.33.7)**
  - Corrigido modelo local, agora funcional
  - WhatsApp com reconexão limitada a 3 QR codes para não travar o backend
  - Implementado sistema de timeout e limpeza de sessões antigas
  - Prevenção de travamento quando QR code não é escaneado
- ✅ **Limpeza de Arquivos (Beta 1.33.4)**
  - Removido 86 arquivos `.md` desnecessários
  - Verificado que nenhum arquivo importante foi excluído
  - Mantido apenas documentação essencial (README.md)
  - Projeto mais organizado e limpo
- ✅ **Correção Menu Navegação (Beta 1.33.1)**
  - Corrigido bug: menu não navegava a partir da quarta página
  - Backend atualizado com biblioteca `concurrently`
  - FIX: Dock - clique após arrastar funcionando corretamente
  - Corrigido rotas de autenticação IA

### 03/02/2026 - Provedores de IA e Melhorias Gerais (Beta 1.32.0 → Beta 1.33.3)
**Desenvolvedor:** Kaynan Moreira  
**Versão:** Beta 1.33.3  
**Mudanças:**
- ✅ **Provedores de IA Expandidos (Alpha v1)**
  - Adicionado LM Studio com modelo Qwen2.5-Coder-7B-Instruct
  - Integração com API Hugging Face (acesso a +100 mil modelos)
  - Novos provedores: OpenRouter, Kimi
  - Versões adicionais de GPT e Gemini
  - Chaves de API configuráveis via `.env`
  - Informações atualizadas dos modelos (baseado em pesquisa 2026)
  - Gemini 2.5 Flash: modelo ultra-eficiente otimizado para velocidade e custo
  - Fallbacks de chaves planejados para Alpha v1.1
- ✅ **Configuração de IA Aprimorada (Beta 1.32.0)**
  - Página IA Config com mais opções custo-benefício
  - Removido dados mock da página
  - Backend e Frontend sincronizados para consistência
- ✅ **Correção de Scroll Mobile (Beta 1.31.4)**
  - Dock não bloqueia mais o scroll da página
  - Removido `touch-action: none` do `.dock-container`
  - Mantido `touch-action: pan-y` no `.dock` para gestos horizontais
  - Removido `minHeight: '100vh'` inline do Dashboard
  - Removido `<Dock />` duplicado no DashboardPageCore
  - Simplificado CSS do CoreLayout
  - Ajustado `handleTouchMove` no Dock.tsx
- ✅ **Correção de Rotas WhatsApp (Beta 1.30.9)**
  - Mudança de URL: `/whatsapp2` → `/whatsapp`
  - Removido arquivos duplicados `.css` e `.tsx` do WhatsApp
  - Atualizado menu com nova rota
- ✅ **Correção Backend QR Code (Alpha 0.30.8 → Beta 1.30.6)**
  - Corrigido travamento do backend quando QR code não é escaneado
  - Correção no modal do WhatsApp para rolagem funcionar
  - Removido CSS global que interferia em outras páginas

### 02/02/2026 - Melhorias Gerais
**Desenvolvedor:** Renier  
**Mudanças:**
- ✅ Melhorias gerais no sistema
- ✅ Correções de lógica em todas as abas

### 30/01/2026 - Correções de Lógica
**Desenvolvedor:** Renier  
**Mudanças:**
- ✅ Correções de lógica em todas as abas

### 29/01/2026 - Melhorias em Abas
**Desenvolvedor:** Renier  
**Mudanças:**
- ✅ Melhorias em lógica de abas
- ✅ Melhoria de lógica nas abas

### 28/01/2026 - Straxis CORE Design System (Alpha 2.3.0)
**Desenvolvedor:** Renier  
**Versão:** Alpha 2.3.0  
**Mudanças:**
- ✅ Implementado Straxis CORE Design System
- ✅ Dock arrastável funcional
- ✅ Página Equipe Operacional

### 27/01/2026 - Correções de Rotas e Autenticação (Alpha 0.7.8)
**Desenvolvedor:** Kaynan Moreira  
**Versão:** Alpha 0.7.8  
**Mudanças:**
- ✅ Corrigido duplicação de `/api` nas rotas do frontend
  - Atualizado `trabalho.service.ts`, `agendamento.service.ts`, `funcionario.service.ts`
  - Removido `/api` duplicado que causava erro 404
- ✅ Implementado autenticação real com Firebase
  - Criado `auth.service.ts` com login/logout real
  - Integração com Firebase Authentication
  - Busca dados do usuário no Firestore após login
  - Salva dados reais no localStorage (role, companyId, etc)
- ✅ Atualizado página de login
  - Removido botão "Login Rápido (Dev)"
  - Implementado validação de credenciais
  - Mensagens de erro apropriadas
- ✅ Corrigido componentes de IA
  - `IAConfig` e `PromptEditor` agora usam companyId real do localStorage
  - Não tentam mais buscar empresa "default"
- ✅ Registrado rotas de IA no backend
  - Adicionado `app.use('/api/ia', iaRoutes)` no `app.ts`
- ✅ Criado script para criar usuário admin
  - `backend/create-admin-user.js` para facilitar setup inicial
  - Documentação completa em `SETUP_ADMIN.md`
- ✅ Tratamento de erros em serviços
  - Garantir que sempre retornam arrays válidos
  - Prevenção de crashes por dados undefined
- ✅ Melhorado Gestão de Empresas
  - Modo não-modal para mobile
  - Criado índices para empresas sem empresaId definido (Alpha 0.7.1)
- ✅ Atualização de rotas de API
  - Login real implementado
  - QR Code WhatsApp funcional

> **📝 Nota:** Este histórico é atualizado automaticamente pela IA registrando o desenvolvedor responsável e as mudanças implementadas.

---

**Status do Projeto:** ✅ Beta 1.33.7 - WhatsApp Estável + Limpeza de Código  
**Próximo Passo:** Implementar fallbacks de chaves para Alpha v1.1  
**Desenvolvedor Atual:** Kaynan Moreira e Renier  
**Última Atualização:** 04/02/2026 17:01

**Nota:** Este README é atualizado automaticamente registrando mudanças e releases.
