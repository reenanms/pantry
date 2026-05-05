import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { RouteConfig } from '../api/client';
import { ConfirmButton } from '../components/ConfirmButton';

interface DashboardProps {
  onEdit: (route: RouteConfig) => void;
  onBrowse: (route: RouteConfig) => void;
}

export function Dashboard({ onEdit, onBrowse }: DashboardProps) {
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPath, setNewPath] = useState('');

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.routes.list();
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  async function handleCreate() {
    if (!newPath.trim()) return;
    try {
      await api.routes.create({ path: newPath.trim() });
      setNewPath('');
      setShowCreateForm(false);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create route');
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.routes.delete(id);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete route');
    }
  }

  async function handleWipe() {
    try {
      await api.system.wipe();
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to wipe data');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            + New Route
          </button>
          <ConfirmButton
            label="🗑️ Wipe All"
            confirmLabel="Confirm Wipe?"
            className="btn btn-danger"
            onConfirm={handleWipe}
            danger
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showCreateForm && (
        <div className="card create-form">
          <h3>Create New Route</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Route path (e.g., users)"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              className="input"
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            <button className="btn btn-ghost" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading routes...</div>
      ) : routes.length === 0 ? (
        <div className="empty-state">
          <p>No routes yet. Create one or POST to <code>/api/&lt;path&gt;</code> to auto-provision.</p>
        </div>
      ) : (
        <div className="routes-grid">
          {routes.map((route) => (
            <div key={route.id} className={`card route-card ${route.isStatic ? 'static' : ''}`}>
              <div className="route-card-header">
                <span className="route-path">/api/{route.path}</span>
                {route.isStatic && <span className="badge badge-static">Static</span>}
              </div>
              <div className="route-card-meta">
                <span>Key: <code>{route.keyField}</code></span>
                {route.latency > 0 && <span>⏱ {route.latency}ms</span>}
                {route.isStatic && route.staticCode && (
                  <span>Status: <code>{route.staticCode}</code></span>
                )}
              </div>
              <div className="route-card-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => onEdit(route)}>Edit</button>
                <button className="btn btn-sm btn-secondary" onClick={() => onBrowse(route)}>Browse</button>
                <ConfirmButton
                  label="Delete"
                  confirmLabel="Confirm Delete?"
                  className="btn btn-sm btn-danger"
                  onConfirm={() => handleDelete(route.id)}
                  danger
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
