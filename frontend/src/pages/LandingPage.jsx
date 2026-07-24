import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';

const features = [
  { icon: '📦', title: 'Gestion des produits', desc: 'Cataloguez vos produits avec références, catégories et seuils d\'alerte personnalisés.' },
  { icon: '🔄', title: 'Suivi des mouvements', desc: 'Enregistrez les entrées, sorties et transferts avec traçabilité complète.' },
  { icon: '🔔', title: 'Alertes automatiques', desc: 'Soyez notifié immédiatement quand un produit passe sous son seuil minimum.' },
  { icon: '📊', title: 'Rapports & statistiques', desc: 'Analysez vos tendances avec des graphiques interactifs et des rapports détaillés.' },
  { icon: '👥', title: 'Gestion des admins', desc: 'Gérez plusieurs responsables avec des accès sécurisés par authentification JWT.' },
  { icon: '🔒', title: 'Sécurité avancée', desc: 'Authentification JWT, mots de passe chiffrés BCrypt, sessions entièrement stateless.' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="landing-logo-icon">📦</span>
          <span className="landing-logo-text">StockIQ</span>
        </div>
        <div className="landing-nav-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Tableau de bord →</Link>
          ) : (
            <Link to="/login" className="btn btn-primary">Se connecter</Link>
          )}
        </div>
      </nav>

      <header className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">Gestion de Stock Intelligente</div>
          <h1 className="hero-title">StockIQ</h1>
          <p className="hero-subtitle">
            La solution complète pour gérer votre inventaire, suivre vos mouvements de stock
            et recevoir des alertes en temps réel.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Accéder au tableau de bord →</Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg">Commencer maintenant →</Link>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-title">Vue d'ensemble</div>
            <div className="hero-stats-row">
              <div className="hero-stat">
                <div className="hero-stat-value">1 247</div>
                <div className="hero-stat-label">Produits</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value text-green">98.3%</div>
                <div className="hero-stat-label">Précision</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value text-red">3</div>
                <div className="hero-stat-label">Alertes</div>
              </div>
            </div>
            <div className="hero-bar-preview">
              {[40, 65, 30, 80, 55, 90, 45, 70, 35, 60].map((h, i) => (
                <div key={i} className="hero-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="landing-features">
        <h2 className="features-title">Tout ce dont vous avez besoin</h2>
        <p className="features-subtitle">Une plateforme intégrée pour piloter votre stock efficacement</p>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Prêt à optimiser votre stock ?</h2>
        <p>Connectez-vous pour accéder à votre tableau de bord.</p>
        {user ? (
          <Link to="/dashboard" className="btn btn-primary btn-lg">Accéder au tableau de bord</Link>
        ) : (
          <Link to="/login" className="btn btn-white btn-lg">Se connecter →</Link>
        )}
      </section>

      <footer className="landing-footer">
        <p>© 2026 StockIQ — Système de Gestion de Stock</p>
      </footer>
    </div>
  );
}
