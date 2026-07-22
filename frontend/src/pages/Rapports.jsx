import { useState } from 'react';
import api from '../api/axios';

export default function Rapports() {
  const today = new Date().toISOString().split('T')[0];
  const [debut, setDebut] = useState('2026-01-01');
  const [fin, setFin] = useState(today);
  const [mouvements, setMouvements] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`/rapports?debut=${debut}&fin=${fin}`);
      setMouvements(res.data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const entrees = mouvements
    .filter(m => m.type === 'ENTREE')
    .reduce((s, m) => s + m.quantite, 0);

  const sorties = mouvements
    .filter(m => m.type === 'SORTIE')
    .reduce((s, m) => s + m.quantite, 0);

  const badgeType = (type) => {
    if (type === 'ENTREE') return 'badge-ok';
    if (type === 'SORTIE') return 'badge-danger';
    return 'badge-info';
  };

  return (
    <div className="page">
      <h1>Rapports</h1>

      <div className="form-card form-inline">
        <form onSubmit={handleSearch} className="rapport-form">
          <div className="form-group">
            <label>Date début</label>
            <input
              type="date"
              value={debut}
              onChange={e => setDebut(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date fin</label>
            <input
              type="date"
              value={fin}
              onChange={e => setFin(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Recherche...' : 'Générer le rapport'}
          </button>
        </form>
      </div>

      {searched && (
        <>
          <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-value">{mouvements.length}</div>
              <div className="stat-label">Total mouvements</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#16a34a' }}>{entrees}</div>
              <div className="stat-label">Unités entrées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#dc2626' }}>{sorties}</div>
              <div className="stat-label">Unités sorties</div>
            </div>
          </div>

          <table className="table" style={{ marginTop: '1.5rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map(m => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td><span className={`badge ${badgeType(m.type)}`}>{m.type}</span></td>
                  <td>{m.produit?.nom}</td>
                  <td>{m.quantite}</td>
                  <td>{m.motif || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {mouvements.length === 0 && (
            <p className="empty">Aucun mouvement sur cette période.</p>
          )}
        </>
      )}
    </div>
  );
}
