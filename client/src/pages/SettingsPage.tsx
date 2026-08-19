import React, { useState, useEffect } from 'react';
import {
  Server,
  Radio,
  Save,
  Check,
  EyeOff,
  Plus,
  Trash2,
  ShieldCheck,
  KeyRound,
  RotateCw,
  User,
} from 'lucide-react';
import { GitDriveSettings, RunnerNode, NetworkMode } from '../types/client.types.js';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<GitDriveSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSecretPattern, setNewSecretPattern] = useState('');
  const [newRunnerName, setNewRunnerName] = useState('');
  const [newRunnerType, setNewRunnerType] = useState<RunnerNode['type']>('process-jail');
  const [newRunnerConcurrency, setNewRunnerConcurrency] = useState(2);
  const [showAddRunner, setShowAddRunner] = useState(false);

  // Operator Profile state
  const [profile, setProfile] = useState<{ displayName: string; role: string; username: string; hostname: string; initials: string }>({
    displayName: '',
    role: 'LAN Admin',
    username: '',
    hostname: '',
    initials: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: profile.displayName, role: profile.role }),
      });
      const data = await res.json();
      setProfile(data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      const data: GitDriveSettings = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const updated: GitDriveSettings = await res.json();
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModeChange = (mode: NetworkMode) => {
    if (!settings) return;
    setSettings({ ...settings, networkMode: mode });
  };

  const handleAddSecret = async () => {
    if (!newSecretPattern.trim()) return;
    try {
      const res = await fetch('/api/settings/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: newSecretPattern.trim() }),
      });
      const updated: GitDriveSettings = await res.json();
      setSettings(updated);
      setNewSecretPattern('');
    } catch (err) {
      console.error('Failed to add secret pattern', err);
    }
  };

  const handleRemoveSecret = async (pattern: string) => {
    try {
      const res = await fetch('/api/settings/secrets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
      });
      const updated: GitDriveSettings = await res.json();
      setSettings(updated);
    } catch (err) {
      console.error('Failed to remove secret pattern', err);
    }
  };

  const handleRegisterRunner = async () => {
    if (!newRunnerName.trim()) return;
    try {
      const res = await fetch('/api/settings/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRunnerName.trim(),
          type: newRunnerType,
          concurrency: newRunnerConcurrency,
        }),
      });
      const runner: RunnerNode = await res.json();
      setSettings((prev: GitDriveSettings | null) =>
        prev ? { ...prev, runners: [...prev.runners, runner] } : null
      );
      setNewRunnerName('');
      setShowAddRunner(false);
    } catch (err) {
      console.error('Failed to register runner', err);
    }
  };

  const handleDeregisterRunner = async (id: string) => {
    try {
      await fetch(`/api/settings/runners/${id}`, { method: 'DELETE' });
      setSettings((prev: GitDriveSettings | null) =>
        prev ? { ...prev, runners: prev.runners.filter((r: RunnerNode) => r.id !== id) } : null
      );
    } catch (err) {
      console.error('Failed to deregister runner', err);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className={styles.loadingContainer}>
        <RotateCw size={18} className={styles.spin} />
        <span>Loading security & fleet policies...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>LAN Policy & Runner Fleet Security</h1>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {saveSuccess ? <Check size={14} /> : <Save size={14} />}
          <span>{saveSuccess ? 'Policy Saved' : 'Save Policy Settings'}</span>
        </button>
      </div>

      <div className={styles.grid}>
        {/* Card 0: Operator Identity & Profile */}
        <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <User size={16} />
              <h2>Operator Profile & Node Identity</h2>
            </div>
            <span className="status-pill neutral">Local Node: {profile.hostname}</span>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '14px', alignItems: 'flex-end', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Operator Display Name (OS Username: {profile.username})</label>
              <input
                type="text"
                placeholder={profile.username || 'e.g. Developer'}
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className={styles.textInput}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>LAN Role & Privilege</label>
              <select
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className={styles.selectInput}
              >
                <option value="LAN Admin">LAN Admin</option>
                <option value="DevOps Lead">DevOps Lead</option>
                <option value="Security Officer">Security Officer</option>
                <option value="Software Engineer">Software Engineer</option>
              </select>
            </div>

            <div>
              <button type="submit" className="btn-secondary" disabled={isSavingProfile}>
                {profileSuccess ? <Check size={14} /> : <Save size={14} />}
                <span>{profileSuccess ? 'Updated' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 1: LAN Operating Mode */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <Radio size={16} />
              <h2>LAN Operating Mode</h2>
            </div>
            <span className="status-pill neutral">{settings.networkMode}</span>
          </div>

          <div className={styles.modeOptions}>
            <div
              role="button"
              tabIndex={0}
              className={`${styles.modeOption} ${
                settings.networkMode === 'airgapped' ? styles.modeOptionActive : ''
              }`}
              onClick={() => handleModeChange('airgapped')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleModeChange('airgapped');
              }}
            >
              <div className={styles.modeRadio}>
                {settings.networkMode === 'airgapped' && <div className={styles.radioInner} />}
              </div>
              <div className={styles.modeInfo}>
                <div className={styles.modeNameWrap}>
                  <span className={styles.modeName}>Strict Air-Gapped Mode</span>
                  <span className="status-pill neutral">Offline Only</span>
                </div>
                <p className={styles.modeDesc}>
                  Zero external DNS, zero internet HTTP/HTTPS egress. Runners only resolve internal LAN package mirrors.
                </p>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              className={`${styles.modeOption} ${
                settings.networkMode === 'lan-only' ? styles.modeOptionActive : ''
              }`}
              onClick={() => handleModeChange('lan-only')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleModeChange('lan-only');
              }}
            >
              <div className={styles.modeRadio}>
                {settings.networkMode === 'lan-only' && <div className={styles.radioInner} />}
              </div>
              <div className={styles.modeInfo}>
                <div className={styles.modeNameWrap}>
                  <span className={styles.modeName}>Private LAN-First Mode (Default)</span>
                  <span className="status-pill neutral">Recommended</span>
                </div>
                <p className={styles.modeDesc}>
                  Primary operations remain strictly within local subnet. Local runners execute isolated processes without sending code or artifacts off-premises.
                </p>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              className={`${styles.modeOption} ${
                settings.networkMode === 'controlled' ? styles.modeOptionActive : ''
              }`}
              onClick={() => handleModeChange('controlled')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleModeChange('controlled');
              }}
            >
              <div className={styles.modeRadio}>
                {settings.networkMode === 'controlled' && <div className={styles.radioInner} />}
              </div>
              <div className={styles.modeInfo}>
                <div className={styles.modeNameWrap}>
                  <span className={styles.modeName}>Controlled LAN Egress Mode</span>
                  <span className="status-pill neutral">Allowlisted</span>
                </div>
                <p className={styles.modeDesc}>
                  Allowlisted package registry mirrors only (e.g. enterprise npm/nuget proxies). Telemetry and source code strictly retained locally.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Runner Sandbox & Egress Policy */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <ShieldCheck size={16} />
              <h2>Execution Sandbox & Policy Controls</h2>
            </div>
          </div>

          <div className={styles.toggleList}>
            <div className={styles.toggleItem}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Block External HTTP/HTTPS Egress</span>
                <p className={styles.toggleDesc}>
                  Drop non-LAN network packets initiated by build child processes during compilation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.blockExternalEgress}
                onChange={(e) =>
                  setSettings({ ...settings, blockExternalEgress: e.target.checked })
                }
                className={styles.checkbox}
                aria-label="Toggle Block External HTTP Egress"
              />
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Real-time Secret Redaction</span>
                <p className={styles.toggleDesc}>
                  Automatically mask sensitive environment variables and credentials from live SSE log streams.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSecretMasking}
                onChange={(e) =>
                  setSettings({ ...settings, enableSecretMasking: e.target.checked })
                }
                className={styles.checkbox}
                aria-label="Toggle Real-time Secret Masking"
              />
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Enforce SHA-256 Provenance Checksums</span>
                <p className={styles.toggleDesc}>
                  Validate cryptographic hashes before allowing binary distribution to LAN workstations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.enforceShaProvenance}
                onChange={(e) =>
                  setSettings({ ...settings, enforceShaProvenance: e.target.checked })
                }
                className={styles.checkbox}
                aria-label="Toggle Enforce SHA-256 Provenance"
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Artifact Retention Period (Days)</span>
                <p className={styles.toggleDesc}>
                  Number of days compiled binaries are stored in local disk cache before auto-archiving.
                </p>
              </div>
              <input
                type="number"
                min={1}
                max={365}
                value={settings.artifactRetentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    artifactRetentionDays: parseInt(e.target.value, 10) || 30,
                  })
                }
                className={styles.numberInput}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Real-time Secret Masking Patterns */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <EyeOff size={16} />
              <h2>Configured Secret Masking Patterns</h2>
            </div>
            <span className="status-pill neutral">{settings.customSecretPatterns.length} Patterns</span>
          </div>

          <div className={styles.secretsList}>
            {settings.customSecretPatterns.map((pat: string) => (
              <div key={pat} className={styles.secretItem}>
                <code className={styles.secretCode}>{pat}</code>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => handleRemoveSecret(pat)}
                  title="Remove pattern"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.addSecretForm}>
            <input
              type="text"
              placeholder="Add secret pattern (e.g. JWT_LAN_SECRET)..."
              value={newSecretPattern}
              onChange={(e) => setNewSecretPattern(e.target.value)}
              className={styles.textInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSecret();
              }}
            />
            <button type="button" className="btn-secondary" onClick={handleAddSecret}>
              <Plus size={13} />
              <span>Add Pattern</span>
            </button>
          </div>
        </div>

        {/* Card 4: Local Runner Fleet Management */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <Server size={16} />
              <h2>Local Runner Fleet Nodes</h2>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddRunner(!showAddRunner)}
            >
              <Plus size={13} />
              <span>{showAddRunner ? 'Close' : 'Register Runner'}</span>
            </button>
          </div>

          {showAddRunner && (
            <div className={styles.addRunnerBox}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Node Name:</label>
                <input
                  type="text"
                  placeholder="e.g. runner-worker-03"
                  className={styles.textInput}
                  value={newRunnerName}
                  onChange={(e) => setNewRunnerName(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Jail Type:</label>
                <select
                  className={styles.selectInput}
                  value={newRunnerType}
                  onChange={(e) => setNewRunnerType(e.target.value as any)}
                >
                  <option value="host-daemon">host-daemon</option>
                  <option value="process-jail">process-jail</option>
                  <option value="container-lan">container-lan</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Max Concurrency:</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  className={styles.numberInput}
                  value={newRunnerConcurrency}
                  onChange={(e) => setNewRunnerConcurrency(parseInt(e.target.value, 10) || 2)}
                />
              </div>

              <button type="button" className="btn-primary" onClick={handleRegisterRunner}>
                <span>Save Runner Node</span>
              </button>
            </div>
          )}

          <div className={styles.runnerList}>
            {settings.runners.map((r: RunnerNode) => (
              <div key={r.id} className={styles.runnerRow}>
                <div className={styles.runnerInfo}>
                  <span className={styles.runnerName}>{r.name}</span>
                  <div className={styles.runnerMeta}>
                    <span className="status-pill neutral">{r.type}</span>
                    <span>• {r.concurrency} concurrent slots</span>
                  </div>
                </div>

                <div className={styles.runnerActions}>
                  <span className="status-pill neutral">{r.status}</span>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleDeregisterRunner(r.id)}
                    title="Deregister Runner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.gpgKeyRow}>
            <div className={styles.gpgInfo}>
              <KeyRound size={14} />
              <span>GPG Signer Key:</span>
              <code className={styles.gpgCode}>{settings.lanSigningKeyId}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
