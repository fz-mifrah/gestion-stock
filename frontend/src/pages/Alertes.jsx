import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Alertes() {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/alertes')
      .then(res => setAlertes(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="page">
      <h1>Alertes stock critique</h1>

      {alertes.length === 0 ? (
        <div className="alert alert-success">
          Tous les produits sont au-dessus du seuil minimum. Aucune alerte.
        </div>
      ) : (
        <>
          <p className="subtitle">{alertes.length} produit(s) nécessitent un réapprovisionnement.</p>
          <table className="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Référence</th>
                <th>Catégorie</th>
                <th>Stock actuel</th>
                <th>Seuil minimum</th>
                <th>Manque</th>
              </tr>
            </thead>
            <tbody>
              {alertes.map(p => (
                <tr key={p.id} className="alert-row">
                  <td>{p.nom}</td>
                  <td>{p.reference}</td>
                  <td>{p.categorie || '—'}</td>
                  <td className="text-danger">{p.quantite}</td>
                  <td>{p.seuilMinimum}</td>
                  <td className="text-danger">{p.seuilMinimum - p.quantite} unité(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
