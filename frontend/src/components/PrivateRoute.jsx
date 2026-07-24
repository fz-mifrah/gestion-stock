import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  // Non connecté → page d'accueil (qui propose le bouton "Se connecter").
  // Garantit aussi que la déconnexion depuis une page protégée ramène à l'accueil.
  return user ? children : <Navigate to="/" replace />;
}
