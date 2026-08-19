import { EventEmitter } from 'events';
import crypto from 'crypto';
import {
  PipelineRun,
  WorkflowDefinition,
  WorkflowNode,
  Artifact,
  LogEntry,
} from '../types/gitdrive.types.js';

export class RunnerService extends EventEmitter {
  private runs: Map<string, PipelineRun> = new Map();
  private secretsToMask: string[] = ['SECRET_TOKEN_9921', 'LAN_ACCESS_KEY_XYZ', 'PRIVATE_PASS_884'];

  constructor() {
    super();
    this.seedDefaultRuns();
  }

  public getRuns(repoId?: string): PipelineRun[] {
    const list = Array.from(this.runs.values());
    if (repoId) {
      return list
        .filter((r) => r.repoId === repoId)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }
    return list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  public getRunById(id: string): PipelineRun | null {
    return this.runs.get(id) || null;
  }

  public startPipelineRun(workflow: WorkflowDefinition, repoName: string, commitSha: string, trigger: string = 'manual'): PipelineRun {
    const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const clonedNodes: WorkflowNode[] = workflow.nodes.map((n) => ({
      ...n,
      status: 'pending',
      duration: undefined,
    }));

    const run: PipelineRun = {
      id: runId,
      workflowId: workflow.id,
      repoId: workflow.repoId,
      repoName,
      commitSha,
      branch: 'main',
      trigger,
      status: 'queued',
      startTime: new Date().toISOString(),
      nodes: clonedNodes,
      logs: [],
      artifacts: [],
    };

    this.runs.set(runId, run);
    this.emit('run_updated', run);

    // Asynchronously kick off pipeline execution
    setTimeout(() => {
      this.executeRun(runId);
    }, 300);

    return run;
  }

  private async executeRun(runId: string) {
    const run = this.runs.get(runId);
    if (!run) return;

    run.status = 'running';
    this.appendLog(run, 'system', `Starting GitDrive Local Runner harness on node [local-runner-01]`);
    this.appendLog(run, 'system', `Execution Isolation: Process Sandbox (Egress Policy: Private LAN Only)`);
    this.appendLog(run, 'system', `Pipeline ID: ${run.id} | Workflow: ${run.workflowId}`);
    this.emit('run_updated', run);

    for (let i = 0; i < run.nodes.length; i++) {
      const node = run.nodes[i];
      run.currentStepId = node.id;
      node.status = 'running';
      this.emit('run_updated', run);

      const stepStartTime = Date.now();
      this.appendLog(run, 'system', `>>> [Step ${i + 1}/${run.nodes.length}] Executing: ${node.name}`);
      this.appendLog(run, 'stdout', `$ ${this.maskSecrets(node.command)}`);

      // Simulate realistic execution steps & logs
      await this.simulateNodeExecution(run, node);

      const durationMs = Date.now() - stepStartTime;
      node.duration = Math.round(durationMs / 10) / 100;
      node.status = 'success';
      this.appendLog(run, 'system', `✔ Step completed in ${node.duration}s`);
      this.emit('run_updated', run);
    }

    // Pipeline completed successfully!
    run.status = 'passed';
    run.endTime = new Date().toISOString();
    const totalDuration = Math.round((new Date(run.endTime).getTime() - new Date(run.startTime).getTime()) / 1000);
    run.duration = totalDuration;
    run.currentStepId = undefined;

    // Generate real artifact record
    const ext = run.repoId.includes('pos') ? 'exe' : run.repoId.includes('inventory') ? 'msi' : 'tar.gz';
    const fileName = `${run.repoId}-v2.4.0-win-x64.${ext}`;
    const fakeContent = `GitDrive Build Artifact for ${run.repoName} - Commit ${run.commitSha} - Run ${run.id}`;
    const hash = crypto.createHash('sha256').update(fakeContent).digest('hex');

    const artifact: Artifact = {
      id: `art-${Date.now()}`,
      runId: run.id,
      repoId: run.repoId,
      name: `${run.repoName} Distributable Bundle`,
      fileName,
      filePath: `/artifacts/${run.repoId}/${fileName}`,
      sizeBytes: 48920150, // ~48.9MB
      sha256: hash,
      platform: 'Windows x64',
      createdAt: new Date().toISOString(),
    };

    run.artifacts.push(artifact);

    this.appendLog(run, 'system', `=======================================================`);
    this.appendLog(run, 'system', `✔ PIPELINE SUCCESS: All ${run.nodes.length} stages passed in ${totalDuration}s`);
    this.appendLog(run, 'system', `Artifact Produced: ${fileName} (${(artifact.sizeBytes / 1048576).toFixed(1)} MB)`);
    this.appendLog(run, 'system', `SHA-256 Provenance Checksum: ${artifact.sha256}`);
    this.appendLog(run, 'system', `Distributed to LAN App Catalog: http://gitdrive.local/apps/${run.repoId}`);
    this.appendLog(run, 'system', `=======================================================`);

    this.emit('run_updated', run);
  }

  private async simulateNodeExecution(run: PipelineRun, node: WorkflowNode) {
    if (node.phase === 'checkout') {
      await this.sleep(400);
      this.appendLog(run, 'stdout', `Cloning local repository from /data/repos/${run.repoId}...`);
      this.appendLog(run, 'stdout', `HEAD is now at ${run.commitSha.substring(0, 7)} feat: local build delivery`);
    } else if (node.phase === 'setup') {
      await this.sleep(500);
      this.appendLog(run, 'stdout', `Node.js v22.10.0 (x64 Windows)`);
      this.appendLog(run, 'stdout', `npm v10.9.0`);
      this.appendLog(run, 'stdout', `Toolchain cache verified: [OK]`);
    } else if (node.phase === 'dependencies') {
      await this.sleep(700);
      this.appendLog(run, 'stdout', `Resolving lockfile dependencies from LAN Mirror (http://192.168.1.10:4873)...`);
      this.appendLog(run, 'stdout', `added 382 packages in 620ms (100% cache hit from private LAN)`);
    } else if (node.phase === 'build') {
      await this.sleep(900);
      this.appendLog(run, 'stdout', `vite v6.0.3 building for production...`);
      this.appendLog(run, 'stdout', `transforming (42) src/index.ts`);
      this.appendLog(run, 'stdout', `✓ 84 modules transformed.`);
      this.appendLog(run, 'stdout', `dist/index.html                   0.45 kB`);
      this.appendLog(run, 'stdout', `dist/assets/index-Dk29f.js       184.20 kB │ gzip: 54.12 kB`);
      this.appendLog(run, 'stdout', `dist/assets/index-Bf92a.css       32.10 kB │ gzip:  8.40 kB`);
    } else if (node.phase === 'test') {
      await this.sleep(600);
      this.appendLog(run, 'stdout', `RUN  v2.1.0 src/__tests__/pos.test.ts`);
      this.appendLog(run, 'stdout', ` ✓ src/__tests__/pos.test.ts > Invoice Engine > calculates VAT correctly (12ms)`);
      this.appendLog(run, 'stdout', ` ✓ src/__tests__/pos.test.ts > Barcode Scanner > parses Code128 format (8ms)`);
      this.appendLog(run, 'stdout', ` ✓ src/__tests__/pos.test.ts > Offline Storage > saves SQLite transaction (18ms)`);
      this.appendLog(run, 'stdout', `Test Files  1 passed (1)`);
      this.appendLog(run, 'stdout', `Tests       3 passed (3)`);
      this.appendLog(run, 'stdout', `Duration    238ms`);
    } else if (node.phase === 'package') {
      await this.sleep(1000);
      this.appendLog(run, 'stdout', `Packaging application for target [windows-x64]...`);
      this.appendLog(run, 'stdout', `Bundling native executable runtime...`);
      this.appendLog(run, 'stdout', `Generated bundle: dist/${run.repoId}-v2.4.0-win-x64.exe (48.9 MB)`);
    } else if (node.phase === 'release') {
      await this.sleep(500);
      this.appendLog(run, 'stdout', `Calculating cryptographic SHA-256 hash...`);
      this.appendLog(run, 'stdout', `Recording immutable build provenance to GitDrive database...`);
    } else if (node.phase === 'distribute') {
      await this.sleep(400);
      this.appendLog(run, 'stdout', `Notifying LAN peer nodes over mDNS / LAN discovery...`);
      this.appendLog(run, 'stdout', `Package registered in Local Application Catalog for immediate workstation install.`);
    }
  }

  private appendLog(run: PipelineRun, stream: 'stdout' | 'stderr' | 'system', text: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      stepId: run.currentStepId || 'general',
      text: this.maskSecrets(text),
      stream,
    };
    run.logs.push(entry);
    this.emit('log', { runId: run.id, entry });
  }

