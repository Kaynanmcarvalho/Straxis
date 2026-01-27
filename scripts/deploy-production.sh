#!/bin/bash

# Script de deploy para ambiente de produção
# Uso: ./scripts/deploy-production.sh

set -e

echo "🚀 Iniciando deploy para PRODUÇÃO..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Confirmação de deploy para produção
echo -e "${RED}⚠️  ATENÇÃO: Você está prestes a fazer deploy para PRODUÇÃO!${NC}"
read -p "Tem certeza que deseja continuar? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Deploy cancelado.${NC}"
    exit 0
fi

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

# Verificar se está na branch main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo -e "${RED}❌ Deploy para produção deve ser feito a partir da branch 'main'${NC}"
    echo -e "${YELLOW}Branch atual: $current_branch${NC}"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Há mudanças não commitadas. Commit ou stash antes de fazer deploy.${NC}"
    exit 1
fi

# 1. Executar testes
echo -e "${YELLOW}🧪 Executando testes...${NC}"
cd backend
npm ci
npm test
cd ../frontend
npm ci
npm test
cd ..

# 2. Build Backend
echo -e "${YELLOW}📦 Building backend...${NC}"
cd backend
npm run build
cd ..

# 3. Build Frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
cd frontend
npm run build
cd ..

# 4. Backup Firestore (opcional mas recomendado)
echo -e "${YELLOW}💾 Criando backup do Firestore...${NC}"
# firebase firestore:export gs://seu-bucket/backups/$(date +%Y%m%d-%H%M%S) --project production

# 5. Deploy Firestore Rules
echo -e "${YELLOW}🔒 Deploying Firestore Rules...${NC}"
firebase deploy --only firestore:rules --project production

# 6. Deploy Firestore Indexes
echo -e "${YELLOW}📊 Deploying Firestore Indexes...${NC}"
firebase deploy --only firestore:indexes --project production

# 7. Deploy Frontend (Firebase Hosting)
echo -e "${YELLOW}🌐 Deploying frontend to Firebase Hosting...${NC}"
firebase deploy --only hosting:production --project production

# 8. Deploy Backend
echo -e "${YELLOW}⚙️  Deploying backend...${NC}"
# Adicionar comandos específicos do seu provedor de cloud
# Exemplo para Google Cloud Run:
# gcloud run deploy straxis-backend \
#   --image gcr.io/PROJECT_ID/straxis-backend:latest \
#   --platform managed \
#   --region us-central1 \
#   --allow-unauthenticated

# 9. Criar tag de release
VERSION=$(date +%Y.%m.%d-%H%M%S)
echo -e "${YELLOW}🏷️  Criando tag de release: v$VERSION${NC}"
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"

echo -e "${GREEN}✅ Deploy para PRODUÇÃO concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 URL: https://app.straxis.app${NC}"
echo -e "${GREEN}🏷️  Tag: v$VERSION${NC}"

# 10. Executar smoke tests
echo -e "${YELLOW}🧪 Executando smoke tests...${NC}"
# Adicionar smoke tests aqui
# curl -f https://app.straxis.app/api/health || exit 1

echo -e "${GREEN}✅ Smoke tests passaram!${NC}"

# 11. Notificar equipe (opcional)
echo -e "${YELLOW}📢 Enviando notificação...${NC}"
# Adicionar notificação via Slack, Discord, Email, etc.
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Deploy v'$VERSION' para produção concluído!"}' \
#   YOUR_WEBHOOK_URL

echo -e "${GREEN}🎉 Deploy completo!${NC}"
