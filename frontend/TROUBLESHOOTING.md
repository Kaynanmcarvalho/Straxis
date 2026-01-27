# Troubleshooting - Straxis Frontend

## CSS não está sendo aplicado

### Problema
As classes do Tailwind CSS não estão sendo aplicadas nas páginas.

### Solução

**✅ CORRIGIDO!** O problema era a sintaxe incorreta do Tailwind CSS v4.

A sintaxe correta para Tailwind v4 é:
```css
@import "tailwindcss";
```

O arquivo `frontend/src/styles/tailwind.css` foi atualizado com a sintaxe correta.

**Próximos passos:**

1. **Parar o servidor de desenvolvimento:**
   ```bash
   # Pressione Ctrl+C no terminal onde o servidor está rodando
   ```

2. **Limpar o cache do Vite:**
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   rm -rf dist
   ```

3. **Iniciar o servidor novamente:**
   ```bash
   npm run dev
   ```

4. **Limpar o cache do navegador:**
   - Chrome/Edge: Ctrl+Shift+R (ou Ctrl+F5)
   - Firefox: Ctrl+Shift+R
   - Safari: Cmd+Option+R

### Verificações

- ✅ Tailwind CSS v4 está instalado (`tailwindcss@^4.1.18`)
- ✅ PostCSS está configurado com `@tailwindcss/postcss`
- ✅ `tailwind.css` usa a sintaxe correta do v4
- ✅ `global.css` importa o `tailwind.css`
- ✅ `index.tsx` importa o `global.css`

## Navegação não funciona

### Problema
Ao clicar nos itens da sidebar, a página não muda.

### Solução
✅ **Já corrigido!** A sidebar agora usa `useNavigate()` do React Router ao invés de links `<a href>`.

## Conteúdo abaixo da sidebar

### Problema
O conteúdo principal aparece atrás da sidebar.

### Solução
✅ **Já corrigido!** O `MainLayout` agora adiciona `margin-left` ao conteúdo:
- Desktop: `280px` (sidebar expandida) ou `80px` (sidebar colapsada)
- Mobile: `0px` (sidebar em overlay)

## Dark Mode não funciona

### Verificações
1. Verifique se o `ThemeContext` está envolvendo o App
2. Verifique se o atributo `data-theme` está sendo aplicado no `<html>`
3. Limpe o localStorage se necessário:
   ```javascript
   localStorage.removeItem('straxis-theme');
   ```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Testes
npm run test

# Lint
npm run lint
```

## Estrutura de Arquivos CSS

```
frontend/src/styles/
├── tailwind.css      # Configuração do Tailwind v4
├── global.css        # Estilos globais + import do Tailwind
├── theme.ts          # Tema TypeScript (cores, breakpoints)
└── theme.config.ts   # Configuração adicional do tema
```

## Variáveis CSS Disponíveis

### Cores
- `--color-primary-{50-900}`
- `--color-success-{50-900}`
- `--color-error-{50-900}`
- `--color-warning-{50-900}`
- `--color-info-{50-900}`
- `--color-neutral-{50-900}`

### Background
- `--color-background-default`
- `--color-background-paper`
- `--color-background-elevated`

### Texto
- `--color-text-primary`
- `--color-text-secondary`
- `--color-text-disabled`

### Sombras
- `--shadow-sm`, `--shadow-base`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`

### Border Radius
- `--radius-sm`, `--radius-base`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-full`

## Classes Tailwind Personalizadas

```tsx
// Cores
className="bg-primary-500 text-white"
className="bg-success-100 text-success-700"

// Sombras
className="shadow-md hover:shadow-lg"

// Border Radius
className="rounded-md"

// Responsividade
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```
