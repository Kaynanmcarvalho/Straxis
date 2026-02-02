# EMPRESAS - PAINEL DE GOVERNANÇA DA PLATAFORMA
## Design System Premium | Straxis SaaS Platform

**Versão**: Alpha 18.0.0  
**Data**: 02/02/2026  
**Tipo**: MAJOR - Redesign Completo  
**Criticidade**: MÁXIMA - Módulo Administrativo Central

---

## 🎯 CONCEITO VISUAL

A aba /empresas não é um CRUD.  
É o **Centro de Comando da Plataforma**.

### Metáfora Visual
Imagine o painel de controle de um sistema operacional enterprise:
- **macOS System Preferences** (organização e clareza)
- **Stripe Dashboard** (confiança e sofisticação)
- **Linear Settings** (minimalismo funcional)
- **Notion Admin** (hierarquia impecável)

### Princípios de Design
1. **Autoridade Silenciosa**: Poder sem ostentação
2. **Organização Explícita**: Nada implícito, tudo claro
3. **Profundidade Elegante**: Camadas visuais sutis
4. **Confiança Imediata**: Parece auditável por enterprise

---

## 📐 ESTRUTURA COMPLETA DA TELA

### Layout Geral
```
┌─────────────────────────────────────────────────────────┐
│  [Topo Editorial]                                       │
│  Empresas                                               │
│  Gestão administrativa da plataforma          [Admin]  │
│                                        [Criar Empresa]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Alerta de Governança] (se houver usuários órfãos)   │
│  ⚠️  3 usuários aguardando vinculação                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Seção: Usuários Não Vinculados]                     │
│  (cards individuais, elegantes)                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Seção: Empresas Ativas]                             │
│  (grid de cards premium)                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏛️ 1. TOPO EDITORIAL (Header Premium)

### Estrutura Visual

```
┌─────────────────────────────────────────────────────────┐
│  Empresas                                    [Admin]    │
│  Gestão administrativa da plataforma                    │
│                                                         │
│                                    [+ Criar Empresa]    │
└─────────────────────────────────────────────────────────┘
```

### Especificações

**Título Principal: "Empresas"**
- Font: -apple-system, 600
- Size: 32px
- Color: #000000
- Letter-spacing: -0.5px
- Margin-bottom: 4px

**Subtítulo: "Gestão administrativa da plataforma"**
- Font: -apple-system, 400
- Size: 15px
- Color: #666666
- Letter-spacing: 0px

**Badge "Admin"**
- Background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%)
- Color: #FFFFFF
- Padding: 4px 12px
- Border-radius: 6px
- Font-size: 12px
- Font-weight: 600
- Position: absolute top-right
- Box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2)

**Botão "Criar Empresa"**
- Background: #000000
- Color: #FFFFFF
- Padding: 12px 24px
- Border-radius: 10px
- Font-size: 15px
- Font-weight: 500
- Transition: all 0.2s ease
- Hover: transform: translateY(-1px), box-shadow: 0 4px 12px rgba(0,0,0,0.15)
- Active: transform: translateY(0)

### Comportamento
- Badge "Admin" pulsa suavemente (1.5s loop)
- Botão tem micro-feedback ao hover
- Espaçamento generoso (padding: 32px 0)

---

## ⚠️ 2. ALERTA DE GOVERNANÇA (Usuários Órfãos)

### Conceito
Este não é um erro comum. É uma **inconsistência de governança**.

### Estrutura Visual
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Atenção Necessária                                 │
│                                                         │
│  3 usuários ainda não estão vinculados a nenhuma       │
│  empresa. Isso pode gerar problemas de acesso e        │
│  segurança.                                            │
│                                                         │
│                              [Revisar Agora]           │
└─────────────────────────────────────────────────────────┘
```

### Especificações

**Container**
- Background: linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%)
- Border: 1px solid rgba(255, 152, 0, 0.2)
- Border-radius: 16px
- Padding: 24px 28px
- Margin: 24px 0
- Box-shadow: 
  - 0 2px 8px rgba(255, 152, 0, 0.08)
  - inset 0 1px 0 rgba(255, 255, 255, 0.5)

**Ícone de Alerta**
- Size: 20px
- Color: #FF9800
- Stroke-width: 2.5px
- Vertical-align: middle

**Título "Atenção Necessária"**
- Font-size: 17px
- Font-weight: 600
- Color: #000000
- Margin-bottom: 8px

