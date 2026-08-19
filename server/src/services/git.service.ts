import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Repository, Commit, FileNode, FileBlob, DiffFile } from '../types/gitdrive.types.js';

const DATA_DIR = fs.existsSync(path.resolve(process.cwd(), 'server', 'data'))
  ? path.resolve(process.cwd(), 'server', 'data')
  : path.resolve(process.cwd(), 'data');
const REPOS_DIR = path.join(DATA_DIR, 'repos');

export class GitService {
  constructor() {
    this.ensureDirectories();
    this.seedDefaultRepositories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(REPOS_DIR)) {
      fs.mkdirSync(REPOS_DIR, { recursive: true });
    }
  }

  public getRepositories(): Repository[] {
    this.ensureDirectories();
    const dirs = fs.readdirSync(REPOS_DIR, { withFileTypes: true });
    const repos: Repository[] = [];

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const repoPath = path.join(REPOS_DIR, dir.name);
        const metaPath = path.join(repoPath, '.gitdrive.json');
        if (fs.existsSync(metaPath)) {
          try {
            const meta: Repository = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            meta.path = repoPath;
            repos.push(meta);
          } catch {
            // fallback
          }
        }
      }
    }

    return repos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getRepositoryById(id: string): Repository | null {
    const repos = this.getRepositories();
    return repos.find((r) => r.id === id) || null;
  }

  public createRepository(name: string, description: string, language: string = 'TypeScript', isPrivate: boolean = true): Repository {
    const id = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const repoPath = path.join(REPOS_DIR, id);

    if (fs.existsSync(repoPath)) {
      throw new Error(`Repository "${name}" already exists.`);
    }

    fs.mkdirSync(repoPath, { recursive: true });

    const newRepo: Repository = {
      id,
      name,
      description,
      defaultBranch: 'main',
      isPrivate,
      path: repoPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language,
      stars: 0,
      forks: 0,
    };

    // Save metadata
    fs.writeFileSync(path.join(repoPath, '.gitdrive.json'), JSON.stringify(newRepo, null, 2), 'utf8');

    // Create initial README
    const readmeContent = `# ${name}\n\n${description}\n\n## Delivery Platform\nManaged by GitDrive Local-First Software Delivery Platform.\n`;
    fs.writeFileSync(path.join(repoPath, 'README.md'), readmeContent, 'utf8');

    // Create sample package.json if typescript/javascript
    if (language.toLowerCase().includes('typescript') || language.toLowerCase().includes('javascript')) {
      const pkg = {
        name: id,
        version: '1.0.0',
        description,
        main: 'src/index.ts',
        scripts: {
          build: 'tsc',
          test: 'node --test',
          package: 'pkg . --output bin/' + id,
        },
      };
      fs.writeFileSync(path.join(repoPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
      fs.mkdirSync(path.join(repoPath, 'src'), { recursive: true });
      fs.writeFileSync(path.join(repoPath, 'src', 'index.ts'), `console.log("Hello from ${name}!");\n`, 'utf8');
    }

    return newRepo;
  }

  public getFileTree(repoId: string, subPath: string = ''): FileNode[] {
    const repo = this.getRepositoryById(repoId);
    if (!repo) throw new Error('Repository not found');

    const targetDir = path.join(repo.path, subPath);
    if (!fs.existsSync(targetDir)) return [];

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      if (entry.name === '.gitdrive.json') continue;
      const fullPath = path.join(targetDir, entry.name);
      const relativePath = path.join(subPath, entry.name).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: 'dir',
        });
      } else {
        const stat = fs.statSync(fullPath);
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: 'file',
          size: stat.size,
          extension: path.extname(entry.name),
        });
      }
    }

    // Folders first, then files alphabetically
    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });
  }

  public getFileBlob(repoId: string, filePath: string): FileBlob {
    const repo = this.getRepositoryById(repoId);
    if (!repo) throw new Error('Repository not found');

    const targetFile = path.join(repo.path, filePath);
    if (!fs.existsSync(targetFile)) throw new Error('File not found');

    const stat = fs.statSync(targetFile);
    const content = fs.readFileSync(targetFile, 'utf8');

    return {
      path: filePath,
      content,
      size: stat.size,
      isBinary: false,
    };
  }

  public getCommits(repoId: string): Commit[] {
    const repo = this.getRepositoryById(repoId);
    if (!repo) throw new Error('Repository not found');

    // Deterministic commit simulation based on repo metadata & files
    return [
      {
        hash: 'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
        shortHash: 'f7a8b9c',
        message: 'feat: configure local build & delivery targets for LAN distribution',
        author: 'Tran Huy <huy@gitdrive.local>',
        date: new Date(new Date(repo.updatedAt).getTime() - 1000 * 60 * 25).toISOString(),
        branch: 'main',
      },
      {
        hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
        shortHash: 'a1b2c3d',
        message: 'refactor: integrate workflow intelligence detection triggers',
        author: 'Tran Huy <huy@gitdrive.local>',
        date: new Date(new Date(repo.updatedAt).getTime() - 1000 * 60 * 90).toISOString(),
        branch: 'main',
      },
      {
        hash: '0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
        shortHash: '0e9d8c7',
        message: 'chore: initial repository scaffold and dependencies',
        author: 'Tran Huy <huy@gitdrive.local>',
        date: repo.createdAt,
        branch: 'main',
      },
    ];
  }

  public getDiff(repoId: string, commitHash?: string): DiffFile[] {
    return [
      {
        oldPath: 'package.json',
        newPath: 'package.json',
        status: 'modified',
        additions: 3,
        deletions: 1,
        diffText: `@@ -8,7 +8,9 @@\n   "scripts": {\n     "build": "vite build",\n-    "test": "jest",\n+    "test": "vitest run",\n+    "package": "electron-builder --win",\n+    "distribute": "gitdrive-distribute"\n   }`,
      },
      {
        oldPath: 'src/main.ts',
        newPath: 'src/main.ts',
        status: 'modified',
        additions: 5,
        deletions: 0,
        diffText: `@@ -15,4 +15,9 @@\n function initApp() {\n   console.log("Starting service...");\n+  // GitDrive LAN Distribution Channel Hook\n+  if (process.env.GITDRIVE_LAN_DISTRIBUTE) {\n+    console.log("Ready for LAN discovery");\n+  }\n }`,
      },
    ];
  }

  private seedDefaultRepositories() {
    const existing = this.getRepositories();
    if (existing.length > 0) return;

    // Seed 1: POS Checkout Terminal (Desktop App / Electron + TS)
    const posPath = path.join(REPOS_DIR, 'pos-terminal');
    fs.mkdirSync(posPath, { recursive: true });
    const posMeta: Repository = {
      id: 'pos-terminal',
      name: 'pos-terminal',
      description: 'Point-of-Sale LAN Desktop Terminal with offline invoice sync',
      defaultBranch: 'main',
      isPrivate: true,
      path: posPath,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      language: 'TypeScript',
      stars: 12,
      forks: 2,
    };
    fs.writeFileSync(path.join(posPath, '.gitdrive.json'), JSON.stringify(posMeta, null, 2), 'utf8');
    fs.writeFileSync(
      path.join(posPath, 'package.json'),
      JSON.stringify(
        {
          name: 'pos-terminal',
          version: '2.4.0',
          scripts: {
            build: 'tsc && vite build',
            test: 'vitest run',
            package: 'electron-builder --win --dir',
          },
          dependencies: {
            electron: '^33.0.0',
            react: '^18.3.0',
            sqlite3: '^5.1.7',
          },
          devDependencies: {
            vitest: '^2.1.0',
            typescript: '^5.6.0',
          },
        },
        null,
        2
      ),
      'utf8'
    );
    fs.writeFileSync(
      path.join(posPath, 'README.md'),
      '# POS Terminal\n\nHigh-performance offline-first POS terminal application for LAN branch stores.\n\n### Build & Distribute\nGitDrive automatically infers build steps and packages `.exe` and `.msi` for Windows cash registers.\n',
      'utf8'
    );
    fs.mkdirSync(path.join(posPath, 'src'), { recursive: true });
    fs.writeFileSync(path.join(posPath, 'src', 'index.ts'), 'export const APP_VERSION = "2.4.0";\nconsole.log("POS Terminal starting...");\n', 'utf8');

    // Seed 2: Warehouse Inventory Service (.NET / C#)
    const inventoryPath = path.join(REPOS_DIR, 'inventory-service');
    fs.mkdirSync(inventoryPath, { recursive: true });
    const invMeta: Repository = {
      id: 'inventory-service',
      name: 'inventory-service',
      description: 'High-throughput inventory tracking daemon with barcode scanner listener',
      defaultBranch: 'main',
      isPrivate: true,
      path: inventoryPath,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      language: 'C#',
      stars: 8,
      forks: 1,
    };
    fs.writeFileSync(path.join(inventoryPath, '.gitdrive.json'), JSON.stringify(invMeta, null, 2), 'utf8');
    fs.writeFileSync(
      path.join(inventoryPath, 'InventoryService.csproj'),
      `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net8.0</TargetFramework>\n    <Nullable>enable</Nullable>\n  </PropertyGroup>\n</Project>`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(inventoryPath, 'Program.cs'),
      'using System;\nConsole.WriteLine("Warehouse Inventory Service v1.2.0");\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(inventoryPath, 'README.md'),
      '# Warehouse Inventory Service\n\n.NET 8 High performance barcode scanner engine and local LAN database sync.\n',
      'utf8'
    );

    // Seed 3: Network Gateway Engine (Rust CLI)
    const gatewayPath = path.join(REPOS_DIR, 'lan-gateway');
    fs.mkdirSync(gatewayPath, { recursive: true });
    const gwMeta: Repository = {
      id: 'lan-gateway',
      name: 'lan-gateway',
      description: 'Zero-latency packet router and proxy for private office networks',
      defaultBranch: 'main',
      isPrivate: false,
      path: gatewayPath,
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      language: 'Rust',
      stars: 24,
      forks: 5,
    };
    fs.writeFileSync(path.join(gatewayPath, '.gitdrive.json'), JSON.stringify(gwMeta, null, 2), 'utf8');
    fs.writeFileSync(
      path.join(gatewayPath, 'Cargo.toml'),
      `[package]\nname = "lan-gateway"\nversion = "0.9.1"\nedition = "2021"\n\n[dependencies]\ntokio = { version = "1.0", features = ["full"] }\n`,
      'utf8'
    );
    fs.mkdirSync(path.join(gatewayPath, 'src'), { recursive: true });
    fs.writeFileSync(path.join(gatewayPath, 'src', 'main.rs'), 'fn main() {\n    println!("LAN Gateway Proxy running on port 8080");\n}\n', 'utf8');
    fs.writeFileSync(
      path.join(gatewayPath, 'README.md'),
      '# LAN Gateway\n\nUltra lightweight Rust packet forwarder for isolated private networks.\n',
      'utf8'
    );
  }
}
