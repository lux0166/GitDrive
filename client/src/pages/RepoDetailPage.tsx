import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Folder,
  File,
  GitBranch,
  GitCommit,
  Copy,
  Check,
  Cpu,
  FileCode,
} from 'lucide-react';
import {
  Repository,
  FileNode,
  FileBlob,
  Commit,
  DiffFile,
} from '../types/client.types.js';
import styles from './RepoDetailPage.module.css';

interface RepoDetailProps {
  repoId?: string;
  onNavigate: (tab: string, contextId?: string) => void;
}

export const RepoDetailPage: React.FC<RepoDetailProps> = ({
  repoId: initialRepoId,
  onNavigate,
}) => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepoId || '');
  const [repo, setRepo] = useState<Repository | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'commits' | 'diff'>('code');

  // Code Tab state
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('README.md');
  const [fileBlob, setFileBlob] = useState<FileBlob | null>(null);

  const [commits, setCommits] = useState<Commit[]>([]);
  const [diffs, setDiffs] = useState<DiffFile[]>([]);
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedBlob, setCopiedBlob] = useState(false);

  // New Repository Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [newRepoLang, setNewRepoLang] = useState('TypeScript');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    if (initialRepoId) {
      setSelectedRepoId(initialRepoId);
    }
  }, [initialRepoId]);

  useEffect(() => {
    if (selectedRepoId) {
      loadRepoData(selectedRepoId);
    }
  }, [selectedRepoId]);

  useEffect(() => {
    if (selectedRepoId && selectedFile) {
      loadFileBlob(selectedRepoId, selectedFile);
    }
  }, [selectedRepoId, selectedFile]);

  const fetchRepos = async () => {
    try {
      const res = await fetch('/api/repos');
      const data: Repository[] = await res.json();
      setRepos(data);
      if (!selectedRepoId && data.length > 0) {
        setSelectedRepoId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch repos', err);
    }
  };

  const loadRepoData = async (id: string) => {
    try {
      const [repoRes, treeRes, commitsRes, diffRes] = await Promise.all([
        fetch(`/api/repos/${id}`),
        fetch(`/api/repos/${id}/tree`),
        fetch(`/api/repos/${id}/commits`),
        fetch(`/api/repos/${id}/diff`),
      ]);

      const [repoData, treeData, commitsData, diffData] = await Promise.all([
        repoRes.json(),
        treeRes.json(),
        commitsRes.json(),
        diffRes.json(),
      ]);

      setRepo(repoData);
      setFileTree(treeData);
      setCommits(commitsData);
      setDiffs(diffData);

      const readme = treeData.find((f: FileNode) => f.name.toLowerCase().includes('readme'));
      if (readme) {
        setSelectedFile(readme.path);
      } else if (treeData.length > 0) {
        setSelectedFile(treeData[0].path);
      }
    } catch (err) {
      console.error('Failed to load repo data', err);
    }
  };

  const loadFileBlob = async (id: string, path: string) => {
    try {
      const res = await fetch(`/api/repos/${id}/blob?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setFileBlob(data);
      }
    } catch (err) {
      console.error('Failed to load file blob', err);
    }
  };

  const handleCopyCloneUrl = () => {
    if (!repo) return;
    const url = `git clone http://gitdrive.local/repos/${repo.id}.git`;
    navigator.clipboard.writeText(url);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleCopyBlob = () => {
    if (!fileBlob) return;
    navigator.clipboard.writeText(fileBlob.content);
    setCopiedBlob(true);
    setTimeout(() => setCopiedBlob(false), 2000);
  };

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) {
      setCreateError('Repository name is required');
      return;
    }
    try {
      setIsCreating(true);
      setCreateError('');
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRepoName.trim(),
          description: newRepoDesc.trim(),
          language: newRepoLang,
          isPrivate: newRepoPrivate,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create repository');
      }
      const created = await res.json();
      setIsCreateOpen(false);
      setNewRepoName('');
      setNewRepoDesc('');
      await fetchRepos();
      setSelectedRepoId(created.id);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const isMarkdown = selectedFile.toLowerCase().endsWith('.md');
  const codeLines = fileBlob?.content ? fileBlob.content.split('\n') : [];

  return (
    <div className={styles.container}>
      {/* Creation Modal */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '10px', padding: '24px', width: '480px', maxWidth: '90vw' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', margin: '0 0 16px' }}>Create Local Git Repository</h2>
            {createError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 12px' }}>{createError}</p>}
            <form onSubmit={handleCreateRepo}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Repository Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. inventory-service"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of service"
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>Primary Language / Manifest</label>
                <select
                  value={newRepoLang}
                  onChange={(e) => setNewRepoLang(e.target.value)}
                  style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                >
                  <option value="TypeScript">TypeScript (package.json + Vite/Node)</option>
                  <option value="JavaScript">JavaScript (Node.js)</option>
                  <option value="C#">C# / .NET 8 (.csproj)</option>
                  <option value="Rust">Rust (Cargo.toml)</option>
                  <option value="Go">Go (go.mod)</option>
                  <option value="Python">Python (pyproject.toml / requirements.txt)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="new-repo-private"
                  checked={newRepoPrivate}
                  onChange={(e) => setNewRepoPrivate(e.target.checked)}
                  style={{ accentColor: '#27272a', cursor: 'pointer' }}
                />
                <label htmlFor="new-repo-private" style={{ fontSize: '12px', color: '#d4d4d8', cursor: 'pointer' }}>
                  Private LAN Repository (Restricted to internal network nodes)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2-Tier Repo Header Card */}
      <div className={styles.repoHeaderCard}>
        <div className={styles.headerMainRow}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.repoTitleRow}>
              <div className={styles.repoIconBadge}>
                <FolderGit2 size={18} />
              </div>
              {repos.length > 0 ? (
                <select
                  className={styles.repoSelect}
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  aria-label="Select active repository"
                >
                  {repos.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#a1a1aa' }}>No Repositories Hosted</span>
              )}
              {repo && (
                <>
                  <span className="status-pill neutral">{repo.language || 'TypeScript'}</span>
                  <span className="status-pill neutral">{repo.isPrivate ? 'Private LAN' : 'Public LAN'}</span>
                </>
              )}
            </div>
            <p className={styles.repoDesc}>{repo?.description || 'Manage local Git repositories, inspect code trees, commits, and diffs.'}</p>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className="btn-secondary" onClick={() => setIsCreateOpen(true)}>
              <FolderGit2 size={13} />
              <span>+ New Repository</span>
            </button>
            {repo && (
              <>
                <button type="button" className="btn-secondary" onClick={handleCopyCloneUrl}>
                  {copiedClone ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedClone ? 'Clone URL Copied' : 'Clone URL'}</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onNavigate('workflow-studio', selectedRepoId)}
                >
                  <Cpu size={14} />
                  <span>Workflow Studio</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        {repo && (
          <div className={styles.tabsNav}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'code' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <FileCode size={14} />
              <span>Code & Files</span>
              <span className={styles.tabCount}>{fileTree.length}</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'commits' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('commits')}
            >
              <GitCommit size={14} />
              <span>Commits</span>
              <span className={styles.tabCount}>{commits.length}</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'diff' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('diff')}
            >
              <GitBranch size={14} />
              <span>Working Tree Diff</span>
              <span className={styles.tabCount}>{diffs.length}</span>
            </button>
          </div>
        )}
      </div>

      {repos.length === 0 && (
        <div style={{ padding: '60px 24px', textAlign: 'center', background: '#121215', borderRadius: '8px', border: '1px solid #27272a', marginTop: '24px' }}>
          <FolderGit2 size={36} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '15px', color: '#f4f4f5' }}>No Hosted Repositories Yet</h3>
          <p style={{ color: '#71717a', fontSize: '13px', margin: '0 0 20px' }}>Create a new repository to begin local-first software delivery on your private network.</p>
          <button type="button" className="btn-primary" onClick={() => setIsCreateOpen(true)}>
            <FolderGit2 size={14} />
            <span>Create Repository</span>
          </button>
        </div>
      )}

      {/* Tab 1: Code Explorer & Full Editor */}
      {activeTab === 'code' && (
        <div className={styles.codeLayout}>
          {/* File Explorer Tree Pane */}
          <div className={styles.fileTreeCard}>
            <div className={styles.treeHeader}>
              <Folder size={14} />
              <span>Files ({fileTree.length})</span>
              <span className={styles.branchPill}>main</span>
            </div>
            <div className={styles.fileTreeList}>
              {fileTree.map((file) => {
                const isSelected = selectedFile === file.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    className={`${styles.fileItem} ${isSelected ? styles.fileItemActive : ''}`}
                    onClick={() => setSelectedFile(file.path)}
                  >
                    {file.type === 'dir' ? (
                      <Folder size={13} />
                    ) : (
                      <File size={13} />
                    )}
                    <span className={styles.fileNameText}>{file.name}</span>
                    {file.size && (
                      <span className={styles.fileSizeText}>
                        {(file.size / 1024).toFixed(1)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Height Code Editor Pane */}
          <div className={styles.fileViewerCard}>
            <div className={styles.viewerHeader}>
              <div className={styles.viewerTitleGroup}>
                <FileCode size={14} />
                <code className={styles.viewerPath}>{selectedFile}</code>
                <span className={styles.viewerLinesCount}>
                  {codeLines.length} lines • {(fileBlob?.size || 0) / 1024 > 1 ? `${((fileBlob?.size || 0) / 1024).toFixed(1)} KB` : `${fileBlob?.size || 0} B`}
                </span>
              </div>
              <button type="button" className="btn-secondary" onClick={handleCopyBlob}>
                {copiedBlob ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedBlob ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {isMarkdown ? (
              <div className={styles.markdownBody}>
                <pre>{fileBlob?.content || 'Loading content...'}</pre>
              </div>
            ) : (
              <div className={styles.codeEditorContainer}>
                <div className={styles.gutter}>
                  {codeLines.map((_, idx) => (
                    <span key={idx} className={styles.gutterLine}>
                      {idx + 1}
                    </span>
                  ))}
                </div>
                <div className={styles.codeContent}>
                  {codeLines.map((line, idx) => (
                    <div key={idx} className={styles.codeLineText}>
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Commit History */}
      {activeTab === 'commits' && (
        <div className={styles.commitsContainer}>
          <div className={styles.commitsHeader}>
            <GitCommit size={15} />
            <h2>Commit History (Branch: main)</h2>
          </div>
          <div className={styles.commitsList}>
            {commits.map((commit) => (
              <div key={commit.hash} className={styles.commitRow}>
                <div className={styles.commitLeft}>
                  <div className={styles.commitDot} />
                  <div className={styles.commitInfo}>
                    <span className={styles.commitMessage}>{commit.message}</span>
                    <div className={styles.commitMeta}>
                      <span className={styles.commitAuthor}>{commit.author}</span>
                      <span>•</span>
                      <span className={styles.commitDate}>{commit.date}</span>
                    </div>
                  </div>
                </div>
                <code className={styles.commitShaPill}>{commit.shortHash}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Working Tree Diff */}
      {activeTab === 'diff' && (
        <div className={styles.diffContainer}>
          <div className={styles.diffHeader}>
            <GitBranch size={15} />
            <h2>Working Tree Uncommitted Changes ({diffs.length} files)</h2>
          </div>
          {diffs.map((diff) => (
            <div key={diff.newPath} className={styles.diffFileCard}>
              <div className={styles.diffFileHeader}>
                <div className={styles.diffPathWrap}>
                  <span className="status-pill neutral">{diff.status}</span>
                  <code className={styles.diffPath}>{diff.newPath}</code>
                </div>
                <div className={styles.diffCounts}>
                  <span>+{diff.additions}</span>
                  <span>-{diff.deletions}</span>
                </div>
              </div>

              <div className={styles.diffLinesList}>
                {diff.diffText.split('\n').map((line, i) => {
                  const isAdd = line.startsWith('+');
                  const isDel = line.startsWith('-');
                  return (
                    <div
                      key={i}
                      className={`${styles.diffLine} ${
                        isAdd ? styles.diffAddLine : isDel ? styles.diffDelLine : styles.diffContextLine
                      }`}
                    >
                      <span className={styles.diffLineGutter}>{i + 1}</span>
                      <span className={styles.diffLineText}>{line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
