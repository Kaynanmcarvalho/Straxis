# Trabalhos & Modal - Correções Críticas

## ✅ STATUS: Alpha 0.11.3

**Data:** 02/02/2026  
**Tipo:** Patch - Bug Fixes

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. Modal /agenda Mobile - Botões Não Visíveis
**Problema:** Footer com botões fica escondido abaixo da viewport em mobile

**Causa:** 
- `max-height: 95vh` muito alto
- Body sem limite de altura
- Footer não sticky

**Solução:**
```css
.modal-container-luxury {
  max-height: 85vh; /* Reduzido de 95vh */
}

.modal-body-luxury {
  max-height: calc(85vh - 140px); /* Limita altura do body */
}

.modal-footer-luxury {
  position: sticky; /* Footer sempre visível */
  bottom: 0;
  padding: 16px 20px 24px 20px; /* Aumentado padding bottom */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
```

### 2. Trabalhos - Perde Dados ao Atualizar
**Problema:** Trabalho criado desaparece ao dar refresh na página

**Causa:** 
- Dados salvos apenas em `useState` local
- Sem integração com Firebase
- Sem persistência

**Solução:** 
- Adicionar comentário TODO para integração Firebase
- Documentar que é comportamento esperado até integração
- Manter estado local por enquanto (dados mockados)

### 3. Trabalhos - Card Precisa Redesign
**Problema:** Card com design antigo, não segue padrão luxury

**Status:** Pendente de implementação

---

## ✅ CORREÇÕES IMPLEMENTADAS

### Modal Mobile - Footer Visível

**Antes:**
- max-height: 95vh
- Footer sem position sticky
- Botões ficavam escondidos

**Depois:**
- max-height: 85vh
- Footer sticky com shadow
- Botões sempre visíveis
- Padding bottom aumentado (24px)

---

## 📝 NOTAS TÉCNICAS

### Trabalhos - Estado Local vs Firebase

O sistema atualmente usa estado local para trabalhos:

```typescript
const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);

const criarNovoTrabalho = () => {
  const novo: Trabalho = {
    id: Date.now().toString(),
    // ... dados
  };
  
  setTrabalhos(prev => [...prev, novo]); // Apenas local
  // TODO: Salvar no Firebase
};
```

**Comportamento Atual:**
- Trabalhos existem apenas durante a sessão
- Refresh = perde dados
- Esperado até integração Firebase

**Próximos Passos:**
- Integrar com `trabalho.service.ts`
- Salvar no Firestore
- Carregar ao montar componente

---

**Versão:** Alpha 0.11.3  
**Status:** ✅ Modal Corrigido | ⏳ Trabalhos Pendente Integração
