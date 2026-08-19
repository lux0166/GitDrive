import express, { Request, Response } from 'express';
import cors from 'cors';
import { GitService } from './services/git.service.js';
import { IntelligenceService } from './services/intelligence.service.js';
import { RunnerService } from './services/runner.service.js';
import { ReleaseService } from './services/release.service.js';
import { SettingsService } from './services/settings.service.js';
import { WorkflowDefinition } from './types/gitdrive.types.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const gitService = new GitService();
const intelligenceService = new IntelligenceService();
const runnerService = new RunnerService();
const releaseService = new ReleaseService();

// Auto-register release into LAN App Catalog when a pipeline run succeeds and produces artifacts
runnerService.on('run_updated', (run) => {
  if (run.status === 'passed' && run.artifacts && run.artifacts.length > 0) {
    const existing = releaseService
      .getReleases(run.repoId)
      .find((r) => r.artifacts.some((a) => a.id === run.artifacts[0].id));
    if (!existing) {
      releaseService.createRelease({
        repoId: run.repoId,
        repoName: run.repoName,
        tagName: `v2.4.${Date.now().toString().slice(-2)}`,
        title: `${run.repoName} Release (${run.id})`,
        notes: `Automated verified binary package produced by GitDrive Local Runner.\nSHA-256 Checksum: ${run.artifacts[0].sha256}`,
        version: '2.4.0',
        commitSha: run.commitSha,
        releaseDate: run.endTime || new Date().toISOString(),
        distributionChannel: 'stable',
        artifacts: run.artifacts,
      });
    }
  }
});

const pStr = (val: string | string[] | undefined): string => {
  if (!val) return '';
  return Array.isArray(val) ? val[0] : val;
};

// In-memory / cache workflow definitions
const workflowStore = new Map<string, WorkflowDefinition>();

// 1. Health & Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'GitDrive Control Plane',
    version: '0.1.0',
    mode: 'Local-First LAN',
    networkPolicy: 'Private LAN Only (Egress Disabled)',
    runnersActive: 1,
    uptime: process.uptime(),
  });
});