  private maskSecrets(text: string): string {
    let masked = text;
    for (const secret of this.secretsToMask) {
      masked = masked.split(secret).join('***[MASKED_SECRET]***');
    }
    return masked;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private seedDefaultRuns() {
    const seededRun: PipelineRun = {
      id: 'run-prev-001',
      workflowId: 'wf-pos-terminal',
      repoId: 'pos-terminal',
      repoName: 'pos-terminal',
      commitSha: 'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
      branch: 'main',
      trigger: 'push',
      status: 'passed',
      startTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
      duration: 54,
      nodes: [
        { id: 'step-checkout', name: 'Checkout Repository Source', phase: 'checkout', command: 'git clone local://repos/pos-terminal .', runnerLabel: 'local-host', status: 'success', duration: 0.4, dependencies: [] },
        { id: 'step-setup', name: 'Prepare Electron Desktop Environment', phase: 'setup', command: 'node --version && npm --version', runnerLabel: 'windows-host', status: 'success', duration: 0.5, dependencies: ['step-checkout'] },
        { id: 'step-deps', name: 'Resolve & Cache Dependencies', phase: 'dependencies', command: 'npm ci --prefer-offline', runnerLabel: 'windows-host', status: 'success', duration: 0.7, dependencies: ['step-setup'] },
        { id: 'step-build', name: 'Compile & Bundle (Electron Desktop)', phase: 'build', command: 'npm run build', runnerLabel: 'windows-host', status: 'success', duration: 1.2, dependencies: ['step-deps'] },
        { id: 'step-test', name: 'Execute Test Suites (vitest run)', phase: 'test', command: 'npm test -- --run', runnerLabel: 'windows-host', status: 'success', duration: 0.6, dependencies: ['step-build'] },
        { id: 'step-package', name: 'Package Distributable (exe/msi)', phase: 'package', command: 'npx electron-builder --win --dir', runnerLabel: 'windows-host', status: 'success', duration: 1.5, dependencies: ['step-test'] },
        { id: 'step-release', name: 'Sign & Compute SHA-256 Provenance', phase: 'release', command: 'gitdrive-release --checksum sha256', runnerLabel: 'local-host', status: 'success', duration: 0.5, dependencies: ['step-package'] },
        { id: 'step-distribute', name: 'Publish to LAN Application Catalog', phase: 'distribute', command: 'gitdrive-distribute --channel stable', runnerLabel: 'local-host', status: 'success', duration: 0.4, dependencies: ['step-release'] },
      ],
      logs: [
        { timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), stepId: 'general', text: 'Pipeline started successfully on [local-runner-01]', stream: 'system' },
        { timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(), stepId: 'general', text: 'All 8 stages executed successfully. Artifact registered.', stream: 'system' },
      ],
      artifacts: [
        {
          id: 'art-pos-01',
          runId: 'run-prev-001',
          repoId: 'pos-terminal',
          name: 'pos-terminal Distributable Bundle',
          fileName: 'pos-terminal-v2.4.0-win-x64.exe',
          filePath: '/artifacts/pos-terminal/pos-terminal-v2.4.0-win-x64.exe',
          sizeBytes: 51240000,
          sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          platform: 'Windows x64',
          createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
        },
      ],
    };

    this.runs.set(seededRun.id, seededRun);
  }
}
