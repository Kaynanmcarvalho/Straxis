#!/bin/bash

# Script de validação pré-deploy
# Verifica se o projeto está pronto para deploy
# Uso: ./scripts/pre-deploy-check.sh [staging|production]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-staging}

echo -e "${BLUE}🔍 Executando verificações pré-deploy para: $ENVIRONMENT${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Função para reportar erro
error() {
    echo -e "${RED}❌ ERRO: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Função para reportar warning
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# Função para reportar sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Verificar Node.js
echo -e "${BLUE}📦 Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js instalado: $NODE_VERSION"
    
    # Verificar versão mínima (18.x)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        error "Node.js versão 18+ é necessária. Versão atual: $NODE_VERSION"
    fi
else
    error "Node.js não encontrado"
fi

# 2. Verificar Firebase CLI
echo -e "${BLUE}🔥 Verificando Firebase CLI...${NC}"
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    success "Firebase CLI instalado: $FIREBASE_VERSION"
    
    # Verificar se está logado
    if firebase projects:list &> /dev/null; then
        success "Autenticado no Firebase"
    else
        error "Não autenticado no Firebase. Execute: firebase login"
    fi
else
    error "Firebase CLI não encontrado. Instale com: npm install -g firebase-tools"
fi

# 3. Verificar Git
echo -e "${BLUE}📝 Verificando Git...${NC}"
if command -v git &> /dev/null; then
    success "Git instalado"
    
    # Verificar branch atual
    CURRENT_BRANCH=$(git branch --show-current)
    echo "   Branch atual: $CURRENT_BRANCH"
    
    if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        error "Deploy para produção deve ser feito a partir da branch 'main'. Branch atual: $CURRENT_BRANCH"
    fi
    
    if [ "$ENVIRONMENT" = "staging" ] && [ "$CURRENT_BRANCH" != "staging" ]; then
        warning "Deploy para staging geralmente é feito a partir da branch 'staging'. Branch atual: $CURRENT_BRANCH"
    fi
    
    # Verificar mudanças não commitadas
    if ! git diff-index --quiet HEAD --; then
        error "Há mudanças não commitadas. Commit ou stash antes de fazer deploy."
    else
        success "Sem mudanças não commitadas"
    fi
    
    # Verificar se está sincronizado com remote
    git fetch origin &> /dev/null
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    
    if [ -n "$REMOTE" ]; then
        if [ "$LOCAL" != "$REMOTE" ]; then
            warning "Branch local não está sincronizada com remote. Execute: git pull"
        else
            success "Branch sincronizada com remote"
        fi
    fi
else
    error "Git não encontrado"
fi

# 4. Verificar dependências Backend
echo -e "${BLUE}📦 Verificando dependências Backend...${NC}"
if [ -d "backend/node_modules" ]; then
    success "Dependências do backend instaladas"
else
    warning "Dependências do backend não instaladas. Execute: cd backend && npm install"
fi

# 5. Verificar dependências Frontend
echo -e "${BLUE}📦 Verificando dependências Frontend...${NC}"
if [ -d "frontend/node_modules" ]; then
    success "Dependências do frontend instaladas"
else
    warning "Dependências do frontend não instaladas. Execute: cd frontend && npm install"
fi

# 6. Verificar arquivos de configuração
echo -e "${BLUE}⚙️  Verificando arquivos de configuração...${NC}"

if [ -f "backend/.env" ]; then
    success "backend/.env existe"
    
    # Verificar variáveis críticas
    if grep -q "FIREBASE_PROJECT_ID" backend/.env; then
        success "FIREBASE_PROJECT_ID configurado"
    else
        error "FIREBASE_PROJECT_ID não encontrado em backend/.env"
    fi
else
    error "backend/.env não encontrado"
fi

if [ -f "frontend/.env" ]; then
    success "frontend/.env existe"
else
    warning "frontend/.env não encontrado (pode usar variáveis de ambiente do CI)"
fi

if [ -f "firebase.json" ]; then
    success "firebase.json existe"
else
    error "firebase.json não encontrado"
fi

if [ -f "firestore.rules" ]; then
    success "firestore.rules existe"
else
    error "firestore.rules não encontrado"
fi

if [ -f "firestore.indexes.json" ]; then
    success "firestore.indexes.json existe"
else
    warning "firestore.indexes.json não encontrado"
fi

# 7. Executar testes Backend
echo -e "${BLUE}🧪 Executando testes Backend...${NC}"
cd backend
if npm test &> /dev/null; then
    success "Testes do backend passaram"
else
    error "Testes do backend falharam. Execute: cd backend && npm test"
fi
cd ..

# 8. Executar testes Frontend
echo -e "${BLUE}🧪 Executando testes Frontend...${NC}"
cd frontend
if npm test &> /dev/null; then
    success "Testes do frontend passaram"
else
    error "Testes do frontend falharam. Execute: cd frontend && npm test"
fi
cd ..

# 9. Verificar lint Backend
echo -e "${BLUE}🔍 Verificando lint Backend...${NC}"
cd backend
if npm run lint &> /dev/null; then
    success "Lint do backend passou"
else
    warning "Lint do backend falhou. Execute: cd backend && npm run lint"
fi
cd ..

# 10. Verificar lint Frontend
echo -e "${BLUE}🔍 Verificando lint Frontend...${NC}"
cd frontend
if npm run lint &> /dev/null; then
    success "Lint do frontend passou"
else
    warning "Lint do frontend falhou. Execute: cd frontend && npm run lint"
fi
cd ..

# 11. Verificar build Backend
echo -e "${BLUE}🏗️  Verificando build Backend...${NC}"
cd backend
if npm run build &> /dev/null; then
    success "Build do backend passou"
else
    error "Build do backend falhou. Execute: cd backend && npm run build"
fi
cd ..

# 12. Verificar build Frontend
echo -e "${BLUE}🏗️  Verificando build Frontend...${NC}"
cd frontend
if npm run build &> /dev/null; then
    success "Build do frontend passou"
else
    error "Build do frontend falhou. Execute: cd frontend && npm run build"
fi
cd ..

# 13. Verificar segurança (npm audit)
echo -e "${BLUE}🔒 Verificando vulnerabilidades...${NC}"
cd backend
BACKEND_AUDIT=$(npm audit --audit-level=high 2>&1 || true)
if echo "$BACKEND_AUDIT" | grep -q "found 0 vulnerabilities"; then
    success "Sem vulnerabilidades críticas no backend"
else
    warning "Vulnerabilidades encontradas no backend. Execute: cd backend && npm audit"
fi
cd ..

cd frontend
FRONTEND_AUDIT=$(npm audit --audit-level=high 2>&1 || true)
if echo "$FRONTEND_AUDIT" | grep -q "found 0 vulnerabilities"; then
    success "Sem vulnerabilidades críticas no frontend"
else
    warning "Vulnerabilidades encontradas no frontend. Execute: cd frontend && npm audit"
fi
cd ..

# Resumo
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as verificações passaram!${NC}"
    echo -e "${GREEN}🚀 Pronto para deploy para $ENVIRONMENT${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) encontrado(s)${NC}"
    echo -e "${YELLOW}⚠️  Revise os warnings antes de fazer deploy${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erro(s) encontrado(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) encontrado(s)${NC}"
    fi
    echo -e "${RED}❌ Corrija os erros antes de fazer deploy${NC}"
    exit 1
fi