// 2. Repositories
app.get('/api/repos', (req: Request, res: Response) => {
  try {
    const repos = gitService.getRepositories();
    res.json(repos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/repos', (req: Request, res: Response) => {
  try {
    const { name, description, language, isPrivate } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Repository name is required' });
    }
    const repo = gitService.createRepository(name, description || '', language || 'TypeScript', isPrivate !== false);
    res.status(201).json(repo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/repos/:id', (req: Request, res: Response) => {
  const repo = gitService.getRepositoryById(pStr(req.params.id));
  if (!repo) return res.status(404).json({ error: 'Repository not found' });
  res.json(repo);
});

app.get('/api/repos/:id/tree', (req: Request, res: Response) => {
  try {
    const subPath = (req.query.path as string) || '';
    const tree = gitService.getFileTree(pStr(req.params.id), subPath);
    res.json(tree);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/repos/:id/blob', (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: 'File path required' });
    const blob = gitService.getFileBlob(pStr(req.params.id), filePath);
    res.json(blob);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.get('/api/repos/:id/commits', (req: Request, res: Response) => {
  try {
    const commits = gitService.getCommits(pStr(req.params.id));
    res.json(commits);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/repos/:id/diff', (req: Request, res: Response) => {
  try {
    const diff = gitService.getDiff(pStr(req.params.id));
    res.json(diff);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Workflow Intelligence
app.get('/api/repos/:id/analyze', (req: Request, res: Response) => {
  try {
    const repo = gitService.getRepositoryById(pStr(req.params.id));
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    const detection = intelligenceService.analyzeRepository(repo);
    res.json(detection);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/repos/:id/workflows/generate', (req: Request, res: Response) => {
  try {
    const repo = gitService.getRepositoryById(pStr(req.params.id));
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    const detection = intelligenceService.analyzeRepository(repo);
    const workflow = intelligenceService.generateWorkflowFromDetection(repo, detection);
    workflowStore.set(workflow.id, workflow);
    res.json({ detection, workflow });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workflows/:id', (req: Request, res: Response) => {
  const wfId = pStr(req.params.id);
  const wf = workflowStore.get(wfId);
  if (!wf) {
    // If not in store, try generating default for repo
    const repoId = wfId.replace(/^wf-/, '');
    const repo = gitService.getRepositoryById(repoId);
    if (repo) {
      const detection = intelligenceService.analyzeRepository(repo);
      const generated = intelligenceService.generateWorkflowFromDetection(repo, detection);
      workflowStore.set(generated.id, generated);
      return res.json(generated);
    }
    return res.status(404).json({ error: 'Workflow not found' });
  }
  res.json(wf);
});

app.post('/api/workflows', (req: Request, res: Response) => {
  const wf = req.body as WorkflowDefinition;
  if (!wf || !wf.id) return res.status(400).json({ error: 'Invalid workflow payload' });
  wf.updatedAt = new Date().toISOString();
  workflowStore.set(wf.id, wf);
  res.json(wf);
});

// 4. GitActions Runner & Execution
app.get('/api/runs', (req: Request, res: Response) => {
  const repoId = req.query.repoId as string | undefined;
  const runs = runnerService.getRuns(repoId);
  res.json(runs);
});

app.get('/api/runs/:id', (req: Request, res: Response) => {
  const run = runnerService.getRunById(pStr(req.params.id));
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json(run);
});

app.post('/api/runs', (req: Request, res: Response) => {
  try {
    const { workflowId, repoId, commitSha, trigger } = req.body;
    let workflow = workflowStore.get(workflowId);

    const repo = gitService.getRepositoryById(repoId);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    if (!workflow) {
      const detection = intelligenceService.analyzeRepository(repo);
      workflow = intelligenceService.generateWorkflowFromDetection(repo, detection);
      workflowStore.set(workflow.id, workflow);
    }

    const sha = commitSha || 'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6';
    const run = runnerService.startPipelineRun(workflow, repo.name, sha, trigger || 'manual');
    res.status(201).json(run);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time SSE Live Log Streaming
app.get('/api/runs/:id/logs/stream', (req: Request, res: Response) => {
  const runId = pStr(req.params.id);
  const run = runnerService.getRunById(runId);
  if (!run) return res.status(404).json({ error: 'Run not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial existing logs & status
  res.write(`data: ${JSON.stringify({ type: 'init', run })}\n\n`);

  const onLog = (data: { runId: string; entry: any }) => {
    if (data.runId === runId) {
      res.write(`data: ${JSON.stringify({ type: 'log', entry: data.entry })}\n\n`);
    }
  };

  const onUpdate = (updatedRun: any) => {
    if (updatedRun.id === runId) {
      res.write(`data: ${JSON.stringify({ type: 'update', run: updatedRun })}\n\n`);
    }
  };

  runnerService.on('log', onLog);
  runnerService.on('run_updated', onUpdate);

  req.on('close', () => {
    runnerService.off('log', onLog);
    runnerService.off('run_updated', onUpdate);
  });
});

// 5. Release & LAN Application Distribution Catalog
app.get('/api/releases', (req: Request, res: Response) => {
  const repoId = req.query.repoId as string | undefined;
  const releases = releaseService.getReleases(repoId);
  res.json(releases);
});

app.get('/api/releases/:id', (req: Request, res: Response) => {
  const rel = releaseService.getReleaseById(pStr(req.params.id));
  if (!rel) return res.status(404).json({ error: 'Release not found' });
  res.json(rel);
});

app.post('/api/releases', (req: Request, res: Response) => {
  try {
    const rel = releaseService.createRelease(req.body);
    res.status(201).json(rel);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/catalog', (req: Request, res: Response) => {
  const apps = releaseService.getAppCatalog();
  res.json(apps);
});

// 6. LAN Security & Fleet Settings
const settingsService = new SettingsService();

app.get('/api/settings', (req: Request, res: Response) => {
  res.json(settingsService.getSettings());
});

app.post('/api/settings', (req: Request, res: Response) => {
  try {
    const updated = settingsService.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/settings/secrets', (req: Request, res: Response) => {
  try {
    const { pattern } = req.body;
    const updated = settingsService.addSecretPattern(pattern);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/settings/secrets', (req: Request, res: Response) => {
  try {
    const { pattern } = req.body;
    const updated = settingsService.removeSecretPattern(pattern);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/settings/runners', (req: Request, res: Response) => {
  try {
    const { name, type, concurrency } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
    const runner = settingsService.registerRunner(name, type, concurrency);
    res.status(201).json(runner);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/settings/runners/:id', (req: Request, res: Response) => {
  try {
    const success = settingsService.deregisterRunner(pStr(req.params.id));
    if (!success) return res.status(404).json({ error: 'Runner node not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Static Web UI Serving for Production & Standalone Executable
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client', 'dist'),
  path.resolve(process.cwd(), 'dist', 'client'),
  path.resolve(process.cwd(), 'dist'),
];
for (const cand of clientDistCandidates) {
  if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    app.use(express.static(cand));
    app.get('*', (req: Request, res: Response) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(cand, 'index.html'));
      }
    });
    break;
  }
}

app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`  GitDrive Local-First Control Plane v0.1.0`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  LAN Network: Ready (Egress: Private Mode)`);
  console.log(`=================================================\n`);
});
