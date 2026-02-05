# 🛡️ Guia Anti-Banimento WhatsApp - Straxis SaaS

## ⚠️ Problema Identificado
Seu número está sendo detectado como spam/bot pelo WhatsApp, resultando em erro 515 ou bloqueio temporário.

## ✅ Melhorias Implementadas (v1.30.9)

### 1. Browser Fingerprint Realista
```typescript
// ANTES (SUSPEITO)
browser: ['Straxis SaaS', 'Chrome', '120.0.0']

// DEPOIS (REALISTA)
browser: ['Chrome (Windows)', 'Windows', '131.0.0.0']
// Rotaciona entre Chrome, Edge, Firefox com versões atualizadas
```

### 2. Comportamento Humano
- ✅ **Não marca online imediatamente** (`markOnlineOnConnect: false`)
- ✅ **Delay aleatório 2-5s** antes de enviar mensagens
- ✅ **Simula "digitando"** antes de enviar (`composing` presence)
- ✅ **Retry conservador** (3 tentativas ao invés de 5)
- ✅ **Delay maior entre retries** (500ms ao invés de 250ms)

### 3. Configurações Anti-Detecção
- ✅ Preview de links habilitado (comportamento normal)
- ✅ Keep-alive variável (25s ao invés de fixo 30s)
- ✅ Timeout realista para QR (60s)

## 📋 Checklist OBRIGATÓRIO Antes de Usar

### 1. Preparar o Número (CRÍTICO!)
- [ ] **Usar o número pessoalmente por 7-14 dias**
  - Enviar/receber mensagens normais
  - Conversar com pelo menos 10 contatos diferentes
  - Criar histórico de uso legítimo

- [ ] **Evitar números novos** (menos de 30 dias)
  - WhatsApp é mais rigoroso com números novos
  - Se for novo, use pessoalmente primeiro

- [ ] **Verificar se não está banido**
  - Envie mensagem normal pelo celular
  - Se não conseguir, número está bloqueado

### 2. Desconectar TUDO
- [ ] Abrir WhatsApp no celular
- [ ] Ir em: **Configurações → Aparelhos conectados**
- [ ] **Desconectar TODOS** os dispositivos
- [ ] Aguardar 5 minutos
- [ ] Limpar sessões antigas:
```bash
cd backend
node clean-whatsapp-sessions-force.js
```

### 3. Primeira Conexão
- [ ] Conectar apenas 1 vez por dia
- [ ] Não tentar múltiplas vezes seguidas
- [ ] Se der erro 515, aguardar 2-4 horas

## 🚫 O QUE NUNCA FAZER

### ❌ Comportamentos que Causam Ban Imediato
1. **Enviar mensagens em massa** (mais de 30 por hora)
2. **Mensagens idênticas** para múltiplos contatos
3. **Links na primeira mensagem** para contato novo
4. **Mensagens não solicitadas** (spam)
5. **Reconectar múltiplas vezes** em curto período
6. **Usar palavras-chave de spam**: "promoção", "desconto", "clique aqui"

### ❌ Padrões Suspeitos
- Enviar mensagens em intervalos fixos (ex: a cada 30s exatos)
- Mensagens muito longas (mais de 500 caracteres)
- Muitos números diferentes em pouco tempo
- Criar/entrar em muitos grupos rapidamente

## ✅ Boas Práticas de Uso

### 1. Volume de Mensagens
```
Número Novo (0-30 dias):
- Máximo: 10 mensagens/dia
- Máximo: 5 contatos diferentes/dia

Número Estabelecido (30+ dias):
- Máximo: 30 mensagens/hora
- Máximo: 100 mensagens/dia
- Máximo: 20 contatos diferentes/dia
```

### 2. Timing Entre Mensagens
```typescript
// Sistema já implementa automaticamente:
- Delay aleatório: 2-5 segundos
- Simula digitação: 1-3 segundos
- Total: 3-8 segundos entre mensagens
```

### 3. Personalização
- ✅ Sempre incluir nome do destinatário
- ✅ Variar o texto das mensagens
- ✅ Responder apenas quem iniciou conversa
- ✅ Permitir opt-out (parar de receber)

### 4. Horários Seguros
```
✅ Bom: 8h-22h (horário comercial)
❌ Evitar: 22h-8h (suspeito)
❌ Evitar: Madrugada (alto risco)
```

## 🔧 Troubleshooting

### Erro 515 - Conexão Rejeitada
**Causa:** Número já conectado OU temporariamente bloqueado

**Solução:**
1. Desconectar TODOS os dispositivos no celular
2. Executar: `node clean-whatsapp-sessions-force.js`
3. Aguardar 2-4 horas (cooldown do WhatsApp)
4. Tentar conectar novamente

### Erro 403 - Banimento Permanente
**Causa:** Violação grave dos termos de uso

**Solução:**
1. Apelar via: support@whatsapp.com
2. Usar template educado explicando uso legítimo
3. Se não funcionar, usar número diferente

### Mensagens Não Chegam
**Causa:** Soft-ban (restrição temporária)

**Solução:**
1. Parar de enviar mensagens por 24-48h
2. Usar o número pessoalmente (conversar normalmente)
3. Reduzir volume quando voltar

## 📊 Monitoramento

### Sinais de Alerta
- ⚠️ Mensagens demorando para entregar
- ⚠️ Muitos "não entregue" (1 tick)
- ⚠️ Contatos reportando não receber
- ⚠️ QR Code expirando rápido (menos de 30s)

### Ação Preventiva
Se detectar sinais de alerta:
1. **PARAR** de enviar mensagens imediatamente
2. Aguardar 24-48 horas
3. Usar o número pessoalmente
4. Reduzir volume pela metade quando voltar

## 🎯 Recomendações Finais

### Para Uso Comercial Seguro
1. **WhatsApp Business App** (gratuito)
   - Melhor para pequeno volume
   - Menos restritivo que pessoal
   - Perfil comercial oficial

2. **WhatsApp Business API** (pago)
   - Para alto volume (1000+ msg/dia)
   - Aprovado oficialmente pela Meta
   - Sem risco de banimento
   - Custo: ~$0.005-0.05 por mensagem

### Alternativas ao Baileys
Se continuar tendo problemas:
- **Twilio WhatsApp API** (oficial, pago)
- **MessageBird WhatsApp** (oficial, pago)
- **360Dialog** (oficial, pago)
- **Usar apenas notificações SMS** (mais caro, mas sem risco)

## 📚 Referências

- [WhatsApp Terms of Service](https://www.whatsapp.com/legal/terms-of-service)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Baileys Anti-Ban Best Practices](https://github.com/WhiskeySockets/Baileys/issues)

## 🆘 Suporte

Se após seguir todas as recomendações ainda tiver problemas:
1. Verificar logs: `backend/logs/whatsapp-*.log`
2. Testar com número diferente (para isolar problema)
3. Considerar migrar para WhatsApp Business API oficial

---

**Última atualização:** 04/02/2026
**Versão:** 1.30.9
**Desenvolvedor:** Kaynan Moreira
