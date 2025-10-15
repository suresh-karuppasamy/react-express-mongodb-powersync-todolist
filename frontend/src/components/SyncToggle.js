import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import './SyncToggle.css';

const SyncToggle = ({ onSyncToggle, syncEnabled }) => {
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      // Auto-sync when coming back online
      if (syncEnabled) {
        handleSync();
      }
    };
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch sync status on mount
    fetchSyncStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncEnabled]);

  const fetchSyncStatus = async () => {
    try {
      const status = await userAPI.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleSync = async () => {
    if (!isConnected) return;
    
    setIsSyncing(true);
    try {
      const result = await userAPI.syncWithBackend();
      console.log('Manual sync completed:', result);
      setLastSyncResult(result);
      await fetchSyncStatus(); // Update sync status after sync
    } catch (error) {
      console.error('Sync failed:', error);
      setLastSyncResult({ error: error.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="sync-toggle-container">
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}>
          <div className="status-dot"></div>
          <span>{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="sync-controls">
        <label className="sync-toggle">
          <input
            type="checkbox"
            checked={syncEnabled}
            onChange={onSyncToggle}
            disabled={!isConnected}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">
            {syncEnabled ? 'Sync ON' : 'Sync OFF'}
          </span>
        </label>
        
        {isConnected && syncEnabled && (
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="sync-btn"
          >
            {isSyncing ? 'Syncing...' : '🔄 Sync Now'}
          </button>
        )}
      </div>

      <div className="sync-info">
        {!isConnected ? (
          <span className="offline-message">
            🔌 Working offline - Sync will happen when online
          </span>
        ) : syncEnabled ? (
          <span className="sync-message">
            ⚡ Sync enabled - Real-time sync with MongoDB active
          </span>
        ) : (
          <span className="no-sync-message">
            ⏸️ Sync disabled - Working with local storage only
          </span>
        )}
      </div>

      {syncStatus && (
        <div className="sync-stats">
          <div className="stat-item">
            <span className="stat-label">Local Users:</span>
            <span className="stat-value">{syncStatus.localUserCount}</span>
          </div>
          {syncStatus.mongoUserCount !== undefined && (
            <div className="stat-item">
              <span className="stat-label">MongoDB Users:</span>
              <span className="stat-value">{syncStatus.mongoUserCount}</span>
            </div>
          )}
          {syncStatus.syncInfo && (
            <div className="stat-item">
              <span className="stat-label">New to Sync:</span>
              <span className="stat-value">{syncStatus.syncInfo.newLocalUsers}</span>
            </div>
          )}
          <div className="stat-item">
            <span className="stat-label">Last Sync:</span>
            <span className="stat-value">
              {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </span>
          </div>
          {syncStatus.mongoStatus && (
            <div className="stat-item">
              <span className="stat-label">MongoDB:</span>
              <span className={`stat-value ${syncStatus.mongoStatus === 'MongoDB connected' ? 'connected' : 'disconnected'}`}>
                {syncStatus.mongoStatus === 'MongoDB connected' ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
          )}
        </div>
      )}

      {lastSyncResult && (
        <div className="sync-result">
          {lastSyncResult.error ? (
            <div className="sync-error">
              ❌ Sync failed: {lastSyncResult.error}
            </div>
          ) : (
            <div className="sync-success">
              ✅ {lastSyncResult.message}
              {lastSyncResult.newUsersSynced > 0 && (
                <span> - {lastSyncResult.newUsersSynced} new users synced</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncToggle;
