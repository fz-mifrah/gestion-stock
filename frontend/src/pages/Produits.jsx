import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const charger = () => {
    api.get('/produits')
      .then(res => setProduits(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/produits/${id}`);
      setMessage({ text: 'Produit supprimé avec succès', type: 'success' });
      charger();
    } catch {
      setMessage({ text: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Produits</h1>
        <Link to="/produits/ajouter" className="btn btn-primary">+ Ajouter un produit</Link>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Référence</th>
            <th>Catégorie</th>
            <th>Quantité</th>
            <th>Seuil min.</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map(p => (
            <tr key={p.id}>
              <td>{p.nom}</td>
              <td>{p.reference}</td>
              <td>{p.categorie || '—'}</td>
              <td>{p.quantite}</td>
              <td>{p.seuilMinimum}</td>
              <td>
                {p.quantite <= p.seuilMinimum
                  ? <span className="badge badge-danger">Critique</span>
                  : <span className="badge badge-ok">OK</span>}
              </td>
              <td className="actions">
                <Link to={`/produits/modifier/${p.id}`} className="btn btn-sm btn-secondary">Modifier</Link>
                <button onClick={() => supprimer(p.id)} className="btn btn-sm btn-danger">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {produits.length === 0 && <p className="empty">Aucun produit enregistré.</p>}
    </div>
  );
}
