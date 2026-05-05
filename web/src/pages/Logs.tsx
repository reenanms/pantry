import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { LogEntry } from '../api/client';

export function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.logs.list();
      setLogs(data);
    } catch {
      // Silently fail — logs are best-effort
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function methodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: 'var(--color-success)',
      POST: 'var(--color-primary)',
      PUT: 'var(--color-warning)',
      PATCH: 'var(--color-warning)',
      DELETE: 'var(--color-danger)',
    };
    return colors[method] ?? 'var(--color-text-muted)';
  }

  function statusColor(code: number): string {
    if (code < 300) return 'var(--color-success)';
    if (code < 400) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Request Logs</h2>
        <button className="btn btn-secondary" onClick={fetchLogs}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <p>No requests logged yet.</p>
        </div>
      ) : (
        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Method</th>
                <th>URL</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span className="log-method" style={{ color: methodColor(log.method) }}>
                      {log.method}
                    </span>
                  </td>
                  <td className="log-url">{log.url}</td>
                  <td>
                    <span className="log-status" style={{ color: statusColor(log.statusCode) }}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="log-duration">{log.duration}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
