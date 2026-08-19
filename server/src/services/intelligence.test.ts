import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { IntelligenceService } from './intelligence.service.js';
import { GitService } from './git.service.js';

test('Workflow Intelligence - Analyzes Node/Electron Repository', () => {
  const gitService = new GitService();
  const intelligenceService = new IntelligenceService();

  const repo = gitService.createRepository('test-electron-pos', 'Test POS Electron App', 'TypeScript', true);
  fs.writeFileSync(
    path.join(repo.path, 'package.json'),
    JSON.stringify({
      name: 'test-electron-pos',
      scripts: { build: 'vite build', package: 'electron-builder' },
      dependencies: { electron: '^33.0.0', react: '^18.3.0' },
    }),
    'utf8'
  );

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

  // Cleanup test repo
  fs.rmSync(repo.path, { recursive: true, force: true });
});

test('Workflow Intelligence - Analyzes .NET Service', () => {
  const gitService = new GitService();
  const intelligenceService = new IntelligenceService();

  const repo = gitService.createRepository('test-dotnet-inventory', 'Test .NET Service', 'C#', true);
  fs.writeFileSync(
    path.join(repo.path, 'Service.csproj'),
    `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>`,
    'utf8'
  );

  const detection = intelligenceService.analyzeRepository(repo);
  assert.strictEqual(detection.detected, true);
  assert.strictEqual(detection.projectFamily, 'dotnet');
  assert.strictEqual(detection.packageFormat, 'single-file-exe');
  assert.strictEqual(detection.confidence, 'high');

  const workflow = intelligenceService.generateWorkflowFromDetection(repo, detection);
  const buildNode = workflow.nodes.find((n) => n.phase === 'build');
  assert.ok(buildNode?.command.includes('dotnet build'));

  // Cleanup test repo
  fs.rmSync(repo.path, { recursive: true, force: true });
});

test('Workflow Intelligence - Analyzes Rust LAN Gateway', () => {
  const gitService = new GitService();
  const intelligenceService = new IntelligenceService();

  const repo = gitService.createRepository('test-rust-gateway', 'Test Rust Gateway', 'Rust', false);
  fs.writeFileSync(
    path.join(repo.path, 'Cargo.toml'),
    `[package]\nname = "test-rust-gateway"\nversion = "0.1.0"\n`,
    'utf8'
  );

  const detection = intelligenceService.analyzeRepository(repo);
  assert.strictEqual(detection.detected, true);
  assert.strictEqual(detection.projectFamily, 'rust');
  assert.strictEqual(detection.confidence, 'high');

  const workflow = intelligenceService.generateWorkflowFromDetection(repo, detection);
  const testNode = workflow.nodes.find((n) => n.phase === 'test');
  assert.ok(testNode?.command.includes('cargo test'));

  // Cleanup test repo
  fs.rmSync(repo.path, { recursive: true, force: true });
});
