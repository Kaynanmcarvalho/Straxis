import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, LogOut, UserCog, Menu } from 'lucide-react';

interface TopbarProps {
  userRole: 'admin_platform' | 'owner' | 'user';
  userName?: string;
  userAvatar?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  userRole, 
  userName = 'Usuário', 
  userAvatar,
  onMenuClick,
  showMenuButton = false
}) => {
  const { toggleTheme, isDark } = useTheme();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin_platform':
        return 'Admin da Plataforma';
      case 'owner':
        return 'Dono da Empresa';
      case 'user':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          {showMenuButton && (
            <button 
              className="topbar-menu-button"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="topbar-right">
          {/* Theme Toggle */}
          <button 
            className="topbar-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Info */}
          <div className="topbar-user">
            <div className="topbar-user-avatar">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} />
              ) : (
                <UserCog className="w-5 h-5" />
              )}
            </div>
            <div className="topbar-user-info">
              <div className="topbar-user-name">{userName}</div>
              <div className="topbar-user-role">{getRoleLabel(userRole)}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            className="topbar-button topbar-logout"
            onClick={handleLogout}
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <style>{`
        .topbar {
          position: fixed;
          top: 0;
          right: 0;
          left: 280px;
          height: 64px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 100;
          transition: left 0.3s ease;
        }

        :root[data-theme="dark"] .topbar {
          background: rgba(30, 30, 30, 0.8);
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .sidebar.collapsed ~ .topbar {
          left: 80px;
        }

        @media (max-width: 767px) {
          .topbar {
            left: 0;
          }
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .topbar-menu-button {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-text, #212121);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .topbar-menu-button:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        :root[data-theme="dark"] .topbar-menu-button:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 767px) {
          .topbar-menu-button {
            display: flex;
          }
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .topbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          color: var(--color-text, #212121);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :root[data-theme="dark"] .topbar-button {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .topbar-button:hover {
          background: rgba(0, 0, 0, 0.05);
          border-color: var(--color-primary, #2196f3);
        }

        :root[data-theme="dark"] .topbar-button:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .topbar-logout:hover {
          background: rgba(244, 67, 54, 0.1);
          border-color: var(--color-error, #f44336);
          color: var(--color-error, #f44336);
        }

        .topbar-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        :root[data-theme="dark"] .topbar-user {
          background: rgba(255, 255, 255, 0.05);
        }

        .topbar-user:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        :root[data-theme="dark"] .topbar-user:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .topbar-user-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          overflow: hidden;
          position: relative;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }

        .topbar-user-avatar::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        .topbar-user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .topbar-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        @media (max-width: 640px) {
          .topbar-user-info {
            display: none;
          }
        }

        .topbar-user-name {
          font-weight: 600;
          color: var(--color-text, #212121);
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar-user-role {
          font-size: 0.75rem;
          color: var(--color-textSecondary, #757575);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
};
