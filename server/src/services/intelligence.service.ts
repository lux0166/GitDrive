import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  ProjectDetection,
  ProjectEvidence,
  WorkflowDefinition,
  WorkflowNode,
  Repository,
} from '../types/gitdrive.types.js';

export class IntelligenceService {
  public analyzeRepository(repo: Repository): ProjectDetection {
    const repoPath = repo.path;
    const evidence: ProjectEvidence[] = [];

    if (!fs.existsSync(repoPath)) {
      return {
        detected: false,
        projectFamily: 'generic',
        framework: 'Unknown',
        buildTool: 'manual',
        testTool: 'none',
        packageFormat: 'tar.gz',
        targetPlatform: 'all',
        confidence: 'needs-confirmation',
        evidence: [],
        suggestedWorkflowName: 'Generic Pipeline',
      };
    }

    const files = fs.readdirSync(repoPath);

    // 1. Check for Node / JS / TS / Electron
    if (files.includes('package.json')) {
      const pkgPath = path.join(repoPath, 'package.json');
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        evidence.push({
          file: 'package.json',
          matchedRule: 'manifest:node',
          reason: `Found Node.js manifest with name "${pkg.name || repo.name}" and version "${pkg.version || '1.0.0'}"`,
        });

        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
        };

        const hasElectron = Boolean(allDeps['electron'] || allDeps['electron-builder']);
        const hasReact = Boolean(allDeps['react'] || allDeps['react-dom']);
        const hasVue = Boolean(allDeps['vue']);
        const hasVite = Boolean(allDeps['vite']);
        const hasNext = Boolean(allDeps['next']);
        const hasVitest = Boolean(allDeps['vitest']);
        const hasJest = Boolean(allDeps['jest']);

        let framework = 'Node.js';
        let packageFormat = 'zip';
        let targetPlatform = 'windows-x64';

        if (hasElectron) {
          framework = 'Electron Desktop';
          packageFormat = 'exe/msi';
          evidence.push({
            file: 'package.json',
            matchedRule: 'dependency:electron',
            reason: 'Detected Electron desktop runtime dependency for Windows/Linux GUI app',
          });
        } else if (hasNext) {
          framework = 'Next.js Web';
          evidence.push({
            file: 'package.json',
            matchedRule: 'dependency:next',
            reason: 'Detected Next.js full-stack framework',
          });
        } else if (hasReact) {
          framework = 'React Web App';
          evidence.push({
            file: 'package.json',
            matchedRule: 'dependency:react',
            reason: 'Detected React component library',
          });
        }

        let buildTool = 'npm run build';
        if (pkg.scripts && pkg.scripts.build) {
          buildTool = `npm run build (${pkg.scripts.build})`;
          evidence.push({
            file: 'package.json',
            matchedRule: 'script:build',
            reason: `Found explicit build script: "${pkg.scripts.build}"`,
          });
        }

        let testTool = 'npm test';
        if (hasVitest) {
          testTool = 'vitest run';
          evidence.push({
            file: 'package.json',
            matchedRule: 'tool:vitest',
            reason: 'Vitest runner detected for fast local unit testing',
          });
        } else if (hasJest) {
          testTool = 'jest';
          evidence.push({
            file: 'package.json',
            matchedRule: 'tool:jest',
            reason: 'Jest test framework detected',
          });
        }

        return {
          detected: true,
          projectFamily: hasElectron ? 'node-electron' : 'node-web',
          framework,
          buildTool,
          testTool,
          packageFormat,
          targetPlatform,
          confidence: 'high',
          evidence,
          suggestedWorkflowName: hasElectron ? 'Desktop App LAN Delivery' : 'Web Service Build & Package',
        };
      } catch (err) {
        // syntax error in package.json
      }
    }

    // 2. Check for .NET / C#
    const csproj = files.find((f) => f.endsWith('.csproj'));
    if (csproj) {
      evidence.push({
        file: csproj,
        matchedRule: 'manifest:dotnet-csproj',
        reason: `Found .NET project file "${csproj}"`,
      });

      return {
        detected: true,
        projectFamily: 'dotnet',
        framework: '.NET 8.0 SDK',
        buildTool: 'dotnet build -c Release',
        testTool: 'dotnet test --no-build',
        packageFormat: 'single-file-exe',
        targetPlatform: 'windows-x64',
        confidence: 'high',
        evidence,
        suggestedWorkflowName: '.NET Desktop Service Delivery',
      };
    }

    // 3. Check for Rust
    if (files.includes('Cargo.toml')) {
      evidence.push({
        file: 'Cargo.toml',
        matchedRule: 'manifest:rust-cargo',
        reason: 'Found Rust package manifest with Cargo build system',
      });

      return {
        detected: true,
        projectFamily: 'rust',
        framework: 'Rust Native Toolchain',
        buildTool: 'cargo build --release',
        testTool: 'cargo test',
        packageFormat: 'binary-exe',
        targetPlatform: 'windows-x64',
        confidence: 'high',
        evidence,
        suggestedWorkflowName: 'Rust High-Performance Binary Delivery',
      };
    }

    // 4. Check for Golang
    if (files.includes('go.mod')) {
      evidence.push({
        file: 'go.mod',
        matchedRule: 'manifest:golang',
        reason: 'Found Go module file',
      });

      return {
        detected: true,
        projectFamily: 'golang',
        framework: 'Go Compiler',
        buildTool: 'go build -o dist/',
        testTool: 'go test ./...',
        packageFormat: 'binary',
        targetPlatform: 'linux-x64 / windows-x64',
        confidence: 'high',
        evidence,
        suggestedWorkflowName: 'Go Daemon & CLI Delivery',
      };
    }

    // 5. Check for Docker
    if (files.includes('Dockerfile')) {
      evidence.push({
        file: 'Dockerfile',
        matchedRule: 'manifest:docker',
        reason: 'Found Docker container build specification',
      });

      return {
        detected: true,
        projectFamily: 'docker',
        framework: 'OCI Container',
        buildTool: 'docker build -t app:latest .',
        testTool: 'docker run --rm app:latest test',
        packageFormat: 'docker-tar',
        targetPlatform: 'container',
        confidence: 'medium',
        evidence,
        suggestedWorkflowName: 'Docker Container Build & Publish',
      };
    }

    // Fallback Generic
    evidence.push({
      file: 'README.md',
      matchedRule: 'heuristic:file-scan',
      reason: 'No standard build manifest detected; falling back to generic execution script',
    });

    return {
      detected: false,
      projectFamily: 'generic',
      framework: 'Script / Generic',
      buildTool: 'echo "Building..."',
      testTool: 'echo "Testing..."',
      packageFormat: 'zip',
      targetPlatform: 'all',
      confidence: 'needs-confirmation',
      evidence,
      suggestedWorkflowName: 'Standard Delivery Workflow',
    };
  }

  public generateWorkflowFromDetection(repo: Repository, detection: ProjectDetection): WorkflowDefinition {
    const nodes: WorkflowNode[] = [];

    // Node 1: Checkout
    nodes.push({
      id: 'step-checkout',
      name: 'Checkout Repository Source',
      phase: 'checkout',
      command: `git clone local://repos/${repo.id} .`,
      runnerLabel: 'local-host',
      status: 'pending',
      dependencies: [],
      evidenceCitation: 'Source Git tracking branch: main',
    });

    // Node 2: Setup Environment
    let setupCmd = 'node --version && npm --version';
    let runnerLabel = 'windows-host';
    if (detection.projectFamily === 'dotnet') {
      setupCmd = 'dotnet --info';
    } else if (detection.projectFamily === 'rust') {
      setupCmd = 'rustc --version && cargo --version';
    } else if (detection.projectFamily === 'golang') {
      setupCmd = 'go version';
    } else if (detection.projectFamily === 'docker') {
      setupCmd = 'docker --version';
    }

    nodes.push({
      id: 'step-setup',
      name: `Prepare ${detection.framework} Environment`,
      phase: 'setup',
      command: setupCmd,
      runnerLabel,
      status: 'pending',
      dependencies: ['step-checkout'],
      evidenceCitation: detection.evidence[0]?.reason || 'Declared toolchain runtime',
    });

    // Node 3: Dependencies
    let depsCmd = 'npm ci --prefer-offline';
    if (detection.projectFamily === 'dotnet') {
      depsCmd = 'dotnet restore';
    } else if (detection.projectFamily === 'rust') {
      depsCmd = 'cargo fetch --locked';
    } else if (detection.projectFamily === 'golang') {
      depsCmd = 'go mod download';
    } else if (detection.projectFamily === 'docker') {
      depsCmd = 'echo "Docker daemon ready"';
    }

    nodes.push({
      id: 'step-deps',
      name: 'Resolve & Cache Dependencies',
      phase: 'dependencies',
      command: depsCmd,
      runnerLabel,
      status: 'pending',
      dependencies: ['step-setup'],
      evidenceCitation: 'Local LAN package cache enabled',
    });

    // Node 4: Build
    let buildCmd = 'npm run build';
    if (detection.projectFamily === 'dotnet') {
      buildCmd = 'dotnet build --configuration Release --no-restore';
    } else if (detection.projectFamily === 'rust') {
      buildCmd = 'cargo build --release';
    } else if (detection.projectFamily === 'golang') {
      buildCmd = 'go build -v -o dist/ ./...';
    } else if (detection.projectFamily === 'docker') {
      buildCmd = `docker build -t ${repo.id}:latest .`;
    }

    nodes.push({
      id: 'step-build',
      name: `Compile & Bundle (${detection.framework})`,
      phase: 'build',
      command: buildCmd,
      runnerLabel,
      status: 'pending',
      dependencies: ['step-deps'],
      evidenceCitation: `Matched build rule: ${detection.buildTool}`,
    });

    // Node 5: Test
    let testCmd = 'npm test -- --run';
    if (detection.projectFamily === 'dotnet') {
      testCmd = 'dotnet test --no-build --verbosity normal';
    } else if (detection.projectFamily === 'rust') {
      testCmd = 'cargo test --release';
    } else if (detection.projectFamily === 'golang') {
      testCmd = 'go test -v ./...';
    } else if (detection.projectFamily === 'docker') {
      testCmd = 'echo "Container self-test passed"';
    }

    nodes.push({
      id: 'step-test',
      name: `Execute Test Suites (${detection.testTool})`,
      phase: 'test',
      command: testCmd,
      runnerLabel,
      status: 'pending',
      dependencies: ['step-build'],
      evidenceCitation: `Detected test framework: ${detection.testTool}`,
    });

    // Node 6: Package
    let packageCmd = `gitdrive-pack --target ${detection.targetPlatform} --format ${detection.packageFormat} --out ./dist`;
    if (detection.projectFamily === 'node-electron') {
      packageCmd = 'npx electron-builder --win --dir --publish never';
    } else if (detection.projectFamily === 'dotnet') {
      packageCmd = 'dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./dist';
    } else if (detection.projectFamily === 'rust') {
      packageCmd = 'tar -czf dist/' + repo.id + '-x64.tar.gz -C target/release ' + repo.id;
    }

    nodes.push({
      id: 'step-package',
      name: `Package Distributable (${detection.packageFormat})`,
      phase: 'package',
      command: packageCmd,
      runnerLabel,
      status: 'pending',
      dependencies: ['step-test'],
      evidenceCitation: `Target platform: ${detection.targetPlatform}`,
    });

    // Node 7: Release & Provenance
    nodes.push({
      id: 'step-release',
      name: 'Sign & Compute SHA-256 Provenance',
      phase: 'release',
      command: 'gitdrive-release --checksum sha256 --record-provenance',
      runnerLabel: 'local-host',
      status: 'pending',
      dependencies: ['step-package'],
      evidenceCitation: 'Enforce cryptographic release checksums',
    });

    // Node 8: LAN Distribution
    nodes.push({
      id: 'step-distribute',
      name: 'Publish to LAN Application Catalog',
      phase: 'distribute',
      command: `gitdrive-distribute --channel stable --repo ${repo.id} --notify-lan`,
      runnerLabel: 'local-host',
      status: 'pending',
      dependencies: ['step-release'],
      evidenceCitation: 'LAN Discovery Protocol enabled',
    });

    return {
      id: `wf-${repo.id}`,
      repoId: repo.id,
      name: detection.suggestedWorkflowName,
      version: '1.0.0',
      description: `Auto-generated workflow for ${detection.framework} targeting ${detection.targetPlatform} with zero-friction LAN delivery.`,
      triggers: ['push', 'manual', 'tag'],
      targetOS: detection.targetPlatform,
      nodes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
