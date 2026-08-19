export type NetworkMode = 'airgapped' | 'lan-only' | 'controlled';

export interface RunnerNode {
  id: string;
  name: string;
  type: 'host-daemon' | 'process-jail' | 'container-lan';
  status: 'online' | 'busy' | 'offline';
  concurrency: number;
  lastHeartbeat: string;
}

export interface GitDriveSettings {
  networkMode: NetworkMode;
  blockExternalEgress: boolean;
  enableSecretMasking: boolean;
  customSecretPatterns: string[];
  artifactRetentionDays: number;
  enforceShaProvenance: boolean;
  lanSigningKeyId: string;
  runners: RunnerNode[];
  updatedAt: string;
}
