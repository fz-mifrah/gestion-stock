import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">📦 StockIQ</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/produits">Produits</Link>
        <Link to="/mouvements">Mouvements</Link>
        <Link to="/alertes">Alertes</Link>
        <Link to="/rapports">Rapports</Link>
        <Link to="/admin">Admins</Link>
      </div>
      <div className="navbar-user">
        <Link to="/profil" className="navbar-profil-link">{user?.login}</Link>
        <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
      </div>
    </nav>
  );
}
