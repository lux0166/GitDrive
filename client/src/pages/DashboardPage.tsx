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
  const [runners, setRunners] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reposRes, runsRes, relsRes, settingsRes] = await Promise.all([
        fetch('/api/repos'),
        fetch('/api/runs'),
        fetch('/api/catalog'),
        fetch('/api/settings'),
      ]);
      const [reposData, runsData, relsData, settingsData] = await Promise.all([
        reposRes.json(),
        runsRes.json(),
        relsRes.json(),
        settingsRes.json(),
      ]);
      setRepos(reposData);
      setRuns(runsData);
      setReleases(relsData);
      setRunners(settingsData.runners || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Action Header */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Delivery Overview</h1>
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

      {/* Strict Monochrome Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        {/* Metric 1: Hosted Repos */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconBox}>
            <FolderGit2 size={18} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Hosted Repositories</span>
            <span className={styles.metricValue}>{repos.length}</span>
          </div>
        </div>

        {/* Metric 2: Successful Deliveries */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconBox}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Successful Deliveries</span>
            <span className={styles.metricValue}>
              {runs.filter((r) => r.status === 'passed').length}
            </span>
          </div>
        </div>

        {/* Metric 3: LAN Packages */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconBox}>
            <Package size={18} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>LAN Packages Available</span>
            <span className={styles.metricValue}>{releases.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2-Column Responsive Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Repositories & Execution Table */}
        <div className={styles.leftCol}>
          {/* Active Repositories */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <HardDrive size={15} />
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
                <Activity size={15} />
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
                    <div className="status-pill neutral">{run.status}</div>
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
          {/* Runner Fleet */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <ShieldCheck size={15} />
                <h2>LAN Security & Fleet</h2>
              </div>
            </div>

            <div className={styles.fleetList}>
              {runners.map((r) => (
                <div key={r.id} className={styles.fleetItem}>
                  {r.type === 'process-jail' ? <Terminal size={13} /> : <Server size={13} />}
                  <span>{r.name}</span>
                  <span className="status-pill neutral">{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick App Catalog Highlights */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <Package size={15} />
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
