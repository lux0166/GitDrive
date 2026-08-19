import React, { useState } from 'react';
import {
  Server,
  Radio,
  Save,
  Check,
  EyeOff,
} from 'lucide-react';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const [networkMode, setNetworkMode] = useState<'airgapped' | 'lan-only' | 'controlled'>('lan-only');
  const [egressBlocked, setEgressBlocked] = useState(true);
  const [secretsMasking, setSecretsMasking] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Settings Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>LAN Policy & Runner Fleet Security</h1>
          <p className={styles.subtitle}>
            Configure private LAN isolation boundaries, egress controls, and execution sandbox policies.
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={handleSave}>
          {saved ? <Check size={14} color="#22C55E" /> : <Save size={14} />}
          <span>{saved ? 'Policy Saved' : 'Save Policy Settings'}</span>
        </button>
      </div>

      <div className={styles.grid}>
        {/* Network Boundary Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <Radio size={16} color="var(--color-primary)" />
              <h2>LAN Operating Mode</h2>
            </div>
          </div>

          <div className={styles.modeOptions}>
            <button
              type="button"
              className={`${styles.modeOption} ${networkMode === 'airgapped' ? styles.modeOptionActive : ''}`}
              onClick={() => setNetworkMode('airgapped')}
            >
              <div className={styles.modeRadio}>
                {networkMode === 'airgapped' && <div className={styles.radioInner} />}
              </div>
              <div className={styles.modeInfo}>
                <div className={styles.modeNameWrap}>
                  <span className={styles.modeName}>Mode B: Strict Air-Gapped</span>
                  <span className="status-pill danger">Offline Only</span>
                </div>
                <p className={styles.modeDesc}>
                  Zero external DNS, zero internet HTTP/HTTPS egress. Runners only resolve internal LAN package mirrors.
                </p>
              </div>
            </button>

            <button
              type="button"
              className={`${styles.modeOption} ${networkMode === 'lan-only' ? styles.modeOptionActive : ''}`}
              onClick={() => setNetworkMode('lan-only')}
            >
              <div className={styles.modeRadio}>
                {networkMode === 'lan-only' && <div className={styles.radioInner} />}
              </div>
              <div className={styles.modeInfo}>
                <div className={styles.modeNameWrap}>
                  <span className={styles.modeName}>Mode A: Private LAN-First (Default)</span>
                  <span className="status-pill success">Recommended</span>
                </div>
                <p className={styles.modeDesc}>
                  Primary operations remain strictly within local subnet. Local runners execute isolated processes without sending code or artifacts off-premises.
                </p>
              </div>
            </button>

            <button
              type="button"
              className={`${styles.modeOption} ${networkMode === 'controlled' ? styles.modeOptionActive : ''}`}
              onClick={() => setNetworkMode('controlled')}
            >
              <div className={styles.modeRadio}>
                {networkMode === 'controlled' && <div className={styles.radioInner} />}
              </div>
              <div className={styles.modeInfo}>
                <div className={styles.modeNameWrap}>
                  <span className={styles.modeName}>Mode C: Controlled LAN Egress</span>
                  <span className="status-pill warning">Allowlisted</span>
                </div>
                <p className={styles.modeDesc}>
                  Allowlisted package registry mirrors only (e.g., enterprise npm/nuget proxies). Telemetry and source code strictly retained locally.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Security & Sandbox Policies Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <EyeOff size={16} color="var(--color-primary)" />
              <h2>Runner Sandbox & Masking</h2>
            </div>
          </div>

          <div className={styles.toggleList}>
            <div className={styles.toggleItem}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Real-time Secret Masking</span>
                <p className={styles.toggleDesc}>
                  Automatically redact environment variables, passwords, and private tokens from live SSE log streams.
                </p>
              </div>
              <input
                type="checkbox"
                checked={secretsMasking}
                onChange={(e) => setSecretsMasking(e.target.checked)}
                className={styles.checkbox}
                aria-label="Toggle Real-time Secret Masking"
              />
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Block External HTTP Egress</span>
                <p className={styles.toggleDesc}>
                  Drop non-LAN network packets initiated by build child processes during compilation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={egressBlocked}
                onChange={(e) => setEgressBlocked(e.target.checked)}
                className={styles.checkbox}
                aria-label="Toggle Block External HTTP Egress"
              />
            </div>
          </div>

          {/* Local Fleet Status */}
          <div className={styles.fleetCard}>
            <div className={styles.fleetHeader}>
              <Server size={14} />
              <span className={styles.fleetTitle}>Local Runner Fleet</span>
            </div>
            <div className={styles.fleetList}>
              <div className={styles.fleetRow}>
                <span className={styles.fleetNodeName}>runner-lan-01 (Host Daemon)</span>
                <span className="status-pill success">Idle / Ready</span>
              </div>
              <div className={styles.fleetRow}>
                <span className={styles.fleetNodeName}>runner-sandbox-02 (Process Jail)</span>
                <span className="status-pill success">Idle / Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
