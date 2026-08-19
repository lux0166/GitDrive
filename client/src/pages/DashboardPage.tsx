import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Cpu,
  Package,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Server,
  HardDrive,
  Activity,
  Terminal,
} from 'lucide-react';
import { Repository, PipelineRun, Release } from '../types/client.types.js';
import styles from './DashboardPage.module.css';

interface DashboardProps {
  onNavigate: (tab: string, contextId?: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reposRes, runsRes, relsRes] = await Promise.all([
        fetch('/api/repos'),
        fetch('/api/runs'),
        fetch('/api/catalog'),
      ]);
      const [reposData, runsData, relsData] = await Promise.all([
        reposRes.json(),
        runsRes.json(),
        relsRes.json(),
      ]);
      setRepos(reposData);
      setRuns(runsData);
      setReleases(relsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Precision Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Delivery Overview</h1>
          <p className={styles.subtitle}>
            Local-first software compilation, automated workflow inference, and internal LAN distribution.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('workflow-studio')}
          >
            <Cpu size={14} />
            <span>Workflow Studio</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate('app-catalog')}
          >
            <Package size={14} />
            <span>Browse LAN Catalog</span>
          </button>
        </div>
      </div>

      {/* Unified 3-Column Metric Cards Grid (DealSpace 2-Tier Architecture) */}
      <div className={styles.metricsGrid}>
        {/* Metric 1: Hosted Repos */}
        <div className={styles.twoTierCard}>
          <div className={styles.cardTopHalf}>
            <div className={styles.metricIconBox}>
              <FolderGit2 size={16} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Hosted Repositories</span>
              <span className={styles.metricValue}>{repos.length}</span>
            </div>
          </div>
          <div className={styles.cardBottomPanel}>
            <span className={styles.bottomLabel}>Local Filesystem Storage</span>
            <span className="status-pill info">Private LAN</span>
          </div>
        </div>

        {/* Metric 2: Successful Deliveries */}
        <div className={styles.twoTierCard}>
          <div className={styles.cardTopHalf}>
            <div className={styles.metricIconBoxSuccess}>
              <CheckCircle2 size={16} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Successful Deliveries</span>
              <span className={styles.metricValue}>
                {runs.filter((r) => r.status === 'passed').length}
              </span>
            </div>
          </div>
          <div className={styles.cardBottomPanel}>
            <span className={styles.bottomLabel}>Execution Sandbox</span>
            <span className="status-pill success">100% Zero-Egress</span>
          </div>
        </div>

        {/* Metric 3: LAN Package Store */}
        <div className={styles.twoTierCard}>
          <div className={styles.cardTopHalf}>
            <div className={styles.metricIconBoxAccent}>
              <Package size={16} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>LAN Packages Available</span>
              <span className={styles.metricValue}>{releases.length}</span>
            </div>
          </div>
          <div className={styles.cardBottomPanel}>
            <span className={styles.bottomLabel}>Cryptographic Provenance</span>
            <span className="status-pill neutral">SHA-256 Verified</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2-Column Responsive Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column (2-Span): Repositories & Execution Table */}
        <div className={styles.leftCol}>
          {/* Active Repositories */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <HardDrive size={15} color="var(--color-text-muted)" />
                <h2>Hosted Git Repositories</h2>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => onNavigate('repositories')}
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className={styles.repoList}>
              {repos.map((repo) => (
                <div
                  key={repo.id}
                  className={styles.repoRow}
                  onClick={() => onNavigate('repositories', repo.id)}
                >
                  <div className={styles.repoDetails}>
                    <div className={styles.repoNameRow}>
                      <span className={styles.repoName}>{repo.name}</span>
                      <span className="status-pill neutral">{repo.language}</span>
                    </div>
                    <span className={styles.repoDescription}>{repo.description}</span>
                  </div>

                  <div className={styles.repoActions}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('workflow-studio', repo.id);
                      }}
                      title="Inspect AST and workflow"
                    >
                      <Cpu size={13} />
                      <span>Inspect DAG</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Delivery Runs Table */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <Activity size={15} color="var(--color-text-muted)" />
                <h2>Recent Pipeline Runs</h2>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => onNavigate('pipeline-runs')}
              >
                <span>Full history</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className={styles.runsTable}>
              {runs.slice(0, 4).map((run) => (
                <div
                  key={run.id}
                  className={styles.runTableRow}
                  onClick={() => onNavigate('pipeline-runs', run.id)}
                >
                  <div className={styles.runStatusCol}>
                    <div
                      className={`status-pill ${
                        run.status === 'passed'
                          ? 'success'
                          : run.status === 'running'
                          ? 'info'
                          : run.status === 'failed'
                          ? 'danger'
                          : 'neutral'
                      }`}
                    >
                      {run.status}
                    </div>
                    <span className={styles.runRepoName}>{run.repoName}</span>
                  </div>

                  <div className={styles.runMetaCol}>
                    <code className={styles.runSha}>{run.commitSha.substring(0, 7)}</code>
                    <span className={styles.runDuration}>
                      <Clock size={11} />
                      <span>{run.duration ? `${run.duration}s` : 'running'}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Status & Ready-To-Install Binaries */}
        <div className={styles.rightCol}>
          {/* Network Boundary & Runner Fleet */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <ShieldCheck size={15} color="#22C55E" />
                <h2>LAN Security & Fleet</h2>
              </div>
            </div>

            <div className={styles.securityBox}>
              <div className={styles.boundaryInfo}>
                <div className={styles.boundaryDot} />
                <div className={styles.boundaryText}>
                  <span className={styles.boundaryTitle}>Private Air-Gap Guard Active</span>
                  <span className={styles.boundarySub}>No source code or telemetry egress</span>
                </div>
              </div>

              <div className={styles.fleetList}>
                <div className={styles.fleetItem}>
                  <Server size={13} />
                  <span>runner-lan-01 (Daemon)</span>
                  <span className="status-pill success">Ready</span>
                </div>
                <div className={styles.fleetItem}>
                  <Terminal size={13} />
                  <span>runner-sandbox-02</span>
                  <span className="status-pill success">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick App Catalog Highlights */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <Package size={15} color="var(--color-primary)" />
                <h2>LAN App Catalog</h2>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => onNavigate('app-catalog')}
              >
                <span>Store</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className={styles.catalogMiniList}>
              {releases.slice(0, 3).map((rel) => (
                <div key={rel.id} className={styles.catalogMiniCard}>
                  <div className={styles.miniCardInfo}>
                    <span className={styles.miniAppName}>{rel.title || rel.repoName}</span>
                    <code className={styles.miniTag}>{rel.tagName}</code>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onNavigate('app-catalog')}
                  >
                    <span>Install</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
