import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEFAULT_CALLBACK_GAS_LIMIT,
  resolveCallbackGasLimit,
} from './callbackGas';

test('DEFAULT_CALLBACK_GAS_LIMIT is the documented 200000 units', () => {
  assert.equal(DEFAULT_CALLBACK_GAS_LIMIT, 200_000);
});

test('omitted gasLimit resolves to 200000, not provider-default 0', () => {
  assert.equal(resolveCallbackGasLimit(), 200_000);
  assert.equal(resolveCallbackGasLimit(undefined), 200_000);
});

test('explicit 0 is preserved as an opt-in to the provider default', () => {
  assert.equal(resolveCallbackGasLimit(0), 0);
});

test('explicit nonzero callback gas is passed through unchanged', () => {
  assert.equal(resolveCallbackGasLimit(100_000), 100_000);
  assert.equal(resolveCallbackGasLimit(500_000), 500_000);
});

test('requestRandom source no longer defaults the callback gas to 0', () => {
  const src = readFileSync(join(__dirname, 'index.js'), 'utf8');
  assert.match(src, /resolveCallbackGasLimit/);
  assert.doesNotMatch(
    src,
    /requestRandom\([\s\S]*gasLimit\s*=\s*0/,
    'requestRandom must not default gasLimit to 0',
  );
});
