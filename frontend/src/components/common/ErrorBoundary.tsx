/**
 * Error Boundary - Captura erros e previne travamentos
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    
    // TODO: Enviar para serviço de monitoramento (Sentry, etc)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <AlertCircle size={48} />
            </div>
            <h2 className="error-boundary-title">Algo deu errado</h2>
            <p className="error-boundary-message">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary>Detalhes do erro</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <button 
              className="error-boundary-button"
              onClick={this.handleReset}
            >
              <RefreshCw size={18} />
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
