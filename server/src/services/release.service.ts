import { Release, Artifact } from '../types/gitdrive.types.js';

export class ReleaseService {
  private releases: Release[] = [];

  constructor() {
    this.seedDefaultReleases();
  }

  public getReleases(repoId?: string): Release[] {
    if (repoId) {
      return this.releases
        .filter((r) => r.repoId === repoId)
        .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    }
    return this.releases.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }

  public getReleaseById(id: string): Release | null {
    return this.releases.find((r) => r.id === id) || null;
  }

  public getAppCatalog(): Release[] {
    // Return latest release per repository for LAN App Catalog
    const map = new Map<string, Release>();
    for (const rel of this.releases) {
      if (!map.has(rel.repoId)) {
        map.set(rel.repoId, rel);
      }
    }
    return Array.from(map.values());
  }

  public createRelease(release: Omit<Release, 'id' | 'downloadCount' | 'isLatest'>): Release {
    const newRelease: Release = {
      ...release,
      id: `rel-${Date.now()}`,
      downloadCount: 0,
      isLatest: true,
    };

    // Mark previous releases of the same repo as not latest
    this.releases.forEach((r) => {
      if (r.repoId === newRelease.repoId) {
        r.isLatest = false;
      }
    });

    this.releases.unshift(newRelease);
    return newRelease;
  }

  public incrementDownload(releaseId: string): void {
    const rel = this.getReleaseById(releaseId);
    if (rel) {
      rel.downloadCount += 1;
    }
  }

  private seedDefaultReleases() {
    this.releases = [
      {
        id: 'rel-pos-240',
        repoId: 'pos-terminal',
        repoName: 'pos-terminal',
        tagName: 'v2.4.0',
        title: 'POS Terminal Release v2.4.0 (Windows LAN Build)',
        notes: '- Added offline SQLite transaction caching\n- Barcode reader USB hid scanner listener\n- Fixed VAT receipt calculation on multi-item tickets\n- Zero-latency LAN receipt sync',
        version: '2.4.0',
        commitSha: 'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
        releaseDate: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        downloadCount: 42,
        isLatest: true,
        distributionChannel: 'stable',
        artifacts: [
          {
            id: 'art-pos-01',
            runId: 'run-prev-001',
            repoId: 'pos-terminal',
            name: 'pos-terminal Windows Installer (.exe)',
            fileName: 'pos-terminal-v2.4.0-win-x64.exe',
            filePath: '/artifacts/pos-terminal/pos-terminal-v2.4.0-win-x64.exe',
            sizeBytes: 51240000,
            sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            platform: 'Windows x64',
            createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
          },
          {
            id: 'art-pos-02',
            runId: 'run-prev-001',
            repoId: 'pos-terminal',
            name: 'pos-terminal MSI Enterprise Package (.msi)',
            fileName: 'pos-terminal-v2.4.0-win-x64.msi',
            filePath: '/artifacts/pos-terminal/pos-terminal-v2.4.0-win-x64.msi',
            sizeBytes: 54100000,
            sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            platform: 'Windows MSI',
            createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
          },
        ],
      },
      {
        id: 'rel-inv-120',
        repoId: 'inventory-service',
        repoName: 'inventory-service',
        tagName: 'v1.2.0',
        title: 'Warehouse Inventory Daemon v1.2.0 (.NET 8)',
        notes: '- Self-contained single-file binary\n- High throughput batch scanner buffer\n- Memory usage reduced by 35%',
        version: '1.2.0',
        commitSha: '8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        downloadCount: 18,
        isLatest: true,
        distributionChannel: 'stable',
        artifacts: [
          {
            id: 'art-inv-01',
            runId: 'run-inv-001',
            repoId: 'inventory-service',
            name: 'Inventory Daemon Windows Service (.zip)',
            fileName: 'inventory-service-v1.2.0-win-x64.zip',
            filePath: '/artifacts/inventory-service/inventory-service-v1.2.0-win-x64.zip',
            sizeBytes: 28400000,
            sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            platform: 'Windows x64 (.NET 8)',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          },
        ],
      },
      {
        id: 'rel-gw-091',
        repoId: 'lan-gateway',
        repoName: 'lan-gateway',
        tagName: 'v0.9.1',
        title: 'LAN Gateway Proxy v0.9.1 (Rust Native)',
        notes: '- Tokio asynchronous networking engine\n- Zero CPU usage when idle',
        version: '0.9.1',
        commitSha: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        downloadCount: 65,
        isLatest: true,
        distributionChannel: 'stable',
        artifacts: [
          {
            id: 'art-gw-01',
            runId: 'run-gw-001',
            repoId: 'lan-gateway',
            name: 'LAN Gateway Binary (.tar.gz)',
            fileName: 'lan-gateway-v0.9.1-x64.tar.gz',
            filePath: '/artifacts/lan-gateway/lan-gateway-v0.9.1-x64.tar.gz',
            sizeBytes: 12500000,
            sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
            platform: 'Linux / Windows x64',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          },
        ],
      },
    ];
  }
}
