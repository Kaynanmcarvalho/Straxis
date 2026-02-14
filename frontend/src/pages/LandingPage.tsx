import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Menu, 
  X,
  Package,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Brain,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
  Smartphone,
  Globe,
  Lock,
  Rocket
} from 'lucide-react';
import Lottie from 'lottie-react';
import robotAnimation from '../assets/Robot_says_hello.json';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Parallax effect
      const scrollY = window.scrollY;
      if (heroRef.current) {
        const heroImage = heroRef.current.querySelector('.hero-image');
        if (heroImage) {
          (heroImage as HTMLElement).style.transform = `translateY(${scrollY * 0.15}px)`;
        }
      }

      // Parallax background
      const parallaxBg = document.querySelector('.parallax-bg');
      if (parallaxBg) {
        (parallaxBg as HTMLElement).style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    // Intersection Observer para animações
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, index * 50);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    // Cursor glow effect
    const handleMouseMove = (e: MouseEvent) => {
      const glow = document.querySelector('.cursor-glow') as HTMLElement;
      if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: Package,
      title: 'Gestão de Trabalhos',
      description: 'Controle completo de operações de carga e descarga com cálculo automático de lucros',
      color: '#0071E3'
    },
    {
      icon: Calendar,
      title: 'Agendamentos',
      description: 'Planeje trabalhos futuros e gerencie sua equipe com eficiência',
      color: '#00C7BE'
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Acompanhe performance e histórico de cada funcionário',
      color: '#FF9500'
    },
    {
      icon: FileText,
      title: 'Relatórios Avançados',
      description: 'Exportação em PDF e Excel com métricas detalhadas',
      color: '#34C759'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integrado',
      description: 'Comunicação direta com sua equipe via WhatsApp Business',
      color: '#25D366'
    },
    {
      icon: Brain,
      title: 'Assistente IA',
      description: 'Inteligência artificial para otimizar suas operações',
      color: '#8B5CF6'
    }
  ];

  const specs = [
    { value: '100%', label: 'Offline', description: 'Funciona sem internet' },
    { value: '24/7', label: 'Disponível', description: 'Acesso a qualquer hora' },
    { value: '∞', label: 'Empresas', description: 'Multi-tenant ilimitado' },
    { value: '<1s', label: 'Resposta', description: 'Performance otimizada' }
  ];

  const plans = [
    {
      name: 'Básico',
      price: 'R$ 97',
      period: '/mês',
      features: [
        'Até 5 usuários',
        'Gestão de trabalhos',
        'Relatórios básicos',
        'Suporte por email'
      ]
    },
    {
      name: 'Profissional',
      price: 'R$ 197',
      period: '/mês',
      popular: true,
      features: [
        'Usuários ilimitados',
        'WhatsApp integrado',
        'Assistente IA',
        'Relatórios avançados',
        'Suporte prioritário'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      features: [
        'Tudo do Profissional',
        'Customizações',
        'API dedicada',
        'Suporte 24/7',
        'Treinamento incluso'
      ]
    }
  ];

  return (
    <div className="landing-page">
      {/* Cursor Glow Effect */}
      <div className="cursor-glow"></div>
      
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-gradient-3"></div>
      </div>

      {/* Navbar */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src="/straxis.jpeg" alt="Straxis" />
            <span>Straxis</span>
          </div>

          <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
            <a href="#features">Recursos</a>
            <a href="#specs">Especificações</a>
            <a href="#pricing">Planos</a>
          </div>

          <div className="navbar-actions">
            <button className="btn-secondary" onClick={handleLogin}>
              Entrar
            </button>
            <button className="btn-primary" onClick={handleLogin}>
              Começar Grátis
            </button>
          </div>

          <button 
            className="navbar-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-content animate-on-scroll">
          <div className="hero-badge">
            <Sparkles className="badge-icon" />
            <span>Novo: Assistente IA Integrado</span>
          </div>
          <div className="hero-title-wrapper">
            <h1 className="hero-title">
              Gestão de Carga e Descarga
              <span className="gradient-text">Reimaginada</span>
            </h1>
            <div className="hero-robot-lottie">
              <Lottie 
                animationData={robotAnimation} 
                loop={true}
                style={{ background: 'transparent' }}
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice'
                }}
              />
            </div>
          </div>
          <p className="hero-subtitle">
            Sistema completo para controlar operações, equipe e finanças.
            <br />
            Com IA, WhatsApp integrado e funcionamento offline.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={handleLogin}>
              <span>Começar Agora</span>
              <ArrowRight className="btn-icon" />
            </button>
            <button className="btn-hero-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <span>Saiba Mais</span>
            </button>
          </div>
        </div>

        <div className="hero-image animate-on-scroll">
          <div className="hero-mockup">
            <div className="mockup-glow"></div>
            <div className="mockup-content">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="mockup-title">Dashboard</div>
              </div>
              <div className="mockup-body">
                <div className="mockup-stat">
                  <div className="stat-icon-wrapper">
                    <TrendingUp className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">R$ 45.280</span>
                    <span className="stat-label">Faturamento Mensal</span>
                    <div className="stat-badge positive">
                      <span>+12.5%</span>
                    </div>
                  </div>
                </div>
                <div className="mockup-stat">
                  <div className="stat-icon-wrapper">
                    <Clock className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">127</span>
                    <span className="stat-label">Trabalhos Concluídos</span>
                    <div className="stat-badge neutral">
                      <span>Este mês</span>
                    </div>
                  </div>
                </div>
                <div className="mockup-stat">
                  <div className="stat-icon-wrapper">
                    <BarChart3 className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">R$ 12.450</span>
                    <span className="stat-label">Lucro Líquido</span>
                    <div className="stat-badge positive">
                      <span>+8.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-item">
            <div className="stat-number">100+</div>
            <div className="stat-text">Empresas Ativas</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <div className="stat-number">50k+</div>
            <div className="stat-text">Trabalhos Gerenciados</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-text">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" ref={featuresRef}>
        <div className="section-header animate-on-scroll">
          <h2 className="section-title">Tudo que você precisa</h2>
          <p className="section-subtitle">
            Recursos poderosos para transformar sua gestão operacional
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card animate-on-scroll"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)` }}>
                  <feature.icon />
                </div>
                <div className="feature-glow" style={{ background: `radial-gradient(circle, ${feature.color}40 0%, transparent 70%)` }}></div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-arrow">
                <ArrowRight />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parallax Section */}
      <section className="parallax-section">
        <div className="parallax-bg"></div>
        <div className="parallax-content animate-on-scroll">
          <div className="parallax-text">
            <div className="parallax-icon-group">
              <Smartphone className="parallax-main-icon" />
              <div className="icon-orbit">
                <Globe className="orbit-icon" />
              </div>
            </div>
            <h2 className="parallax-title">
              Funciona offline.
              <br />
              Sincroniza automaticamente.
            </h2>
            <p className="parallax-subtitle">
              PWA nativo que funciona mesmo sem internet. Todos os dados são
              sincronizados automaticamente quando você volta online.
            </p>
            <div className="parallax-features">
              <div className="parallax-feature">
                <div className="feature-icon-circle">
                  <Shield className="parallax-feature-icon" />
                </div>
                <div className="feature-text">
                  <span className="feature-title-small">Dados Seguros</span>
                  <span className="feature-desc-small">Criptografia end-to-end</span>
                </div>
              </div>
              <div className="parallax-feature">
                <div className="feature-icon-circle">
                  <Zap className="parallax-feature-icon" />
                </div>
                <div className="feature-text">
                  <span className="feature-title-small">Ultra Rápido</span>
                  <span className="feature-desc-small">Resposta em &lt;1s</span>
                </div>
              </div>
              <div className="parallax-feature">
                <div className="feature-icon-circle">
                  <Lock className="parallax-feature-icon" />
                </div>
                <div className="feature-text">
                  <span className="feature-title-small">Multi-tenant</span>
                  <span className="feature-desc-small">Isolamento total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Section */}
      <section id="specs" className="specs-section" ref={specsRef}>
        <div className="specs-grid">
          {specs.map((spec, index) => (
            <div 
              key={index} 
              className="spec-card animate-on-scroll"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="spec-value">{spec.value}</div>
              <div className="spec-label">{spec.label}</div>
              <div className="spec-description">{spec.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header animate-on-scroll">
          <h2 className="section-title">Planos para cada necessidade</h2>
          <p className="section-subtitle">
            Escolha o plano ideal para o tamanho da sua operação
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card animate-on-scroll ${plan.popular ? 'popular' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && <div className="popular-badge">Mais Popular</div>}
              <h3 className="pricing-name">{plan.name}</h3>
              <div className="pricing-price">
                {plan.price}
                <span className="pricing-period">{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={plan.popular ? 'btn-pricing-primary' : 'btn-pricing-secondary'}
                onClick={handleLogin}
              >
                Começar Agora
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Straxis</h4>
            <p>Sistema de gestão de carga e descarga</p>
          </div>
          <div className="footer-section">
            <h4>Produto</h4>
            <a href="#features">Recursos</a>
            <a href="#specs">Especificações</a>
            <a href="#pricing">Planos</a>
          </div>
          <div className="footer-section">
            <h4>Empresa</h4>
            <a href="#about">Sobre</a>
            <a href="#contact">Contato</a>
            <a href="#support">Suporte</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#privacy">Privacidade</a>
            <a href="#terms">Termos</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Straxis. Todos os direitos reservados.</p>
          <p className="footer-version">Beta 1.49.0</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
