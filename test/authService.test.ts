import test from 'node:test';
import assert from 'node:assert/strict';

import { buildUserProfilePayload } from '@/src/services/authProfileUtils.ts';

test('buildUserProfilePayload normalizes email and trims profile values', () => {
  const payload = buildUserProfilePayload({
    uid: 'abc123',
    email: '  Admin@Example.com  ',
    role: 'admin',
    isVerified: false,
    isApproved: true,
    name: '  Jane Admin  ',
  });

  assert.equal(payload.email, 'admin@example.com');
  assert.equal(payload.name, 'Jane Admin');
  assert.equal(payload.role, 'admin');
  assert.equal(payload.isApproved, true);
  assert.equal(payload.isVerified, false);
  assert.ok(payload.createdAt);
  assert.ok(payload.updatedAt);
});
