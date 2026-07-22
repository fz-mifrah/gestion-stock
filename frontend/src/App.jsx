import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import ProduitForm from './pages/ProduitForm';
import Mouvements from './pages/Mouvements';
import Alertes from './pages/Alertes';
import Rapports from './pages/Rapports';
import AdminGestion from './pages/AdminGestion';
import Profil from './pages/Profil';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
          } />
          <Route path="/produits" element={
            <PrivateRoute><Layout><Produits /></Layout></PrivateRoute>
          } />
          <Route path="/produits/ajouter" element={
            <PrivateRoute><Layout><ProduitForm /></Layout></PrivateRoute>
          } />
          <Route path="/produits/modifier/:id" element={
            <PrivateRoute><Layout><ProduitForm /></Layout></PrivateRoute>
          } />
          <Route path="/mouvements" element={
            <PrivateRoute><Layout><Mouvements /></Layout></PrivateRoute>
          } />
          <Route path="/alertes" element={
            <PrivateRoute><Layout><Alertes /></Layout></PrivateRoute>
          } />
          <Route path="/rapports" element={
            <PrivateRoute><Layout><Rapports /></Layout></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute><Layout><AdminGestion /></Layout></PrivateRoute>
          } />
          <Route path="/profil" element={
            <PrivateRoute><Layout><Profil /></Layout></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
