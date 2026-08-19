import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Copy,
  Check,
  Download,
  RotateCw,
  Search,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { PipelineRun } from '../types/client.types.js';
import styles from './PipelineRunPage.module.css';

interface PipelineRunProps {
  runId?: string;
  onNavigate: (tab: string, contextId?: string) => void;
}

export const PipelineRunPage: React.FC<PipelineRunProps> = ({
  runId: initialRunId,
  onNavigate,
}) => {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string>(initialRunId || '');
  const [activeRun, setActiveRun] = useState<PipelineRun | null>(null);
  const [logFilter, setLogFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedLog, setCopiedLog] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRuns();
  }, []);

  useEffect(() => {
    if (initialRunId) {
      setActiveRunId(initialRunId);
    }
  }, [initialRunId]);

  useEffect(() => {
    if (!activeRunId) return;

    // Connect to Server-Sent Events (SSE) for live streaming
    const eventSource = new EventSource(`/api/runs/${activeRunId}/logs/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init' || data.type === 'update') {
          setActiveRun(data.run);
        } else if (data.type === 'log') {
          setActiveRun((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              logs: [...prev.logs, data.entry],
            };
          });
        }
      } catch (err) {
        console.error('Error parsing SSE event', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error or closed', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [activeRunId]);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRun?.logs, autoScroll]);

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/runs');
      const data: PipelineRun[] = await res.json();
      setRuns(data);
      if (!activeRunId && data.length > 0) {
        setActiveRunId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch runs', err);
    }
  };

  const handleCopyLogs = () => {
    if (!activeRun) return;
    const text = activeRun.logs.map((l) => `[${l.timestamp}] [${l.stream}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedHash(sha);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredLogs = activeRun?.logs.filter((l) =>
    l.text.toLowerCase().includes(logFilter.toLowerCase())
  ) || [];

  return (
    <div className={styles.container}>
      {/* Top Selector & Run Summary */}
      <div className={styles.topBar}>
        <div className={styles.runPickerGroup}>
          <label htmlFor="run-select" className={styles.pickerLabel}>
            Pipeline Run:
          </label>
          {runs.length > 0 ? (
            <select
              id="run-select"
              className={styles.runSelect}
              value={activeRunId}
              onChange={(e) => setActiveRunId(e.target.value)}
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.repoName} — {r.id} ({r.status})
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '13px', color: '#71717a', fontStyle: 'italic' }}>No runs recorded</span>
          )}
        </div>

        {activeRun && (
          <div className={styles.runMetaPills}>
            <div className="status-pill neutral">
              {activeRun.status === 'passed' && <CheckCircle2 size={12} />}
              {activeRun.status === 'failed' && <XCircle size={12} />}
              {activeRun.status === 'running' && <RotateCw size={12} className={styles.spin} />}
              <span>{activeRun.status}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Commit:</span>
              <code className={styles.metaCode}>{activeRun.commitSha.substring(0, 7)}</code>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Duration:</span>
              <span className={styles.metaValue}>
                {activeRun.duration ? `${activeRun.duration}s` : 'running...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {runs.length === 0 && (
        <div style={{ padding: '60px 24px', textAlign: 'center', background: '#121215', borderRadius: '8px', border: '1px solid #27272a', margin: '20px 0' }}>
          <Terminal size={36} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '15px', color: '#f4f4f5' }}>No Pipeline Executions Yet</h3>
          <p style={{ color: '#71717a', fontSize: '13px', margin: '0 0 20px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
            Trigger a workflow pipeline execution from Workflow Studio to stream real-time logs and build artifacts here.
          </p>
          <button type="button" className="btn-secondary" onClick={() => onNavigate('workflow-studio')}>
            <span>Open Workflow Studio</span>
          </button>
        </div>
      )}

      {/* Stage Progress Ribbon */}
      {activeRun && (
        <div className={styles.stagesBar}>
          <div className={styles.stagesTitle}>STAGES:</div>
          <div className={styles.stageCardsList}>
            {activeRun.nodes.map((node, i) => {
              const isCurrent = activeRun.currentStepId === node.id;
              const isPassed = node.status === 'success';
              const isRunning = node.status === 'running' || isCurrent;
              return (
                <div
                  key={node.id}
                  className={`${styles.stageCard} ${
                    isPassed ? styles.stagePassed : isRunning ? styles.stageRunning : styles.stagePending
                  }`}
                >
                  <div className={styles.stageHeader}>
                    <span className={styles.stageNumber}>{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
                    {isPassed ? (
                      <CheckCircle2 size={13} />
                    ) : isRunning ? (
                      <RotateCw size={13} className={styles.spin} />
                    ) : (
                      <Clock size={13} />
                    )}
                  </div>
                  <div className={styles.stageName}>{node.name}</div>
                  <div className={styles.stageDuration}>
                    {node.duration !== undefined ? `${node.duration}s` : isRunning ? 'active' : 'pending'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal Live Log Streamer */}
      <div className={styles.terminalContainer}>
        <div className={styles.terminalHeader}>
          <div className={styles.terminalTitleWrap}>
            <Terminal size={14} color="#FFFFFF" />
            <span className={styles.terminalTitle}>Runner Log Stream</span>
            <div className="status-pill neutral">
              <ShieldCheck size={11} />
              <span>Sandbox Attached</span>
            </div>
          </div>

          <div className={styles.terminalControls}>
            <div className={styles.searchWrap}>
              <Search size={12} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Filter output..."
                className={styles.searchInput}
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                aria-label="Filter terminal logs"
              />
            </div>

            <button
              type="button"
              className={`btn-ghost ${autoScroll ? styles.btnAutoScrollActive : ''}`}
              onClick={() => setAutoScroll(!autoScroll)}
              title="Toggle Auto Scroll"
            >
              <span>Auto-scroll</span>
            </button>

            <button type="button" className="btn-secondary" onClick={handleCopyLogs}>
              {copiedLog ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedLog ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className={styles.terminalBody}>
          {filteredLogs.length === 0 ? (
            <div className={styles.emptyLogs}>Waiting for runner log stream...</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`${styles.logLine} ${
                  log.stream === 'system'
                    ? styles.logSystem
                    : log.stream === 'stderr'
                    ? styles.logStderr
                    : styles.logStdout
                }`}
              >
                <span className={styles.logTimestamp}>{log.timestamp.substring(11, 19)}</span>
                <span className={styles.logText}>{log.text}</span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Artifacts Produced Section */}
      {activeRun && activeRun.artifacts.length > 0 && (
        <div className={styles.artifactsBox}>
          <div className={styles.artifactsHeader}>
            <div className={styles.artifactsTitleWrap}>
              <Package size={16} />
              <h2 className={styles.artifactsTitle}>Produced Release Artifacts</h2>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate('app-catalog')}
            >
              <Package size={13} />
              <span>Go to LAN App Catalog</span>
            </button>
          </div>

          <div className={styles.artifactList}>
            {activeRun.artifacts.map((art) => (
              <div key={art.id} className={styles.artifactCard}>
                <div className={styles.artLeft}>
                  <div className={styles.artNameWrap}>
                    <span className={styles.artName}>{art.name}</span>
                    <span className="status-pill neutral">{art.platform}</span>
                  </div>
                  <div className={styles.artFileMeta}>
                    <code className={styles.artFileName}>{art.fileName}</code>
                    <span>• {(art.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  <div className={styles.shaWrap}>
                    <span className={styles.shaLabel}>SHA-256:</span>
                    <code className={styles.shaCode}>{art.sha256}</code>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handleCopySha(art.sha256)}
                      title="Copy Checksum"
                    >
                      {copiedHash === art.sha256 ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className={styles.artRight}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      alert(`Downloading ${art.fileName} from Local LAN store.`);
                    }}
                  >
                    <Download size={13} />
                    <span>Download Binary</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
