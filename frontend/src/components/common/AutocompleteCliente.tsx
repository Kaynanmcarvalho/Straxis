import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader, Building2, Phone, MapPin, Sparkles } from 'lucide-react';
import { clienteService, ClienteSugestao } from '../../services/cliente.service';
import { useAuth } from '../../contexts/AuthContext';

interface AutocompleteClienteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (cliente: ClienteSugestao) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const AutocompleteCliente: React.FC<AutocompleteClienteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Nome do cliente',
  autoFocus = false,
  className = 'modal-input-luxury',
}) => {
  const { user } = useAuth();
  const companyId = user?.companyId || 'dev-company-id';
  
  const [sugestoes, setSugestoes] = useState<ClienteSugestao[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Buscar clientes com debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length >= 2) {
      setLoading(true);
      timeoutRef.current = setTimeout(async () => {
        try {
          const resultados = await clienteService.searchClientes(value, companyId, 10);
          setSugestoes(resultados);
          setMostrarSugestoes(true);
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
          setSugestoes([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSugestoes([]);
      setMostrarSugestoes(false);
      setLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, companyId]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarSugestoes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selecionarCliente = (cliente: ClienteSugestao) => {
    onChange(cliente.nome);
    setMostrarSugestoes(false);
    setSelectedIndex(-1);
    if (onSelect) {
      onSelect(cliente);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!mostrarSugestoes || sugestoes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < sugestoes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < sugestoes.length) {
          selecionarCliente(sugestoes[selectedIndex]);
        }
        break;
      case 'Escape':
        setMostrarSugestoes(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          className={className}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setMostrarSugestoes(true)}
          autoFocus={autoFocus}
          autoComplete="off"
          style={{
            paddingRight: loading ? '48px' : '16px',
          }}
        />
        {loading && (
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Loader 
              size={18} 
              style={{ 
                color: '#007AFF',
                animation: 'spin 1s linear infinite',
              }} 
            />
          </div>
        )}
      </div>

      {mostrarSugestoes && sugestoes.length > 0 && (
        <div 
          className={`autocomplete-dropdown ${mounted ? 'mounted' : ''}`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(0, 122, 255, 0.15)',
            borderRadius: '16px',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.12),
              0 8px 24px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(0, 0, 0, 0.04),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
            maxHeight: '320px',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 10000,
            padding: '8px',
            animation: mounted ? 'dropdownSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {/* Header do dropdown */}
          <div style={{
            padding: '12px 16px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            marginBottom: '4px',
          }}>
            <Search size={14} style={{ color: '#999', flexShrink: 0 }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}>
              {sugestoes.length} {sugestoes.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {sugestoes.map((cliente, index) => (
            <button
              key={cliente.id}
              type="button"
              onClick={() => selecionarCliente(cliente)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
              style={{
                width: '100%',
                padding: '14px 16px',
                textAlign: 'left',
                border: 'none',
                background: index === selectedIndex 
                  ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.04) 100%)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '10px',
                marginBottom: index < sugestoes.length - 1 ? '4px' : '0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                position: 'relative',
                overflow: 'hidden',
                transform: index === selectedIndex ? 'translateX(2px)' : 'translateX(0)',
                boxShadow: index === selectedIndex 
                  ? '0 2px 8px rgba(0, 122, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  : 'none',
              }}
            >
              {/* Ícone com badge */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: index === selectedIndex
                  ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)'
                  : 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: index === selectedIndex
                  ? '0 4px 12px rgba(0, 122, 255, 0.25)'
                  : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Brilho sutil */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <Building2 
                  size={20} 
                  style={{ 
                    color: index === selectedIndex ? 'white' : '#007AFF',
                    position: 'relative',
                    zIndex: 1,
                  }} 
                />
              </div>

              {/* Conteúdo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000',
                  marginBottom: '6px',
                  letterSpacing: '-0.3px',
                  lineHeight: '1.3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {cliente.nome}
                  </span>
                  {index === selectedIndex && (
                    <Sparkles 
                      size={14} 
                      style={{ 
                        color: '#007AFF',
                        flexShrink: 0,
                        animation: 'sparkle 1.5s ease-in-out infinite',
                      }} 
                    />
                  )}
                </div>
                
                {(cliente.telefone || cliente.endereco) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    {cliente.telefone && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#666',
                      }}>
                        <Phone size={12} style={{ flexShrink: 0, opacity: 0.6 }} />
                        <span>{cliente.telefone}</span>
                      </div>
                    )}
                    {cliente.endereco && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#666',
                      }}>
                        <MapPin size={12} style={{ flexShrink: 0, opacity: 0.6 }} />
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {cliente.endereco}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Indicador de seleção */}
              {index === selectedIndex && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '60%',
                  background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
                  borderRadius: '0 2px 2px 0',
                  boxShadow: '0 0 8px rgba(0, 122, 255, 0.4)',
                }} />
              )}
            </button>
          ))}
        </div>
      )}

      {mostrarSugestoes && value.length >= 2 && sugestoes.length === 0 && !loading && (
        <div 
          className={`autocomplete-empty ${mounted ? 'mounted' : ''}`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.12),
              0 8px 24px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
            padding: '32px 24px',
            textAlign: 'center',
            zIndex: 10000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            animation: mounted ? 'dropdownSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.04) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Search size={28} style={{ color: '#007AFF', opacity: 0.6 }} />
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 600,
            color: '#000', 
            marginBottom: '8px',
            letterSpacing: '-0.3px',
          }}>
            Nenhum cliente encontrado
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            lineHeight: '1.5',
          }}>
            Tente buscar por outro nome ou<br />cadastre um novo cliente
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1) rotate(180deg);
          }
        }

        .autocomplete-dropdown::-webkit-scrollbar {
          width: 8px;
        }

        .autocomplete-dropdown::-webkit-scrollbar-track {
          background: transparent;
          margin: 8px 0;
        }

        .autocomplete-dropdown::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        .autocomplete-item:hover {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.04) 100%) !important;
          transform: translateX(2px) !important;
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
        }

        .autocomplete-item:active {
          transform: translateX(1px) scale(0.98) !important;
        }
      `}</style>
    </div>
  );
};
