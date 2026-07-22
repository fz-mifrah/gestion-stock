import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ProduitForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '', reference: '', quantite: 0, seuilMinimum: 0, categorie: ''
  });
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/produits/${id}`).then(res => setForm(res.data));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/produits/${id}`, form);
      } else {
        await api.post('/produits', form);
      }
      navigate('/produits');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>{isEdit ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
      {erreur && <div className="alert alert-error">{erreur}</div>}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom *</label>
            <input
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              required
              placeholder="Ex: Stylo bleu"
            />
          </div>
          <div className="form-group">
            <label>Référence *</label>
            <input
              value={form.reference}
              onChange={e => setForm({ ...form, reference: e.target.value })}
              required
              placeholder="Ex: STY-001"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantité en stock</label>
              <input
                type="number"
                min="0"
                value={form.quantite}
                onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Seuil minimum</label>
              <input
                type="number"
                min="0"
                value={form.seuilMinimum}
                onChange={e => setForm({ ...form, seuilMinimum: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <input
              value={form.categorie}
              onChange={e => setForm({ ...form, categorie: e.target.value })}
              placeholder="Ex: Fournitures"
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/produits')}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
