import { GitDriveSettings, NetworkMode, RunnerNode } from '../types/settings.types.js';

export class SettingsService {
  private settings: GitDriveSettings;

  constructor() {
    this.settings = {
      networkMode: 'lan-only',
      blockExternalEgress: true,
      enableSecretMasking: true,
      customSecretPatterns: ['SECRET_TOKEN_9921', 'LAN_ACCESS_KEY_XYZ', 'PRIVATE_PASS_884'],
      artifactRetentionDays: 30,
      enforceShaProvenance: true,
      lanSigningKeyId: 'GPG-KEY-GITDRIVE-LAN-2026-X4',
      runners: [
        {
          id: 'runner-lan-01',
          name: 'runner-lan-01 (Host Daemon)',
          type: 'host-daemon',
          status: 'online',
          concurrency: 4,
          lastHeartbeat: new Date().toISOString(),
        },
        {
          id: 'runner-sandbox-02',
          name: 'runner-sandbox-02 (Process Jail)',
          type: 'process-jail',
          status: 'online',
          concurrency: 2,
          lastHeartbeat: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  public getSettings(): GitDriveSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<GitDriveSettings>): GitDriveSettings {
    if (partial.networkMode && !['airgapped', 'lan-only', 'controlled'].includes(partial.networkMode)) {
      throw new Error(`Invalid network mode: ${partial.networkMode}`);
    }

    if (partial.artifactRetentionDays !== undefined && partial.artifactRetentionDays < 1) {
      throw new Error('Artifact retention must be at least 1 day');
    }

    this.settings = {
      ...this.settings,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    return { ...this.settings };
  }

  public addSecretPattern(pattern: string): GitDriveSettings {
    const trimmed = pattern.trim();
    if (!trimmed) throw new Error('Secret pattern cannot be empty');
    if (!this.settings.customSecretPatterns.includes(trimmed)) {
      this.settings.customSecretPatterns.push(trimmed);
      this.settings.updatedAt = new Date().toISOString();
    }
    return { ...this.settings };
  }

  public removeSecretPattern(pattern: string): GitDriveSettings {
    this.settings.customSecretPatterns = this.settings.customSecretPatterns.filter((p) => p !== pattern);
    this.settings.updatedAt = new Date().toISOString();
    return { ...this.settings };
  }

  public registerRunner(name: string, type: RunnerNode['type'], concurrency: number = 2): RunnerNode {
    const id = `runner-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const runner: RunnerNode = {
      id,
      name,
      type,
      status: 'online',
      concurrency: Math.max(1, concurrency),
      lastHeartbeat: new Date().toISOString(),
    };

    this.settings.runners.push(runner);
    this.settings.updatedAt = new Date().toISOString();
    return runner;
  }

  public deregisterRunner(id: string): boolean {
    const initialLen = this.settings.runners.length;
    this.settings.runners = this.settings.runners.filter((r) => r.id !== id);
    if (this.settings.runners.length !== initialLen) {
      this.settings.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}
