import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { authService } from '../services/auth.service';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.signIn(email, password);
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-animated-bg">
        <div className="login-bg-gradient-1"></div>
        <div className="login-bg-gradient-2"></div>
        <div className="login-bg-gradient-3"></div>
      </div>

      {/* Back to Home */}
      <button className="back-to-home" onClick={() => navigate('/')}>
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <img src="/straxis.jpeg" alt="Straxis" className="logo-image" />
          </div>

          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Bem-vindo ao Straxis</h1>
            <p className="login-subtitle">
              Sistema de Gestão de Carga e Descarga
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-banner">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <div className="login-badge">
              <Sparkles className="badge-icon" />
              <span>Assistente IA Integrado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
