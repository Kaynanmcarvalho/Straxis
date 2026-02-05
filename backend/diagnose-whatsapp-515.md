# Diagnóstico Erro 515 - WhatsApp

## 🚨 ATUALIZAÇÃO v1.30.9 - Melhorias Anti-Detecção Implementadas

### ✅ O que foi melhorado:
1. **Browser fingerprint realista** - Rotação entre Chrome/Edge/Firefox com versões atualizadas
2. **Comportamento humano** - Delays aleatórios (2-5s) e simulação de digitação
3. **Configurações anti-spam** - Retry conservador e timeouts realistas
4. **Presença realista** - Não marca online imediatamente

### 📖 Leia o guia completo:
**`WHATSAPP_ANTI_BAN_GUIDE.md`** - Guia completo de boas práticas

---

## ❓ Perguntas para Diagnóstico

### 1. Número já conectado?
- [ ] O número `556294510649` está conectado no WhatsApp Web?
- [ ] O número está conectado em outro aplicativo/sistema?
- [ ] Você desconectou todas as sessões antigas no celular?

**Como verificar:**
1. Abra WhatsApp no celular
2. Vá em: Configurações → Aparelhos conectados
3. Desconecte TODOS os dispositivos listados

### 2. Tentativas recentes?
- [ ] Você tentou conectar várias vezes seguidas?
- [ ] Houve múltiplas tentativas nas últimas horas?

**Solução:** Aguarde 1-2 horas antes de tentar novamente

### 3. Tipo de conta
- [ ] É WhatsApp Business?
- [ ] É WhatsApp pessoal?
- [ ] É número novo (menos de 30 dias)?

**Nota:** WhatsApp Business tem regras mais rígidas

### 4. Histórico de uso
- [ ] Já usou este número com Baileys antes?
- [ ] Já recebeu avisos do WhatsApp sobre spam?
- [ ] Enviou muitas mensagens recentemente?

## 🔧 Soluções por Ordem de Prioridade

### Solução 1: Desconectar tudo e limpar (RECOMENDADO)
```bash
# 1. No celular: Desconectar TODOS os dispositivos
# 2. No servidor:
cd backend
node clean-whatsapp-sessions-force.js

# 3. Aguardar 5 minutos
# 4. Tentar conectar novamente
```

### Solução 2: Aguardar cooldown
- Aguarde 1-2 horas sem tentar conectar
- WhatsApp pode ter aplicado rate limit temporário

### Solução 3: Usar número diferente
- Se possível, teste com outro número
- Verifique se o problema é específico deste número

### Solução 4: Verificar banimento
1. Envie uma mensagem normal pelo celular
2. Se não conseguir, o número pode estar banido
3. Entre em contato com suporte do WhatsApp

## 📊 Códigos de Erro WhatsApp

| Código | Significado | Solução |
|--------|-------------|---------|
| 401 | Não autenticado | Escanear QR novamente |
| 403 | Proibido | Número banido permanentemente |
| 408 | Timeout | Tentar novamente |
| 428 | Precondition Required | Atualizar Baileys |
| **515** | **Conexão rejeitada** | **Desconectar outros dispositivos** |

## 🚨 Erro 515 Específico

**Causa mais comum:** Número já conectado em outro lugar

**O que aconteceu no seu caso:**
1. ✅ QR code gerado
2. ✅ Você escaneou
3. ✅ Pareamento aceito (`pairing configured successfully`)
4. ❌ WhatsApp rejeitou a conexão (erro 515)

**Isso significa:** O WhatsApp aceitou o pareamento, mas detectou que:
- O número já está conectado em outro lugar, OU
- Há uma sessão ativa conflitante, OU
- O número está temporariamente bloqueado para novas conexões

## ✅ Próximos Passos

1. **Desconectar TUDO no celular** (Aparelhos conectados)
2. **Limpar sessões no servidor** (`node clean-whatsapp-sessions-force.js`)
3. **Aguardar 5-10 minutos**
4. **Tentar conectar novamente**

Se o erro persistir após estes passos:
- Aguarde 1-2 horas (cooldown do WhatsApp)
- Teste com outro número para verificar se é problema do número específico
- Considere usar WhatsApp Business API oficial (pago, mas mais estável)

## 📚 Referências

- [Baileys Error Codes](https://github.com/WhiskeySockets/Baileys/issues)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- Erro 515 é específico do WhatsApp e não está documentado oficialmente
