# Guia do Design System - Straxis SaaS

**Versão:** 1.0  
**Data:** 26/01/2026

---

## Visão Geral

Este documento descreve o Design System do Straxis SaaS, incluindo componentes, tokens de design, ícones e padrões de uso.

---

## Instalação

As seguintes bibliotecas foram instaladas:

```bash
# Ícones
npm install lucide-react

# Gráficos
npm install recharts

# Componentes base
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tooltip @radix-ui/react-slot

# Animações
npm install framer-motion

# Notificações
npm install react-hot-toast

# Formulários
npm install react-hook-form zod @hookform/resolvers

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
```

---

## Design Tokens

### Cores

#### Paleta Light Theme

```typescript
primary: {
  500: '#2196f3',  // Azul principal
}

success: {
  500: '#4caf50',  // Verde
}

error: {
  500: '#f44336',  // Vermelho
}

warning: {
  500: '#ff9800',  // Laranja
}

info: {
  500: '#03a9f4',  // Azul claro
}

neutral: {
  50: '#fafafa',
  100: '#f5f5f5',
  // ... até 900
}
```

#### Paleta Dark Theme

As cores são ajustadas automaticamente para melhor contraste no modo escuro.

### Tipografia

```typescript
fontFamily: {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  mono: 'JetBrains Mono, Fira Code, monospace',
}

fontSize: {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  // ... até 5xl
}
```

### Espaçamento

Escala baseada em múltiplos de 4px:

```typescript
spacing: {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  // ...
}
```

### Sombras

```typescript
shadows: {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  // ...
}
```

### Border Radius

```typescript
borderRadius: {
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  full: '9999px',
}
```

---

## Componentes

### Button

Botão com múltiplas variantes e tamanhos.

**Variantes:**
- `primary` - Botão principal (azul)
- `secondary` - Botão secundário (cinza)
- `outline` - Botão com borda
- `ghost` - Botão transparente
- `danger` - Botão de ação destrutiva (vermelho)

**Tamanhos:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande

**Exemplo:**

```tsx
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

<Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
  Novo Trabalho
</Button>

<Button variant="danger" loading={isLoading}>
  Deletar
</Button>
```

### Card

Container com sombra e borda arredondada.

**Componentes relacionados:**
- `Card` - Container principal
- `CardHeader` - Cabeçalho
- `CardTitle` - Título
- `CardDescription` - Descrição
- `CardContent` - Conteúdo
- `CardFooter` - Rodapé

**Exemplo:**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { TrendingUp } from 'lucide-react';

<Card hover>
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary-100 rounded-lg">
        <TrendingUp className="w-6 h-6 text-primary-600" />
      </div>
      <CardTitle>Faturamento</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">R$ 125.450,00</p>
  </CardContent>
</Card>
```

### Badge

Indicador de status ou categoria.

**Variantes:**
- `success` - Verde
- `error` - Vermelho
- `warning` - Laranja
- `info` - Azul
- `neutral` - Cinza

**Exemplo:**

```tsx
import { Badge } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

<Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
  Confirmado
</Badge>
```

### Input

Campo de entrada com validação visual.

**Exemplo:**

```tsx
import { Input } from '@/components/ui';
import { Mail } from 'lucide-react';

<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  icon={<Mail className="w-5 h-5" />}
  error={errors.email?.message}
  helperText="Digite seu email corporativo"
/>
```

### Modal

Diálogo modal com overlay.

**Exemplo:**

```tsx
import { Modal, ModalFooter, Button } from '@/components/ui';

<Modal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Confirmar exclusão"
  description="Esta ação não pode ser desfeita."
  size="md"
>
  <p>Tem certeza que deseja excluir este trabalho?</p>
  
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Excluir
    </Button>
  </ModalFooter>
</Modal>
```

### Tooltip

Dica contextual ao passar o mouse.

**Exemplo:**

```tsx
import { Tooltip, TooltipProvider, IconButton } from '@/components/ui';
import { Info } from 'lucide-react';

<TooltipProvider>
  <Tooltip content="Mais informações sobre este campo">
    <IconButton icon={Info} variant="ghost" />
  </Tooltip>
</TooltipProvider>
```

### Dropdown

Menu dropdown com itens clicáveis.

**Exemplo:**

```tsx
import { Dropdown, DropdownItem, DropdownSeparator, Button } from '@/components/ui';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

<Dropdown
  trigger={
    <Button variant="ghost" icon={<MoreVertical className="w-4 h-4" />}>
      Ações
    </Button>
  }
>
  <DropdownItem icon={<Edit className="w-4 h-4" />} onSelect={handleEdit}>
    Editar
  </DropdownItem>
  <DropdownSeparator />
  <DropdownItem icon={<Trash2 className="w-4 h-4" />} onSelect={handleDelete}>
    Excluir
  </DropdownItem>
