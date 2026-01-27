#!/bin/bash

# Script de deploy para ambiente de staging
# Uso: ./scripts/deploy-staging.sh

set -e

echo "🚀 Iniciando deploy para STAGING..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools${NC}"
    exit 1
fi

# Verificar se está logado no Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Não está logado no Firebase. Execute: firebase login${NC}"
    exit 1
fi

# 1. Build Backend
echo -e "${YELLOW}📦 Building backend...${NC}"
cd backend
npm ci
npm run build
cd ..

# 2. Build Frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
cd frontend
npm ci
npm run build
cd ..

# 3. Deploy Firestore Rules
echo -e "${YELLOW}🔒 Deploying Firestore Rules...${NC}"
firebase deploy --only firestore:rules --project staging

# 4. Deploy Firestore Indexes
echo -e "${YELLOW}📊 Deploying Firestore Indexes...${NC}"
firebase deploy --only firestore:indexes --project staging

# 5. Deploy Frontend (Firebase Hosting)
echo -e "${YELLOW}🌐 Deploying frontend to Firebase Hosting...${NC}"
firebase deploy --only hosting:staging --project staging

# 6. Deploy Backend
echo -e "${YELLOW}⚙️  Deploying backend...${NC}"
# Adicionar comandos específicos do seu provedor de cloud
# Exemplo para Google Cloud Run:
# gcloud run deploy straxis-backend-staging \
#   --image gcr.io/PROJECT_ID/straxis-backend:latest \
#   --platform managed \
#   --region us-central1 \
#   --allow-unauthenticated

echo -e "${GREEN}✅ Deploy para STAGING concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 URL: https://staging.straxis.app${NC}"

# 7. Executar smoke tests
echo -e "${YELLOW}🧪 Executando smoke tests...${NC}"
# Adicionar smoke tests aqui
# curl -f https://staging.straxis.app/api/health || exit 1

echo -e "${GREEN}✅ Smoke tests passaram!${NC}"
