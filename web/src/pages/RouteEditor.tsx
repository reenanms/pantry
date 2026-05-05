import { useState } from 'react';
import { api } from '../api/client';
import type { RouteConfig } from '../api/client';

interface RouteEditorProps {
  route: RouteConfig;
  onBack: () => void;
}

export function RouteEditor({ route, onBack }: RouteEditorProps) {
  const [form, setForm] = useState({
    keyField: route.keyField,
    latency: route.latency,
    isStatic: route.isStatic,
    staticCode: route.staticCode ?? 200,
    staticPayload: route.staticPayload ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  function handleChange(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await api.routes.update(route.id, {
        keyField: form.keyField,
        latency: Number(form.latency),
        isStatic: form.isStatic,
        staticCode: form.isStatic ? Number(form.staticCode) : null,
        staticPayload: form.isStatic ? form.staticPayload : null,
      });
      setMessage({ text: 'Route updated successfully!', type: 'success' });
      setTimeout(() => onBack(), 800);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2>Edit Route: <code>/api/{route.path}</code></h2>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card editor-form">
        <div className="form-group">
          <label htmlFor="keyField">Key Field</label>
          <input
            id="keyField"
            type="text"
            className="input"
            value={form.keyField}
            onChange={(e) => handleChange('keyField', e.target.value)}
          />
          <span className="hint">The field used to identify individual resources (default: id)</span>
        </div>

        <div className="form-group">
          <label htmlFor="latency">Latency (ms)</label>
          <input
            id="latency"
            type="number"
            className="input"
            min={0}
            value={form.latency}
            onChange={(e) => handleChange('latency', e.target.value)}
          />
          <span className="hint">Artificial delay applied to all requests on this route</span>
        </div>

        <div className="form-divider" />

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isStatic}
              onChange={(e) => handleChange('isStatic', e.target.checked)}
            />
            Enable Static Response
          </label>
          <span className="hint">When enabled, this route ignores the request method and returns a fixed response</span>
        </div>

        {form.isStatic && (
          <>
            <div className="form-group">
              <label htmlFor="staticCode">HTTP Status Code</label>
              <input
                id="staticCode"
                type="number"
                className="input"
                min={100}
                max={599}
                value={form.staticCode}
                onChange={(e) => handleChange('staticCode', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="staticPayload">Static Payload (JSON)</label>
              <textarea
                id="staticPayload"
                className="input textarea"
                rows={6}
                value={form.staticPayload}
                onChange={(e) => handleChange('staticPayload', e.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
