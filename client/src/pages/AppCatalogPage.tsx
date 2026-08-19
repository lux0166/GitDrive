import React, { useState, useEffect } from 'react';
import {
  Package,
  Download,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Release } from '../types/client.types.js';
import styles from './AppCatalogPage.module.css';

interface AppCatalogProps {
  onNavigate: (tab: string, contextId?: string) => void;
}

export const AppCatalogPage: React.FC<AppCatalogProps> = ({ onNavigate }) => {
  const [catalog, setCatalog] = useState<Release[]>([]);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/catalog');
      const data: Release[] = await res.json();
      setCatalog(data);
    } catch (err) {
      console.error('Failed to fetch catalog', err);
    }
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const handleInstall = async (release: Release) => {
    try {
      setDownloadingId(release.id);
      await fetch(`/api/catalog/${release.id}/download`, { method: 'POST' });
      setCatalog((prev) =>
        prev.map((r) => (r.id === release.id ? { ...r, downloadCount: r.downloadCount + 1 } : r))
      );
      setTimeout(() => {
        setDownloadingId(null);
        alert(`Successfully fetched ${release.artifacts[0]?.fileName} to local node.`);
      }, 500);
    } catch (err) {
      console.error('Download error', err);
      setDownloadingId(null);
    }
  };

  const platforms = [
    { id: 'all', label: 'All Packages' },
    { id: 'Windows', label: 'Windows (.exe / .msi)' },
    { id: 'Linux', label: 'Linux (.tar.gz)' },
    { id: '.NET 8', label: '.NET 8 Daemons' },
  ];

  const filteredReleases = catalog.filter((r) => {
    if (filterPlatform === 'all') return true;
    return r.artifacts.some((a) => a.platform.toLowerCase().includes(filterPlatform.toLowerCase()));
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>LAN Application Store</h1>
      </div>

      {/* Filter Ribbon with Count Badges */}
      <div className={styles.filterRibbon}>
        {platforms.map((p) => {
          const isActive = filterPlatform === p.id;
          const count =
            p.id === 'all'
              ? catalog.length
              : catalog.filter((r) =>
                  r.artifacts.some((a) =>
                    a.platform.toLowerCase().includes(p.id.toLowerCase())
                  )
                ).length;
          return (
            <button
              key={p.id}
              type="button"
              className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterPlatform(p.id)}
            >
              <span>{p.label}</span>
              <span className={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Package Distribution Cards */}
      <div className={styles.cardsGrid}>
        {filteredReleases.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', background: '#121215', borderRadius: '8px', border: '1px solid #27272a', gridColumn: '1 / -1' }}>
            <Package size={36} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '15px', color: '#f4f4f5' }}>No Packages in LAN Catalog</h3>
            <p style={{ color: '#71717a', fontSize: '13px', margin: '0 0 20px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
              Verified binary releases and installer packages will appear here automatically after pipeline runs pass and publish artifacts.
            </p>
            <button type="button" className="btn-secondary" onClick={() => onNavigate('repositories')}>
              <span>View Hosted Repositories</span>
            </button>
          </div>
        ) : (
          filteredReleases.map((rel) => {
            const mainArtifact = rel.artifacts[0];
            return (
              <div key={rel.id} className={styles.packageCard}>
                {/* Top Half: Icon, Name, Version, Platform Pill */}
                <div className={styles.packageTopHalf}>
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.pkgIconBox}>
                      <Package size={18} />
                    </div>
                    <div className={styles.pkgInfo}>
                      <h2 className={styles.pkgTitle}>{rel.title || rel.repoName}</h2>
                      <span className={styles.pkgVersion}>{rel.tagName}</span>
                    </div>
                    <span className="status-pill neutral">{mainArtifact?.platform || 'Universal'}</span>
                  </div>
                </div>

                {/* Bottom Panel: Clean 2-Tier Non-Wrapping Metadata */}
                <div className={styles.packageBottomPanel}>
                  {/* Tier 1: File Name & Non-Wrapping File Size */}
                  <div className={styles.fileSpecsRow}>
                    <code className={styles.fileName}>{mainArtifact?.fileName}</code>
                    <span className={styles.dotDivider}>•</span>
                    <span className={styles.fileSize}>
                      {mainArtifact ? `${(mainArtifact.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : ''}
                    </span>
                  </div>

                  {/* Tier 2: SHA-256 Provenance & Copy */}
                  <div className={styles.shaRow}>
                    <div className={styles.shaGroup}>
                      <span className={styles.shaLabel}>SHA-256:</span>
                      <code className={styles.shaCode}>
                        {mainArtifact?.sha256.substring(0, 14)}...
                      </code>
                    </div>
                    {mainArtifact && (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleCopySha(mainArtifact.sha256)}
                        title="Copy Checksum"
                        aria-label="Copy SHA-256 checksum"
                      >
                        {copiedSha === mainArtifact.sha256 ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Actions: Commit Link & 1-Click Install */}
                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => onNavigate('repositories', rel.repoId)}
                    >
                      <span>Commit {rel.commitSha.substring(0, 7)}</span>
                      <ExternalLink size={11} />
                    </button>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleInstall(rel)}
                      disabled={downloadingId === rel.id}
                    >
                      <Download size={13} />
                      <span>{downloadingId === rel.id ? 'Installing...' : '1-Click Install'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
