import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Cpu,
  PlayCircle,
  Package,
  Sun,
  Moon,
  Settings,
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
  const [profile, setProfile] = useState<{ displayName: string; role: string; initials: string; hostname: string }>({
    displayName: 'Operator',
    role: 'LAN Admin',
    initials: 'OP',
    hostname: 'gitdrive.local',
  });

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [lanStatus, setLanStatus] = useState<'Online' | 'Offline' | 'Connecting...'>('Connecting...');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && data.displayName) {
          setProfile(data);
          setLanStatus('Online');
        }
      })
      .catch(() => {
        setLanStatus('Offline');
      })
      .finally(() => {
        setIsProfileLoading(false);
      });
  }, []);

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
    { id: 'settings', label: 'Settings & Security', icon: Settings },
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
              <span
                className={`status-pill ${
                  lanStatus === 'Online'
                    ? 'success'
                    : lanStatus === 'Offline'
                    ? 'danger'
                    : 'neutral'
                }`}
                aria-live="polite"
              >
                {lanStatus}
              </span>
            </div>
            <div className={styles.lanNodeInfo}>
              <Server size={12} aria-hidden="true" />
              <span>{profile.hostname}</span>
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
          </div>

          <div className={styles.headerRight}>
            {/* Quick Settings Icon Button in Header */}
            <button
              type="button"
              className={`btn-ghost ${currentTab === 'settings' ? styles.settingsBtnActive : ''}`}
              onClick={() => onTabChange('settings')}
              title="Open Settings & Security"
              aria-label="Open Settings"
            >
              <Settings size={16} aria-hidden="true" />
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="btn-ghost"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>

            {/* Dynamic User Profile */}
            <button
              type="button"
              className={styles.userProfile}
              aria-label={
                isProfileLoading
                  ? 'Loading user profile...'
                  : `User Profile: ${profile.displayName} (${profile.role})`
              }
              onClick={() => onTabChange('settings')}
            >
              <div className={styles.avatar}>{isProfileLoading ? '…' : profile.initials}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {isProfileLoading ? 'Loading…' : profile.displayName}
                </span>
                <span className={styles.userRole}>{profile.role}</span>
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
