export interface Repository {
  id: string;
  name: string;
  description: string;
  defaultBranch: string;
  isPrivate: boolean;
  path: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  stars: number;
  forks: number;
}

export interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  extension?: string;
}

export interface FileBlob {
  path: string;
  content: string;
  size: number;
  isBinary: boolean;
}

export interface DiffFile {
  oldPath: string;
  newPath: string;
  status: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
  diffText: string;
}

export interface ProjectEvidence {
  file: string;
  matchedRule: string;
  reason: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'needs-confirmation';

export interface ProjectDetection {
  detected: boolean;
  projectFamily: string;
  framework: string;
  buildTool: string;
  testTool: string;
  packageFormat: string;
  targetPlatform: string;
  confidence: ConfidenceLevel;
  evidence: ProjectEvidence[];
  suggestedWorkflowName: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  phase: 'checkout' | 'setup' | 'dependencies' | 'build' | 'test' | 'package' | 'release' | 'distribute';
  command: string;
  runnerLabel: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  dependencies: string[];
  evidenceCitation?: string;
}

export interface WorkflowDefinition {
  id: string;
  repoId: string;
  name: string;
  version: string;
  description: string;
  triggers: string[];
  targetOS: string;
  nodes: WorkflowNode[];
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  timestamp: string;
  stepId: string;
  text: string;
  stream: 'stdout' | 'stderr' | 'system';
}

export interface Artifact {
  id: string;
  runId: string;
  repoId: string;
  name: string;
  fileName: string;
  filePath: string;
  sizeBytes: number;
  sha256: string;
  platform: string;
  createdAt: string;
}

export interface PipelineRun {
  id: string;
  workflowId: string;
  repoId: string;
  repoName: string;
  commitSha: string;
  branch: string;
  trigger: string;
  status: 'queued' | 'running' | 'passed' | 'failed' | 'canceled';
  startTime: string;
  endTime?: string;
  duration?: number;
  currentStepId?: string;
  nodes: WorkflowNode[];
  logs: LogEntry[];
  artifacts: Artifact[];
}

export interface Release {
  id: string;
  repoId: string;
  repoName: string;
  tagName: string;
  title: string;
  notes: string;
  version: string;
  commitSha: string;
  artifacts: Artifact[];
  releaseDate: string;
  downloadCount: number;
  isLatest: boolean;
  distributionChannel: 'stable' | 'beta' | 'lan-nightly';
}
