import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SettingsService } from '../services/settings.service.js';

test('Settings Service - Fetches Default LAN Security Settings', () => {
  const service = new SettingsService();
  const settings = service.getSettings();

  assert.equal(settings.networkMode, 'lan-only');
  assert.equal(settings.blockExternalEgress, true);
  assert.equal(settings.enableSecretMasking, true);
  assert.equal(settings.runners.length, 2);
  assert.equal(settings.enforceShaProvenance, true);
});

test('Settings Service - Updates Operating Mode and Retention Policy', () => {
  const service = new SettingsService();
  const updated = service.updateSettings({
    networkMode: 'airgapped',
    artifactRetentionDays: 60,
    blockExternalEgress: true,
  });

  assert.equal(updated.networkMode, 'airgapped');
  assert.equal(updated.artifactRetentionDays, 60);

  assert.throws(() => {
    // @ts-ignore
    service.updateSettings({ networkMode: 'invalid-mode' });
  }, /Invalid network mode/);
});

test('Settings Service - Manages Custom Secret Masking Patterns', () => {
  const service = new SettingsService();
  
  service.addSecretPattern('API_KEY_SEC_1109');
  let settings = service.getSettings();
  assert.ok(settings.customSecretPatterns.includes('API_KEY_SEC_1109'));

  service.removeSecretPattern('API_KEY_SEC_1109');
  settings = service.getSettings();
  assert.ok(!settings.customSecretPatterns.includes('API_KEY_SEC_1109'));
});

test('Settings Service - Registers and Deregisters Runner Fleet Nodes', () => {
  const service = new SettingsService();
  
  const runner = service.registerRunner('runner-worker-03', 'container-lan', 4);
  assert.ok(runner.id.startsWith('runner-'));
  assert.equal(runner.name, 'runner-worker-03');
  assert.equal(runner.concurrency, 4);

  let settings = service.getSettings();
  assert.equal(settings.runners.length, 3);

  const removed = service.deregisterRunner(runner.id);
  assert.equal(removed, true);

  settings = service.getSettings();
  assert.equal(settings.runners.length, 2);
});