**Texto Descritivo**
- Font-size: 14px
- Font-weight: 400
- Color: #333333
- Line-height: 1.6
- Max-width: 600px

**Contador de Usuários**
- Font-weight: 700
- Color: #FF9800

**Botão "Revisar Agora"**
- Background: #FF9800
- Color: #FFFFFF
- Padding: 10px 20px
- Border-radius: 8px
- Font-size: 14px
- Font-weight: 600
- Float: right
- Hover: background: #F57C00

### Estados
- **Visível**: Quando há usuários órfãos
- **Oculto**: Quando todos usuários estão vinculados
- **Animação de entrada**: Slide down + fade in (300ms)

---

## 👤 3. LISTAGEM DE USUÁRIOS ÓRFÃOS

### Conceito
Cada usuário é uma **entidade que precisa de atenção administrativa**.

### Card Individual
```
┌─────────────────────────────────────────────────────────┐
│  João Silva                                    [user]   │
│  joao.silva@empresa.com                                 │
│                                                         │
│  Sem empresa vinculada                                  │
│                                                         │
│                              [Atribuir Empresa]         │
└─────────────────────────────────────────────────────────┘
```

### Especificações

**Container do Card**
- Background: #FFFFFF
- Border: 1px solid rgba(0, 0, 0, 0.06)
- Border-radius: 14px
- Padding: 20px 24px
- Margin-bottom: 12px
- Box-shadow: 
  - 0 1px 3px rgba(0, 0, 0, 0.04)
  - 0 4px 12px rgba(0, 0, 0, 0.02)
- Transition: all 0.2s ease
- Hover: 
  - transform: translateY(-2px)
  - box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08)

**Nome do Usuário**
- Font-size: 16px
- Font-weight: 600
- Color: #000000
- Margin-bottom: 4px

**Email**
- Font-size: 14px
- Font-weight: 400
- Color: #666666
- Margin-bottom: 12px

**Badge de Papel (user/admin)**
- Background: #F5F5F5
- Color: #666666
- Padding: 3px 10px
- Border-radius: 6px
- Font-size: 11px
- Font-weight: 600
- Text-transform: uppercase
- Letter-spacing: 0.5px
- Position: absolute top-right

**Status "Sem empresa vinculada"**
- Font-size: 13px
- Font-weight: 500
- Color: #FF9800
- Background: rgba(255, 152, 0, 0.1)
- Padding: 6px 12px
- Border-radius: 6px
- Display: inline-block
- Margin-bottom: 16px

**Botão "Atribuir Empresa"**
- Background: #007AFF
- Color: #FFFFFF
- Padding: 10px 18px
- Border-radius: 8px
- Font-size: 14px
- Font-weight: 500
- Float: right
- Hover: background: #0051D5

### Comportamento
- Ao clicar em "Atribuir Empresa", abre modal elegante
- Modal mostra lista de empresas disponíveis
- Seleção tem feedback visual imediato
- Confirmação com animação suave

---

## 🏢 4. GESTÃO DE EMPRESAS (Núcleo da Aba)

### Conceito
Cada empresa é uma **entidade viva do ecossistema**.

### Grid de Empresas
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Empresa Alpha   │  │  Empresa Beta    │  │  Empresa Gamma   │
│  12 usuários     │  │  8 usuários      │  │  5 usuários      │
│  Ativa           │  │  Ativa           │  │  Suspensa        │
│  Desde 15/01/26  │  │  Desde 20/01/26  │  │  Desde 25/01/26  │
│                  │  │                  │  │                  │
│  [Gerenciar]     │  │  [Gerenciar]     │  │  [Reativar]      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Especificações do Card de Empresa

**Container**
- Background: #FFFFFF
- Border: 1px solid rgba(0, 0, 0, 0.08)
- Border-radius: 16px
- Padding: 24px
- Width: calc(33.333% - 16px)
- Min-width: 280px
- Box-shadow:
  - 0 2px 8px rgba(0, 0, 0, 0.04)
  - 0 8px 24px rgba(0, 0, 0, 0.03)
- Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover:
  - transform: translateY(-4px)
  - box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12)

**Nome da Empresa**
- Font-size: 18px
- Font-weight: 600
- Color: #000000
- Margin-bottom: 16px
- Letter-spacing: -0.3px

