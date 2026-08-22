import test from 'node:test';
import assert from 'node:assert/strict';
import { StorageService } from '../src/services/storageService.ts';

test('buildStoragePath sanitizes filenames and keeps the expected folder structure', () => {
  const path = StorageService.buildStoragePath('downloads', 'user-123', 'My Resume 2025.PDF');
  assert.match(path, /^downloads\/user-123\//);
  assert.doesNotMatch(path, /\s/);
  assert.match(path, /\.pdf$/i);
});

test('buildAdminStoragePath creates a safe admin path for uploads', () => {
  const path = StorageService.buildAdminStoragePath('blogs', 'My Image.JPG');
  assert.match(path, /^blogs\//);
  assert.doesNotMatch(path, /\s/);
  assert.match(path, /\.jpg$/i);
});
