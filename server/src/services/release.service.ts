import { Release, Artifact } from '../types/gitdrive.types.js';

export class ReleaseService {
  private releases: Release[] = [];

  constructor() {}

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
}
