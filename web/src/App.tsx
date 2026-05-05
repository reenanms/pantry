import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { RouteEditor } from './pages/RouteEditor';
import { DataBrowser } from './pages/DataBrowser';
import { Logs } from './pages/Logs';
import type { RouteConfig } from './api/client';

type Page = 'dashboard' | 'editor' | 'browser' | 'logs';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null);

  function handleEditRoute(route: RouteConfig) {
    setSelectedRoute(route);
    setCurrentPage('editor');
  }

  function handleBrowseRoute(route: RouteConfig) {
    setSelectedRoute(route);
    setCurrentPage('browser');
  }

  function handleBackToDashboard() {
    setSelectedRoute(null);
    setCurrentPage('dashboard');
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>🗄️ Pantry</h1>
          <span className="sidebar-subtitle">Mock API Server</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button
            className={`nav-item ${currentPage === 'logs' ? 'active' : ''}`}
            onClick={() => setCurrentPage('logs')}
          >
            <span className="nav-icon">📋</span>
            Logs
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {currentPage === 'dashboard' && (
          <Dashboard onEdit={handleEditRoute} onBrowse={handleBrowseRoute} />
        )}
        {currentPage === 'editor' && selectedRoute && (
          <RouteEditor route={selectedRoute} onBack={handleBackToDashboard} />
        )}
        {currentPage === 'browser' && selectedRoute && (
          <DataBrowser route={selectedRoute} onBack={handleBackToDashboard} />
        )}
        {currentPage === 'logs' && <Logs />}
      </main>
    </div>
  );
}
