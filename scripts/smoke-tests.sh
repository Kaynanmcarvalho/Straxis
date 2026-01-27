#!/bin/bash

# Smoke tests pós-deploy
# Verifica se os serviços principais estão funcionando
# Uso: ./scripts/smoke-tests.sh [staging|production]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" = "production" ]; then
    BASE_URL="https://app.straxis.app"
    API_URL="https://api.straxis.app"
else
    BASE_URL="https://staging.straxis.app"
    API_URL="https://api-staging.straxis.app"
fi

echo -e "${BLUE}🧪 Executando smoke tests para: $ENVIRONMENT${NC}"
echo -e "${BLUE}URL: $BASE_URL${NC}"
echo ""

ERRORS=0

# Função para reportar erro
error() {
    echo -e "${RED}❌ ERRO: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Função para reportar sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Verificar se o frontend está acessível
echo -e "${BLUE}🌐 Verificando frontend...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    success "Frontend acessível (HTTP $HTTP_CODE)"
else
    error "Frontend não acessível (HTTP $HTTP_CODE)"
fi

# 2. Verificar se o HTML contém elementos esperados
echo -e "${BLUE}📄 Verificando conteúdo HTML...${NC}"
HTML_CONTENT=$(curl -s "$BASE_URL")

if echo "$HTML_CONTENT" | grep -q "Straxis"; then
    success "Título encontrado no HTML"
else
    error "Título não encontrado no HTML"
fi

if echo "$HTML_CONTENT" | grep -q "root"; then
    success "Elemento root encontrado"
else
    error "Elemento root não encontrado"
fi

# 3. Verificar se o service worker está registrado
echo -e "${BLUE}⚙️  Verificando service worker...${NC}"
SW_URL="$BASE_URL/service-worker.js"
SW_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SW_URL" || echo "000")

if [ "$SW_CODE" = "200" ]; then
    success "Service worker acessível"
else
    error "Service worker não acessível (HTTP $SW_CODE)"
fi

# 4. Verificar manifest.json
echo -e "${BLUE}📱 Verificando manifest.json...${NC}"
MANIFEST_URL="$BASE_URL/manifest.json"
MANIFEST_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MANIFEST_URL" || echo "000")

if [ "$MANIFEST_CODE" = "200" ]; then
    success "Manifest.json acessível"
    
    # Verificar conteúdo do manifest
    MANIFEST_CONTENT=$(curl -s "$MANIFEST_URL")
    if echo "$MANIFEST_CONTENT" | grep -q "name"; then
        success "Manifest.json válido"
    else
        error "Manifest.json inválido"
    fi
else
    error "Manifest.json não acessível (HTTP $MANIFEST_CODE)"
fi

# 5. Verificar API health endpoint (se existir)
echo -e "${BLUE}🏥 Verificando API health...${NC}"
HEALTH_URL="$API_URL/health"
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

if [ "$HEALTH_CODE" = "200" ]; then
    success "API health endpoint respondendo"
else
    # Não é erro crítico se não existir
    echo -e "${YELLOW}⚠️  API health endpoint não encontrado (HTTP $HEALTH_CODE)${NC}"
fi

# 6. Verificar tempo de resposta
echo -e "${BLUE}⏱️  Verificando tempo de resposta...${NC}"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL")
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

if (( $(echo "$RESPONSE_TIME < 3" | bc -l) )); then
    success "Tempo de resposta OK: ${RESPONSE_TIME_MS}ms"
else
    error "Tempo de resposta alto: ${RESPONSE_TIME_MS}ms (esperado < 3000ms)"
fi

# 7. Verificar headers de segurança
echo -e "${BLUE}🔒 Verificando headers de segurança...${NC}"
HEADERS=$(curl -s -I "$BASE_URL")

if echo "$HEADERS" | grep -qi "x-frame-options"; then
    success "X-Frame-Options presente"
else
    echo -e "${YELLOW}⚠️  X-Frame-Options não encontrado${NC}"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    success "X-Content-Type-Options presente"
else
    echo -e "${YELLOW}⚠️  X-Content-Type-Options não encontrado${NC}"
fi

# 8. Verificar HTTPS
echo -e "${BLUE}🔐 Verificando HTTPS...${NC}"
if [[ "$BASE_URL" == https://* ]]; then
    success "HTTPS configurado"
else
    error "HTTPS não configurado"
fi

# 9. Verificar certificado SSL
echo -e "${BLUE}📜 Verificando certificado SSL...${NC}"
DOMAIN=$(echo "$BASE_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
SSL_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

if [ -n "$SSL_EXPIRY" ]; then
    success "Certificado SSL válido (expira em: $SSL_EXPIRY)"
else
    error "Não foi possível verificar certificado SSL"
fi

# 10. Verificar recursos estáticos
echo -e "${BLUE}📦 Verificando recursos estáticos...${NC}"

# Verificar se há arquivos JS
JS_FILES=$(curl -s "$BASE_URL" | grep -o 'src="[^"]*\.js"' | wc -l)
if [ "$JS_FILES" -gt 0 ]; then
    success "Arquivos JavaScript encontrados ($JS_FILES)"
else
    error "Nenhum arquivo JavaScript encontrado"
fi

# Verificar se há arquivos CSS
CSS_FILES=$(curl -s "$BASE_URL" | grep -o 'href="[^"]*\.css"' | wc -l)
if [ "$CSS_FILES" -gt 0 ]; then
    success "Arquivos CSS encontrados ($CSS_FILES)"
else
    echo -e "${YELLOW}⚠️  Nenhum arquivo CSS encontrado${NC}"
fi

# Resumo
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMO DOS SMOKE TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os smoke tests passaram!${NC}"
    echo -e "${GREEN}🎉 Deploy para $ENVIRONMENT validado com sucesso${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erro(s) encontrado(s)${NC}"
    echo -e "${RED}⚠️  Considere fazer rollback ou investigar os problemas${NC}"
    exit 1
fi
