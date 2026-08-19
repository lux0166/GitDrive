import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Cpu,
  PlayCircle,
  Package,
  Sun,
  Moon,
  ShieldCheck,
  Server,
  Activity,
  HardDrive,
} from 'lucide-react';
import styles from './Shell.module.css';

interface ShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ currentTab, onTabChange, children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = (e: React.MouseEvent) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 380ms Corner Sweep with View Transitions API & prefers-reduced-motion guard
    if (!document.startViewTransition || prefersReduced) {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    // max distance to all 4 corners + 150px safety buffer
    const endRadius =
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ) + 150;

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 380,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'workflow-studio', label: 'Workflow Intelligence', icon: Cpu },
    { id: 'pipeline-runs', label: 'GitActions Runs', icon: PlayCircle },
    { id: 'app-catalog', label: 'LAN App Store', icon: Package },
    { id: 'settings', label: 'LAN Security & Fleet', icon: ShieldCheck },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Synchronized 52px Brand Header */}
        <button
          type="button"
          className={styles.brandButton}
          onClick={() => onTabChange('dashboard')}
          aria-label="Go to GitDrive Dashboard"
        >
          <div className={styles.logoBadge}>
            <HardDrive size={18} className={styles.logoIcon} aria-hidden="true" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>GitDrive</span>
            <span className={styles.brandTag}>Local-First Delivery</span>
          </div>
        </button>

        <nav className={styles.nav} aria-label="Sidebar Navigation">
          <div className={styles.navSectionLabel}>Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
                {isActive && <div className={styles.activeIndicator} aria-hidden="true" />}
              </button>
            );
          })}
        </nav>

        {/* Local Network Status Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.lanStatusCard}>
            <div className={styles.lanStatusHeader}>
              <span className={styles.lanStatusTitle}>Private LAN</span>
              <span className="status-pill success">
                <span aria-hidden="true">●</span> Online
              </span>
            </div>
            <p className={styles.lanStatusDesc}>Air-gapped boundary active. Zero telemetry egress.</p>
            <div className={styles.lanNodeInfo}>
              <Server size={12} aria-hidden="true" />
              <span>gitdrive.local</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        {/* Synchronized 52px Sticky Header */}
        <header className={`${styles.header} sticky-header`}>
          <div className={styles.headerLeft}>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbRoot}>GitDrive</span>
              <span className={styles.breadcrumbDivider}>/</span>
              <span className={styles.breadcrumbActive}>
                {navItems.find((n) => n.id === currentTab)?.label || currentTab}
              </span>
            </div>
            <div className="status-pill success">
              <ShieldCheck size={12} aria-hidden="true" />
              <span>Isolated LAN Runner Active</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button
              type="button"
              className="btn-ghost"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className={styles.userProfile}
              aria-label="User Profile: Tran Huy (LAN Admin)"
              onClick={() => onTabChange('settings')}
            >
              <div className={styles.avatar}>TH</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>Tran Huy</span>
                <span className={styles.userRole}>LAN Admin</span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className={styles.contentViewport}>{children}</main>
      </div>
    </div>
  );
};
