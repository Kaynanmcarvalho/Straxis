/**
 * Icon Mapping - Straxis SaaS
 * Mapeamento de ícones para cada módulo e ação do sistema
 */

import {
  // Navegação e Layout
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Home,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  
  // Módulos principais
  Package,
  Calendar,
  Users,
  FileText,
  UserCog,
  Building2,
  MessageSquare,
  Brain,
  ScrollText,
  
  // Financeiro
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  
  // Operações
  Truck,
  PackageOpen,
  Clock,
  Zap,
  
  // Status e Feedback
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Check,
  
  // Ações
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Search,
  Filter,
  
  // Configurações e Sistema
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Mail,
  Phone,
  MapPin,
  
  // Loading
  Loader2,
} from 'lucide-react';

/**
 * Ícones por módulo do sistema
 */
export const moduleIcons = {
  // Navegação principal
  dashboard: LayoutDashboard,
  trabalhos: Package,
  agendamentos: Calendar,
  funcionarios: Users,
  relatorios: FileText,
  usuarios: UserCog,
  empresas: Building2,
  whatsapp: MessageSquare,
  ia: Brain,
  logs: ScrollText,
  
  // Submódulos
  carga: Truck,
  descarga: PackageOpen,
  
  // Financeiro
  faturamento: TrendingUp,
  custos: TrendingDown,
  lucro: DollarSign,
  
  // Gráficos
  graficoLinha: LineChart,
  graficoBarra: BarChart3,
  graficoPizza: PieChart,
  atividade: Activity,
};

/**
 * Ícones para ações comuns
 */
export const actionIcons = {
  // CRUD
  criar: Plus,
  adicionar: Plus,
  editar: Edit,
  deletar: Trash2,
  remover: Minus,
  visualizar: Eye,
  ocultar: EyeOff,
  salvar: Save,
  
  // Navegação
  voltar: ArrowLeft,
  proximo: ArrowRight,
  expandir: ChevronDown,
  recolher: ChevronUp,
  menu: Menu,
  fechar: X,
  home: Home,
  
  // Operações
  atualizar: RefreshCw,
  buscar: Search,
  filtrar: Filter,
  download: Download,
  upload: Upload,
  copiar: Copy,
  linkExterno: ExternalLink,
  
  // Sistema
  configuracoes: Settings,
  sair: LogOut,
  notificacao: Bell,
  notificacaoOff: BellOff,
  
  // Tema
  darkMode: Moon,
  lightMode: Sun,
  
  // Segurança
  seguranca: Shield,
  bloqueado: Lock,
  desbloqueado: Unlock,
  
  // Contato
  email: Mail,
  telefone: Phone,
  localizacao: MapPin,
  
  // Tempo
  relogio: Clock,
  rapido: Zap,
};

/**
 * Ícones para status e feedback
 */
export const statusIcons = {
  sucesso: CheckCircle,
  erro: XCircle,
  aviso: AlertCircle,
  info: Info,
  check: Check,
  loading: Loader2,
  
  // Status de trabalho/agendamento
  confirmado: CheckCircle,
  pendente: Clock,
  cancelado: XCircle,
  concluido: Check,
};

/**
 * Ícones contextuais por tipo de trabalho
 */
export const trabalhoIcons = {
  carga: Truck,
  descarga: PackageOpen,
};

/**
 * Ícones para indicadores financeiros
 */
export const financeIcons = {
  faturamento: TrendingUp,
  custos: TrendingDown,
  lucro: DollarSign,
  positivo: ArrowUp,
  negativo: ArrowDown,
};

/**
 * Helper para obter ícone por nome
 */
export function getIcon(category: 'module' | 'action' | 'status' | 'trabalho' | 'finance', name: string) {
  const iconMaps = {
    module: moduleIcons,
    action: actionIcons,
    status: statusIcons,
    trabalho: trabalhoIcons,
    finance: financeIcons,
  };
  
  return iconMaps[category][name as keyof typeof iconMaps[typeof category]];
}

/**
 * Exporta todos os ícones para uso direto
 */
export const icons = {
  ...moduleIcons,
  ...actionIcons,
  ...statusIcons,
  ...trabalhoIcons,
  ...financeIcons,
};
