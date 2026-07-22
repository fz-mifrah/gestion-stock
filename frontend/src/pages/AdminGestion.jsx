import { useState, useEffect } from 'react';
import api from '../api/axios';

const emptyForm = { login: '', motDePasse: '', nom: '', prenom: '', email: '', telephone: '', role: 'RESPONSABLE' };

export default function AdminGestion() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/utilisateurs')
      .then(r => setAdmins(r.data))
      .catch(() => setError('Impossible de charger la liste des admins'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setModal('add');
  };

  const openEdit = (a) => {
    setSelected(a);
    setForm({ login: a.login, nom: a.nom || '', prenom: a.prenom || '', email: a.email || '', telephone: a.telephone || '', role: a.role, motDePasse: '' });
    setFormError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (modal === 'add') {
        await api.post('/admin/utilisateurs', form);
        setSuccess('Administrateur créé avec succès');
      } else {
        await api.put(`/admin/utilisateurs/${selected.id}`, form);
        setSuccess('Administrateur modifié avec succès');
      }
      load();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Une erreur est survenue';
      setFormError(String(msg));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de cet administrateur ?')) return;
    setError(''); setSuccess('');
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      setSuccess('Administrateur supprimé');
      load();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erreur lors de la suppression';
      setError(String(msg));
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestion des administrateurs</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Nouvel administrateur</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Login</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr><td colSpan="7" className="empty">Aucun administrateur trouvé</td></tr>
            ) : admins.map(a => (
              <tr key={a.id}>
                <td><strong>{a.login}</strong></td>
                <td>{a.nom || '—'}</td>
                <td>{a.prenom || '—'}</td>
                <td>{a.email || '—'}</td>
                <td>{a.telephone || '—'}</td>
                <td><span className="badge badge-info">{a.role}</span></td>
                <td>
                  <div className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Nouvel administrateur' : 'Modifier l\'administrateur'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Login *</label>
                  <input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="RESPONSABLE">RESPONSABLE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom</label>
                  <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                </div>
              </div>
              {modal === 'add' && (
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input type="password" value={form.motDePasse} onChange={e => setForm({ ...form, motDePasse: e.target.value })} required minLength={6} placeholder="Minimum 6 caractères" />
                </div>
              )}
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
