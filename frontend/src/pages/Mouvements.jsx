import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Mouvements() {
  const [produits, setProduits] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [form, setForm] = useState({ type: 'ENTREE', quantite: 1, motif: '', produitId: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const charger = () => {
    Promise.all([api.get('/produits'), api.get('/mouvements')])
      .then(([p, m]) => {
        setProduits(p.data);
        setMouvements(m.data);
      });
  };

  useEffect(() => { charger(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);
    try {
      await api.post('/mouvements', {
        ...form,
        quantite: parseInt(form.quantite),
        produitId: parseInt(form.produitId),
      });
      setMessage({ text: 'Mouvement enregistré avec succès', type: 'success' });
      setForm({ type: 'ENTREE', quantite: 1, motif: '', produitId: '' });
      charger();
    } catch (err) {
      setMessage({ text: err.response?.data?.erreur || 'Erreur', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const badgeType = (type) => {
    if (type === 'ENTREE') return 'badge-ok';
    if (type === 'SORTIE') return 'badge-danger';
    return 'badge-info';
  };

  return (
    <div className="page">
      <h1>Mouvements de stock</h1>
      <div className="two-columns">

        <div>
          <h2>Enregistrer un mouvement</h2>
          {message.text && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="ENTREE">Entrée</option>
                  <option value="SORTIE">Sortie</option>
                  <option value="TRANSFERT">Transfert</option>
                </select>
              </div>
              <div className="form-group">
                <label>Produit *</label>
                <select
                  value={form.produitId}
                  onChange={e => setForm({ ...form, produitId: e.target.value })}
                  required
                >
                  <option value="">-- Choisir un produit --</option>
                  {produits.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} (stock: {p.quantite})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantité *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantite}
                  onChange={e => setForm({ ...form, quantite: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Motif</label>
                <input
                  value={form.motif}
                  onChange={e => setForm({ ...form, motif: e.target.value })}
                  placeholder="Ex: Livraison fournisseur"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer le mouvement'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <h2>Historique des mouvements</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Produit</th>
                <th>Qté</th>
                <th>Date</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {[...mouvements].reverse().map(m => (
                <tr key={m.id}>
                  <td><span className={`badge ${badgeType(m.type)}`}>{m.type}</span></td>
                  <td>{m.produit?.nom}</td>
                  <td>{m.quantite}</td>
                  <td>{m.date}</td>
                  <td>{m.motif || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {mouvements.length === 0 && <p className="empty">Aucun mouvement enregistré.</p>}
        </div>

      </div>
    </div>
  );
}
