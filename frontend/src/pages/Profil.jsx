import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Profil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const [loginVal, setLoginVal] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const [pwForm, setPwForm] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    api.get('/admin/moi')
      .then(r => { setProfil(r.data); setLoginVal(r.data.login); })
      .finally(() => setLoading(false));
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoginSuccess('');
    try {
      const res = await api.put(`/admin/utilisateurs/${profil.id}`, {
        login: loginVal,
        nom: profil.nom,
        prenom: profil.prenom,
        email: profil.email,
        telephone: profil.telephone,
        role: profil.role,
      });
      setProfil(res.data);
      setLoginSuccess('Login mis à jour. Veuillez vous reconnecter si vous l\'avez modifié.');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erreur lors de la mise à jour';
      setLoginError(String(msg));
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.nouveauMotDePasse !== pwForm.confirmation) {
      setPwError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    try {
      await api.put(`/admin/utilisateurs/${profil.id}/password`, {
        ancienMotDePasse: pwForm.ancienMotDePasse,
        nouveauMotDePasse: pwForm.nouveauMotDePasse,
      });
      setPwSuccess('Mot de passe changé avec succès');
      setPwForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erreur lors du changement';
      setPwError(String(msg));
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <h1>Mon profil</h1>

      <div className="profil-grid">
        <div className="form-card">
          <h2>Informations du compte</h2>
          <div className="profil-info-list">
            <div className="profil-info-item"><span className="profil-info-label">Login</span><strong>{profil?.login}</strong></div>
            <div className="profil-info-item"><span className="profil-info-label">Nom</span><span>{profil?.nom || '—'}</span></div>
            <div className="profil-info-item"><span className="profil-info-label">Prénom</span><span>{profil?.prenom || '—'}</span></div>
            <div className="profil-info-item"><span className="profil-info-label">Email</span><span>{profil?.email || '—'}</span></div>
            <div className="profil-info-item"><span className="profil-info-label">Téléphone</span><span>{profil?.telephone || '—'}</span></div>
            <div className="profil-info-item"><span className="profil-info-label">Rôle</span><span className="badge badge-info">{profil?.role}</span></div>
          </div>
        </div>

        <div className="profil-right">
          <div className="form-card">
            <h2>Changer le nom d'utilisateur</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Nouveau login</label>
                <input value={loginVal} onChange={e => setLoginVal(e.target.value)} required minLength={3} />
              </div>
              {loginError && <div className="alert alert-error">{loginError}</div>}
              {loginSuccess && <div className="alert alert-success">{loginSuccess}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Mettre à jour</button>
              </div>
            </form>
          </div>

          <div className="form-card" style={{ marginTop: '1.5rem' }}>
            <h2>Changer le mot de passe</h2>
            <form onSubmit={handlePwSubmit}>
              <div className="form-group">
                <label>Ancien mot de passe</label>
                <input type="password" value={pwForm.ancienMotDePasse} onChange={e => setPwForm({ ...pwForm, ancienMotDePasse: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" value={pwForm.nouveauMotDePasse} onChange={e => setPwForm({ ...pwForm, nouveauMotDePasse: e.target.value })} required minLength={6} placeholder="Minimum 6 caractères" />
              </div>
              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input type="password" value={pwForm.confirmation} onChange={e => setPwForm({ ...pwForm, confirmation: e.target.value })} required minLength={6} />
              </div>
              {pwError && <div className="alert alert-error">{pwError}</div>}
              {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Changer le mot de passe</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
