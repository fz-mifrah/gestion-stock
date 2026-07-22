import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#1e40af', '#dc2626', '#f59e0b'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // État du lancement des tests E2E (déclenchés via le serveur local sur :4000)
  const [testE2E, setTestE2E] = useState({ statut: 'idle' });

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const lancerTestsE2E = async () => {
    setTestE2E({ statut: 'running' });
    try {
      const res = await fetch('http://localhost:4000/run', { method: 'POST' });
      const data = await res.json();
      setTestE2E({ statut: 'done', ...data });
    } catch {
      setTestE2E({
        statut: 'error',
        erreur: "Serveur de tests injoignable. Lance d'abord : npm run test:server",
      });
    }
  };

  if (loading) return <div className="loading">Chargement du tableau de bord...</div>;
  if (error || !stats) return <div className="alert alert-error">Impossible de charger le tableau de bord. Vérifiez que le backend est démarré.</div>;

  return (
    <div className="page">
      <h1>Tableau de bord</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProduits}</div>
          <div className="stat-label">Produits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalMouvements}</div>
          <div className="stat-label">Mouvements</div>
        </div>
        <div className={`stat-card ${stats.totalAlertes > 0 ? 'stat-card-danger' : ''}`}>
          <div className="stat-value">{stats.totalAlertes}</div>
          <div className="stat-label">Alertes stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalAdmins}</div>
          <div className="stat-label">Administrateurs</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-value" style={{ color: '#16a34a' }}>{stats.totalEntrees}</div>
          <div className="stat-label">Entrées</div>
        </div>
        <div className="stat-card stat-card-red">
          <div className="stat-value" style={{ color: '#dc2626' }}>{stats.totalSorties}</div>
          <div className="stat-label">Sorties</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.totalTransferts}</div>
          <div className="stat-label">Transferts</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-wide">
          <h2>Mouvements — 30 derniers jours</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={stats.mouvementsParJour} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="mouvements" fill="#1e40af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Répartition par type</h2>
          {stats.totalMouvements === 0 ? (
            <div className="empty">Aucun mouvement enregistré</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={stats.mouvementsParType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                >
                  {stats.mouvementsParType.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {stats.topProduits?.length > 0 && (
          <div className="chart-card">
            <h2>Top 5 produits les plus actifs</h2>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={stats.topProduits} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nom" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="mouvements" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="test-panel">
        <div className="test-panel-head">
          <div>
            <h2>🧪 Tests automatisés (E2E)</h2>
            <p className="test-panel-sub">Lance les tests Playwright et affiche le résultat ici.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={lancerTestsE2E}
            disabled={testE2E.statut === 'running'}
          >
            {testE2E.statut === 'running' ? 'Tests en cours…' : 'Lancer les tests E2E'}
          </button>
        </div>

        {testE2E.statut === 'running' && (
          <div className="test-panel-info">⏳ Exécution des tests dans un navigateur… (~15 s)</div>
        )}

        {testE2E.statut === 'error' && (
          <div className="alert alert-error">{testE2E.erreur}</div>
        )}

        {testE2E.statut === 'done' && testE2E.tests && (
          <div className="test-results">
            <div className={`test-summary ${testE2E.ok ? 'ok' : 'ko'}`}>
              {testE2E.ok ? '✅' : '❌'} {testE2E.passed} réussis · {testE2E.failed} échoués
              {typeof testE2E.durationMs === 'number' && (
                <span className="test-duration"> — {(testE2E.durationMs / 1000).toFixed(1)} s</span>
              )}
            </div>
            <ul className="test-list">
              {testE2E.tests.map((t, i) => (
                <li key={i} className={t.ok ? 'ok' : 'ko'}>
                  {t.ok ? '✅' : '❌'} {t.titre}
                </li>
              ))}
            </ul>
          </div>
        )}

        {testE2E.statut === 'done' && !testE2E.tests && (
          <div className="alert alert-error">{testE2E.erreur || 'Erreur inconnue'}</div>
        )}
      </div>
    </div>
  );
}
