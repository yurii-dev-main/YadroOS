import assert from 'node:assert/strict';
import test from 'node:test';

import { totpService } from '../../src/security/2fa/totp.service';

test('totpService generates verifiable tokens', async () => {
  const { secret } = await totpService.generateSetupPayload('user@example.com', 'YadroOS');
  const token = await totpService.generateToken(secret, Date.now());
  const isValid = await totpService.verifyToken({ token, secret, window: 0 });
  assert.equal(isValid, true);
});

test('totpService hashes and verifies backup codes', async () => {
  const codes = await totpService.generateBackupCodes();
  const hashed = await totpService.hashBackupCodes(codes);
  const isValid = await totpService.verifyBackupCode(codes[0], hashed);
  assert.equal(isValid, true);
});
