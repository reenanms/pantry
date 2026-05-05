import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { RouteConfig } from '../api/client';

interface DataBrowserProps {
  route: RouteConfig;
  onBack: () => void;
}

export function DataBrowser({ route, onBack }: DataBrowserProps) {
  const [resources, setResources] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.resources.list(route.path);
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, [route.path]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2>Data Browser: <code>/api/{route.path}</code></h2>
        <button className="btn btn-secondary" onClick={fetchResources}>🔄 Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <p>No resources stored for this route yet.</p>
          <p>POST to <code>/api/{route.path}</code> to add data.</p>
        </div>
      ) : (
        <div className="data-grid">
          {resources.map((resource, index) => (
            <div key={index} className="card data-card">
              <pre className="data-json">{JSON.stringify(resource, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
