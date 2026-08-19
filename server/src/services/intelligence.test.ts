import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { IntelligenceService } from './intelligence.service.js';
import { GitService } from './git.service.js';

test('Workflow Intelligence - Analyzes Node/Electron POS Repository', () => {
  const gitService = new GitService();
  const intelligenceService = new IntelligenceService();

  const repo = gitService.getRepositoryById('pos-terminal');
  assert.ok(repo, 'pos-terminal repository should exist');

  const detection = intelligenceService.analyzeRepository(repo);
  assert.strictEqual(detection.detected, true);
  assert.strictEqual(detection.projectFamily, 'node-electron');
  assert.strictEqual(detection.packageFormat, 'exe/msi');
  assert.strictEqual(detection.confidence, 'high');
  assert.ok(detection.evidence.length >= 2, 'Should have multiple evidence citations');

  const workflow = intelligenceService.generateWorkflowFromDetection(repo, detection);
  assert.strictEqual(workflow.nodes.length, 8, 'Should generate 8 delivery pipeline stages');
  assert.strictEqual(workflow.nodes[0].phase, 'checkout');
  assert.strictEqual(workflow.nodes[7].phase, 'distribute');
});

test('Workflow Intelligence - Analyzes .NET Warehouse Service', () => {
  const gitService = new GitService();
  const intelligenceService = new IntelligenceService();

  const repo = gitService.getRepositoryById('inventory-service');
  assert.ok(repo, 'inventory-service repository should exist');

  const detection = intelligenceService.analyzeRepository(repo);
  assert.strictEqual(detection.detected, true);
  assert.strictEqual(detection.projectFamily, 'dotnet');
  assert.strictEqual(detection.packageFormat, 'single-file-exe');
  assert.strictEqual(detection.confidence, 'high');

  const workflow = intelligenceService.generateWorkflowFromDetection(repo, detection);
  const buildNode = workflow.nodes.find((n) => n.phase === 'build');
  assert.ok(buildNode?.command.includes('dotnet build'));
});

test('Workflow Intelligence - Analyzes Rust LAN Gateway', () => {
  const gitService = new GitService();
  const intelligenceService = new IntelligenceService();

  const repo = gitService.getRepositoryById('lan-gateway');
  assert.ok(repo, 'lan-gateway repository should exist');

  const detection = intelligenceService.analyzeRepository(repo);
  assert.strictEqual(detection.detected, true);
  assert.strictEqual(detection.projectFamily, 'rust');
  assert.strictEqual(detection.confidence, 'high');

  const workflow = intelligenceService.generateWorkflowFromDetection(repo, detection);
  const testNode = workflow.nodes.find((n) => n.phase === 'test');
  assert.ok(testNode?.command.includes('cargo test'));
});
