import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  MessageSquare, 
  Brain, 
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  ScrollText,
  UserCircle,
  LogOut,
  LucideIcon
} from 'lucide-react';
import './Dock.css';

interface DockItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  action?: () => void;
}

const VISIBLE_ITEMS = 5;
const GAP = 4;
const DRAG_THRESHOLD = 5; // Pixels to distinguish drag from click
const VELOCITY_MULTIPLIER = 0.3; // Inertia factor
const SNAP_DURATION = 350; // ms

export const Dock: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [itemWidth, setItemWidth] = useState(70);
  const [containerWidth, setContainerWidth] = useState(0);

  // Função de logout
  const handleLogout = useCallback(() => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      window.location.reload();
    }
  }, [navigate]);

  // Itens do dock com logout
  const dockItems: DockItem[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'trabalhos', label: 'Trabalhos', icon: Package, path: '/trabalhos' },
    { id: 'agendamentos', label: 'Agenda', icon: Calendar, path: '/agenda' },
    { id: 'funcionarios', label: 'Equipe', icon: Users, path: '/funcionarios' },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, path: '/relatorios' },
    { id: 'clientes', label: 'Clientes', icon: UserCircle, path: '/clientes' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, path: '/whatsapp' },
    { id: 'ia', label: 'IA', icon: Brain, path: '/ia-config' },
    { id: 'empresas', label: 'Empresas', icon: Building2, path: '/empresas' },
    { id: 'logs', label: 'Logs', icon: ScrollText, path: '/logs' },
    { id: 'logout', label: 'Sair', icon: LogOut, action: handleLogout },
  ];

  // Calculate dimensions based on window width
  const updateDimensions = useCallback(() => {
    const width = window.innerWidth;
    let newItemWidth = 70;
    
    if (width < 360) {
      newItemWidth = 54;
    } else if (width < 400) {
      newItemWidth = 62;
    }
    
    setItemWidth(newItemWidth);
    const newContainerWidth = (newItemWidth * VISIBLE_ITEMS) + (GAP * (VISIBLE_ITEMS - 1)) + 16;
    setContainerWidth(newContainerWidth);
  }, []);

  // Calculate max offset
  const getMaxOffset = useCallback(() => {
    const totalWidth = (dockItems.length * itemWidth) + (GAP * (dockItems.length - 1));
    const visibleWidth = (VISIBLE_ITEMS * itemWidth) + (GAP * (VISIBLE_ITEMS - 1));
    return Math.max(0, totalWidth - visibleWidth);
  }, [itemWidth]);

  // Initialize and handle resize
  useEffect(() => {
    updateDimensions();
    
    const handleResize = () => {
      updateDimensions();
      const maxOffset = getMaxOffset();
      if (offset > maxOffset) {
        setOffset(maxOffset);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions, getMaxOffset, offset]);

  const isActive = (path?: string) => path && location.pathname === path;

  // Animate to target with spring physics
  const animateToOffset = useCallback((targetOffset: number) => {
    const startOffset = offset;
    const distance = targetOffset - startOffset;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / SNAP_DURATION, 1);
      
      // Spring easing - feels physical
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const newOffset = startOffset + distance * easeProgress;
      setOffset(newOffset);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [offset]);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = clientX;
    lastXRef.current = clientX;
    startOffsetRef.current = offset;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    setIsDragging(true);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [offset]);

  // Handle drag move with velocity tracking
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;

    const deltaX = startXRef.current - clientX;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;

    // Track if user actually dragged (not just a tap)
    if (Math.abs(deltaX) > DRAG_THRESHOLD) {
      hasDraggedRef.current = true;
    }

    // Calculate velocity for inertia
    if (deltaTime > 0) {
      const instantVelocity = (lastXRef.current - clientX) / deltaTime;
      velocityRef.current = instantVelocity;
    }

    const newOffset = startOffsetRef.current + deltaX;
    const maxOffset = getMaxOffset();
    
    // Rubber band effect at edges
    let clampedOffset = newOffset;
    if (newOffset < 0) {
      clampedOffset = newOffset * 0.3; // Resistance
    } else if (newOffset > maxOffset) {
      clampedOffset = maxOffset + (newOffset - maxOffset) * 0.3;
    }
    
    setOffset(clampedOffset);
    lastXRef.current = clientX;
    lastTimeRef.current = currentTime;
  }, [getMaxOffset]);

  // Handle drag end with inertia
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    setIsDragging(false);

    const maxOffset = getMaxOffset();
    
    // Apply inertia
    const inertia = velocityRef.current * VELOCITY_MULTIPLIER * 1000;
    const targetOffset = offset + inertia;

    // Snap to nearest group of 5
    const groupWidth = (itemWidth * VISIBLE_ITEMS) + (GAP * (VISIBLE_ITEMS - 1));
    const snappedOffset = Math.round(targetOffset / groupWidth) * groupWidth;
    
    // Clamp to valid range
    const finalOffset = Math.max(0, Math.min(maxOffset, snappedOffset));
    
    animateToOffset(finalOffset);
    
    // Reset drag flag after a short delay to allow click detection
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
  }, [offset, getMaxOffset, itemWidth, animateToOffset]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      // Só prevenir default se realmente estiver arrastando o dock
      if (hasDraggedRef.current) {
        e.preventDefault();
      }
      handleDragMove(e.touches[0].clientX);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // Passive false apenas quando necessário
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle item click (only if not dragged)
  const handleItemClick = useCallback((item: DockItem) => {
    if (!hasDraggedRef.current) {
      if (item.action) {
        item.action();
      } else if (item.path) {
        navigate(item.path);
      }
    }
  }, [navigate]);

  const maxOffset = getMaxOffset();

  return (
    <nav className="dock-container">
      <div 
        ref={containerRef}
        className={`dock ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          width: `${containerWidth}px`,
          maxWidth: `${containerWidth}px`,
        }}
      >
        <div 
          ref={trackRef}
          className="dock-track"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {dockItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isLogoutItem = item.id === 'logout';

            return (
              <button
                key={item.id}
                className={`dock-item ${active ? 'active' : ''} ${isLogoutItem ? 'logout-item' : ''}`}
                onClick={() => handleItemClick(item)}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={item.label}
                style={{
                  width: `${itemWidth}px`,
                  minWidth: `${itemWidth}px`,
                  maxWidth: `${itemWidth}px`,
                  pointerEvents: isDragging ? 'none' : 'auto',
                }}
              >
                <div className="dock-item-icon">
                  <Icon className="icon" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="dock-item-label">{item.label}</span>
                {active && <div className="dock-item-indicator" />}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Scroll indicators - subtle visual feedback */}
      {offset > 0 && (
        <div className="dock-indicator dock-indicator-left" />
      )}
      {offset < maxOffset && maxOffset > 0 && (
        <div className="dock-indicator dock-indicator-right" />
      )}
    </nav>
  );
};