</Dropdown>
```

---

## Sistema de Ícones

### Importação

```tsx
import { moduleIcons, actionIcons, statusIcons } from '@/components/ui/icons';
import { Icon } from '@/components/ui';
```

### Ícones por Módulo

```tsx
// Navegação principal
moduleIcons.dashboard      // LayoutDashboard
moduleIcons.trabalhos      // Package
moduleIcons.agendamentos   // Calendar
moduleIcons.funcionarios   // Users
moduleIcons.relatorios     // FileText
moduleIcons.whatsapp       // MessageSquare
moduleIcons.ia             // Brain
```

### Ícones de Ação

```tsx
actionIcons.criar          // Plus
actionIcons.editar         // Edit
actionIcons.deletar        // Trash2
actionIcons.visualizar     // Eye
actionIcons.salvar         // Save
actionIcons.buscar         // Search
actionIcons.filtrar        // Filter
```

### Ícones de Status

```tsx
statusIcons.sucesso        // CheckCircle
statusIcons.erro           // XCircle
statusIcons.aviso          // AlertCircle
statusIcons.info           // Info
statusIcons.loading        // Loader2
```

### Uso com Icon Component

```tsx
import { Icon } from '@/components/ui';
import { moduleIcons } from '@/components/ui/icons';

<Icon icon={moduleIcons.dashboard} size="lg" className="text-primary-500" />
```

### IconButton

```tsx
import { IconButton } from '@/components/ui';
import { Edit } from 'lucide-react';

<IconButton
  icon={Edit}
  size="md"
  variant="ghost"
  label="Editar trabalho"
  onClick={handleEdit}
/>
```

---

## Padrões de Uso

### Cards com Ícones

```tsx
<Card hover>
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
        <Icon icon={moduleIcons.faturamento} size="lg" className="text-primary-600" />
      </div>
      <div>
        <CardTitle>Faturamento</CardTitle>
        <CardDescription>Mês atual</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">R$ 125.450,00</p>
    <p className="text-sm text-text-secondary flex items-center gap-1 mt-2">
      <Icon icon={financeIcons.positivo} size="sm" className="text-success-500" />
      <span className="text-success-500">+12.5%</span> vs mês anterior
    </p>
  </CardContent>
</Card>
```

### Botões com Ícones

```tsx
// Botão primário com ícone
<Button variant="primary" icon={<Plus className="w-4 h-4" />}>
  Novo Trabalho
</Button>

// Botão de ação
<Button variant="outline" icon={<Download className="w-4 h-4" />}>
  Exportar PDF
</Button>

// Botão de perigo
<Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
  Excluir
</Button>
```

### Badges de Status

```tsx
// Status de agendamento
<Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
  Confirmado
</Badge>

<Badge variant="warning" icon={<Clock className="w-3 h-3" />}>
  Pendente
</Badge>

<Badge variant="error" icon={<XCircle className="w-3 h-3" />}>
  Cancelado
</Badge>
```

### Formulários

```tsx
<form onSubmit={handleSubmit}>
  <Input
    label="Nome do Funcionário"
    placeholder="Digite o nome"
    icon={<User className="w-5 h-5" />}
    error={errors.nome?.message}
  />
  
  <Input
    label="Telefone"
    type="tel"
    placeholder="(00) 00000-0000"
    icon={<Phone className="w-5 h-5" />}
  />
  
  <div className="flex gap-3 mt-6">
    <Button type="button" variant="ghost" onClick={onCancel}>
      Cancelar
    </Button>
    <Button type="submit" variant="primary" loading={isSubmitting}>
      Salvar
    </Button>
  </div>
</form>
```

---

## Dark Mode

O sistema suporta dark mode automático. Todas as cores são ajustadas via CSS variables.

### Ativação

```tsx
import { applyTheme, darkTheme, lightTheme } from '@/styles/theme.config';

// Aplicar tema escuro
applyTheme(darkTheme);

// Aplicar tema claro
applyTheme(lightTheme);
```

### Classes Tailwind

Use as classes do Tailwind com prefixo `dark:` para estilos específicos do dark mode:

```tsx
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
  Conteúdo
</div>
```

---

## Responsividade

O sistema é mobile-first. Use os breakpoints do Tailwind:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards responsivos */}
</div>
```

**Breakpoints:**
- `xs`: 320px (mobile small)
- `sm`: 640px (mobile large)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (desktop large)
- `2xl`: 1536px (desktop xlarge)

---

## Animações

Use Framer Motion para animações:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <Card>...</Card>
</motion.div>
```

---

## Notificações

Use React Hot Toast para notificações:

```tsx
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

// Sucesso
toast.success('Trabalho criado com sucesso!', {
  icon: <CheckCircle className="w-5 h-5" />,
});

// Erro
toast.error('Erro ao salvar trabalho', {
  icon: <XCircle className="w-5 h-5" />,
});
```

---

## Boas Práticas

1. **Sempre use os componentes do Design System** ao invés de criar novos
2. **Use ícones contextuais** para melhorar a UX
3. **Mantenha consistência** nos tamanhos e espaçamentos
4. **Teste em dark mode** todas as interfaces
5. **Garanta responsividade** em todos os breakpoints
6. **Use animações sutis** (200-300ms) para não distrair
7. **Forneça feedback visual** para todas as ações do usuário
8. **Use tooltips** para explicar ícones e ações não óbvias

---

**Documento criado em:** 26/01/2026  
**Versão:** 1.0
