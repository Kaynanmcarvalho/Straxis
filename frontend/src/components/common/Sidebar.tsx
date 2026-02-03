import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Brain,
  UserCog,
  Building2,
  ScrollText,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  userRole: 'admin_platform' | 'owner' | 'user';
  isOpen?: boolean;
  onClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin_platform', 'owner', 'user'] },
  { label: 'Trabalhos', icon: Package, path: '/trabalhos', roles: ['admin_platform', 'owner', 'user'] },
  { label: 'Agendamentos', icon: Calendar, path: '/agenda', roles: ['admin_platform', 'owner', 'user'] },
  { label: 'Funcionários', icon: Users, path: '/funcionarios', roles: ['admin_platform', 'owner', 'user'] },
  { label: 'Fechamento', icon: FileText, path: '/fechamento/historico', roles: ['admin_platform', 'owner'] },
  { label: 'Relatórios', icon: FileText, path: '/relatorios', roles: ['admin_platform', 'owner', 'user'] },
  { label: 'WhatsApp', icon: MessageSquare, path: '/whatsapp', roles: ['admin_platform', 'owner'] },
  { label: 'IA', icon: Brain, path: '/ia-config', roles: ['admin_platform', 'owner'] },
  { label: 'Cargos', icon: Shield, path: '/cargos', roles: ['admin_platform', 'owner'] },
  { label: 'Usuários', icon: UserCog, path: '/usuarios', roles: ['admin_platform', 'owner'] },
  { label: 'Empresas', icon: Building2, path: '/empresas', roles: ['admin_platform'] },
  { label: 'Logs', icon: ScrollText, path: '/logs', roles: ['admin_platform', 'owner'] }
];

export const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen = false, onClose, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : 'desktop'} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Collapse Button (Desktop only) */}
        {!isMobile && (
          <button 
            className="collapse-button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}

        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/straxis.jpeg" alt="Straxis" className="logo-image" />
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">
                  <Icon className="w-5 h-5" />
                </span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {isActive && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Version Info */}
        <div className="sidebar-footer">
          <div 
            className="version-info"
            title="Última atualização: 03/02/2026 - CHANGE: Rota whatsapp2 → whatsapp"
          >
            {!isCollapsed ? (
              <>
                <span className="version-label">Versão</span>
                <span className="version-number">Alpha 0.31.2</span>
              </>
            ) : (
              <span className="version-number-collapsed">v0.31.2</span>
            )}
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: var(--color-surface, #ffffff);
          border-right: 1px solid var(--color-border, #e0e0e0);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: all 0.3s ease;
          box-shadow: 2px 0 8px rgba(0,0,0,0.05);
        }

        .sidebar.collapsed {
          width: 80px;
        }

        .sidebar.mobile {
          transform: translateX(-100%);
        }

        .sidebar.mobile.open {
          transform: translateX(0);
          box-shadow: 4px 0 16px rgba(0,0,0,0.2);
        }

        .sidebar.desktop {
          transform: translateX(0);
        }

        .collapse-button {
          position: absolute;
          top: 1.5rem;
          right: -12px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }

        .collapse-button:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(59, 130, 246, 0.4);
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-border, #e0e0e0);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .logo-image {
          width: 80px;
          height: 80px;
          min-width: 80px;
          border-radius: 20px;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .sidebar.collapsed .logo-image {
          width: 60px;
          height: 60px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--color-border, #e0e0e0);
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: var(--color-textSecondary, #757575);
        }

        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1.5rem;
          color: var(--color-text, #212121);
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-size: 1rem;
        }

        .sidebar.collapsed .sidebar-nav-item {
          justify-content: center;
          padding: 0.875rem 0;
        }

        .sidebar-nav-item:hover {
          background: var(--color-background, #fafafa);
        }

        .sidebar-nav-item.active {
          background: linear-gradient(90deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(37, 99, 235, 0.05) 100%
          );
          color: #3b82f6;
          font-weight: 500;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          transition: transform 0.2s ease;
        }

        .sidebar-nav-item:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 1rem;
          white-space: nowrap;
          transition: opacity 0.3s ease;
        }

        .sidebar.collapsed .nav-label {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--color-border, #e0e0e0);
          background: var(--color-background, #fafafa);
        }

        .version-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          cursor: help;
          transition: all 0.2s ease;
          padding: 0.375rem 0.5rem;
          border-radius: 6px;
        }

        .version-info:hover {
          background: var(--color-surface, #ffffff);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .version-label {
          font-size: 0.625rem;
          color: var(--color-textSecondary, #757575);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .version-number {
          font-size: 0.75rem;
          color: var(--color-text, #212121);
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .version-number-collapsed {
          font-size: 0.625rem;
          color: var(--color-textSecondary, #757575);
          font-weight: 600;
          text-align: center;
          display: block;
        }

        .sidebar.collapsed .sidebar-footer {
          padding: 0.5rem 0.25rem;
          text-align: center;
        }

        @media (max-width: 767px) {
          .collapse-button {
            display: none;
          }
          
          .sidebar {
            width: 280px !important;
          }
        }
      `}</style>
    </>
  );
};