**Contador de Usuários**
- Font-size: 14px
- Font-weight: 500
- Color: #666666
- Margin-bottom: 8px
- Display: flex
- Align-items: center
- Gap: 6px
- Icon: Users (Lucide), size 16px

**Badge de Status**
- **Ativa**:
  - Background: rgba(52, 199, 89, 0.1)
  - Color: #34C759
  - Border: 1px solid rgba(52, 199, 89, 0.2)
- **Suspensa**:
  - Background: rgba(255, 59, 48, 0.1)
  - Color: #FF3B30
  - Border: 1px solid rgba(255, 59, 48, 0.2)
- Padding: 4px 10px
- Border-radius: 6px
- Font-size: 12px
- Font-weight: 600
- Display: inline-block
- Margin-bottom: 12px

**Data de Criação**
- Font-size: 13px
- Font-weight: 400
- Color: #999999
- Margin-bottom: 20px
- Display: flex
- Align-items: center
- Gap: 6px
- Icon: Calendar (Lucide), size 14px

**Botão "Gerenciar"**
- Background: #F5F5F5
- Color: #000000
- Padding: 10px 20px
- Border-radius: 8px
- Font-size: 14px
- Font-weight: 500
- Width: 100%
- Transition: all 0.2s ease
- Hover:
  - Background: #E8E8E8
  - transform: translateY(-1px)

**Botão "Reativar" (para suspensas)**
- Background: #34C759
- Color: #FFFFFF
- Padding: 10px 20px
- Border-radius: 8px
- Font-size: 14px
- Font-weight: 600
- Width: 100%

### Grid Layout
- Display: grid
- Grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
- Gap: 24px
- Padding: 24px 0

---

## ⚙️ 5. AÇÕES ADMINISTRATIVAS (Modal de Gerenciamento)

### Conceito
Ações críticas exigem **interface dedicada e segura**.

### Modal de Gerenciamento
```
┌─────────────────────────────────────────────────────────┐
│  Empresa Alpha                                    [X]   │
│  Gerenciamento Administrativo                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Informações Gerais]                                  │
│  Nome: Empresa Alpha                                    │
│  CNPJ: 12.345.678/0001-90                              │
│  Status: Ativa                                          │
│  Criada em: 15/01/2026                                  │
│                                                         │
│  [Usuários Vinculados] (12)                            │
│  • João Silva (owner)                                   │
│  • Maria Santos (user)                                  │
│  • Pedro Costa (user)                                   │
│  ...                                                    │
│                                                         │
│  [Ações Administrativas]                               │
│  [Editar Informações]  [Ver Todos Usuários]           │
│                                                         │
│  [Zona de Perigo]                                      │
│  [Suspender Empresa]   [Excluir Empresa]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Especificações

**Modal Container**
- Background: #FFFFFF
- Border-radius: 20px
- Max-width: 600px
- Padding: 32px
- Box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)
- Backdrop: rgba(0, 0, 0, 0.4) blur(8px)

**Seções**
- Separadas por linha sutil (1px, rgba(0,0,0,0.06))
- Padding entre seções: 24px
- Títulos de seção: 15px, 600, #000000

**Lista de Usuários**
- Max-height: 200px
- Overflow-y: auto
- Scrollbar customizada (thin, suave)
- Cada usuário: padding 8px, hover: background #F5F5F5

**Zona de Perigo**
- Background: rgba(255, 59, 48, 0.05)
- Border: 1px solid rgba(255, 59, 48, 0.2)
- Border-radius: 12px
- Padding: 20px
- Margin-top: 24px

**Botões de Ação Perigosa**
- Background: transparent
- Color: #FF3B30
- Border: 1px solid #FF3B30
- Padding: 10px 18px
- Border-radius: 8px
- Font-size: 14px
- Font-weight: 600
- Hover: background: rgba(255, 59, 48, 0.1)

### Fluxo de Confirmação
1. Clicar em ação perigosa
2. Modal de confirmação aparece
3. Texto claro sobre consequências
4. Botão "Confirmar" só ativa após 2 segundos
5. Feedback visual após ação

---

## 🔒 6. ESTRATÉGIA DE SEGURANÇA VISUAL

### Hierarquia de Permissões

**Admin da Plataforma**
- Badge roxo gradiente
- Acesso total visível
- Ações críticas disponíveis

**Owner da Empresa**
- Badge azul
- Acesso limitado à própria empresa
- Não vê outras empresas

**Usuário Comum**
- Sem acesso à aba /empresas
- Redirecionado se tentar acessar

### Indicadores Visuais de Segurança

**Ações Reversíveis**
- Cor neutra (cinza/preto)
- Ícone de edição
- Sem confirmação extra

**Ações Irreversíveis**
- Cor de alerta (vermelho)
- Ícone de aviso
- Confirmação obrigatória
- Delay de 2 segundos

**Ações de Governança**
- Cor de atenção (laranja)
- Ícone de shield
- Confirmação com texto

### Auditoria Visual
- Todas ações críticas mostram:
  - Quem fez
  - Quando fez
  - O que mudou
- Log visível no card da empresa

---

## 📊 7. ESTADOS DA INTERFACE

### Estado Vazio (Sem Empresas)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Ícone Building]                     │
│                                                         │
│              Nenhuma empresa cadastrada                 │
│                                                         │
│  Crie a primeira empresa para começar a organizar      │
│  usuários e gerenciar a plataforma.                    │
│                                                         │
│                  [Criar Primeira Empresa]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Especificações**
- Centralizado vertical e horizontalmente
- Ícone: 64px, color: #CCCCCC
- Título: 20px, 600, #000000
- Descrição: 15px, 400, #666666
- Botão: destaque, 007AFF

### Estado de Alerta (Usuários Órfãos)
- Alerta de governança visível no topo
- Lista de usuários órfãos expandida
- Empresas normais abaixo

### Estado Normal (Tudo OK)
- Sem alertas
- Grid de empresas limpo
- Indicador sutil: "Plataforma organizada"

### Estado de Carregamento
- Skeleton screens elegantes
- Animação suave de pulse
- Sem spinners genéricos

### Estado de Erro
- Card de erro elegante
- Mensagem clara
- Ação de retry visível

---

## 🎨 8. JUSTIFICATIVA PREMIUM

### Por que isso NÃO é um CRUD comum?

**1. Linguagem Visual Autoritária**
- Fundo branco premium (não cinza genérico)
- Sombras em camadas (profundidade real)
- Tipografia system-like (não web fonts)
- Espaçamento generoso (respira)

**2. Hierarquia de Informação Impecável**
- Topo editorial (não header comum)
- Alertas de governança (não erros)
- Cards flutuantes (não linhas de tabela)
- Ações contextuais (não botões genéricos)

**3. Microinterações Sofisticadas**
- Hover states suaves
- Transições com cubic-bezier
- Feedback visual imediato
- Animações funcionais (não decorativas)

**4. Segurança Visual Explícita**
- Zona de perigo clara
- Confirmações obrigatórias
- Delays em ações críticas
- Auditoria visível

**5. Consistência com Ecossistema**
- Mesmo DNA visual do resto do Straxis
- Componentes Core reutilizados
- Paleta de cores consistente
- Comportamentos previsíveis

**6. Parece Auditável**
- Cada ação tem rastro
- Permissões explícitas
- Estados claros
- Nada implícito

### Comparação Visual

**CRUD Comum**:
- Tabela dura
- Botões coloridos
- Campos largos
- Layout genérico
- Parece React Admin

**Straxis /empresas**:
- Cards flutuantes
- Ações contextuais
- Espaçamento elegante
- Layout premium
- Parece macOS System Preferences

---

## 🚀 PRÓXIMOS PASSOS

1. Criar `EmpresasPageCore.tsx`
2. Criar `EmpresasPageCore.css`
3. Implementar componentes:
   - `GovernanceAlert.tsx`
   - `OrphanUserCard.tsx`
   - `CompanyCard.tsx`
   - `CompanyManagementModal.tsx`
4. Integrar com backend
5. Adicionar testes
6. Documentar fluxos

---

## ✅ CHECKLIST DE QUALIDADE

- [ ] Parece painel de sistema operacional?
- [ ] Transmite autoridade e confiança?
- [ ] Hierarquia de informação clara?
- [ ] Ações perigosas bem sinalizadas?
- [ ] Microinterações suaves?
- [ ] Consistente com resto do Straxis?
- [ ] Mobile-first (mesmo sendo admin)?
- [ ] Acessível (WCAG 2.1 AA)?
- [ ] Performance otimizada?
- [ ] Parece auditável por enterprise?

Se todas as respostas forem SIM, o design está aprovado.

---

**Este documento define o padrão de qualidade para módulos administrativos do Straxis.**

**Se outros módulos não atingirem esse nível, devem ser redesenhados.**
