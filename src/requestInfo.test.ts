import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mapRequestInfo, REQUEST_ABI_FIELDS } from './requestInfo';

const ABI_PATH = join(__dirname, 'abi.json');

function getRequestComponents(name: 'getRequest' | 'getRequestV2') {
  const abi = JSON.parse(readFileSync(ABI_PATH, 'utf8')) as Array<{
    type?: string;
    name?: string;
    outputs?: Array<{ components?: Array<{ name: string; type: string }> }>;
  }>;
  const fn = abi.find((item) => item.type === 'function' && item.name === name);
  assert.ok(fn, `${name} missing from ABI`);
  return fn.outputs?.[0]?.components ?? [];
}

const LIVE_TEN_FIELD = [
  '0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6',
  0n,
  1n,
  '0x0adbbc6cd4e363617e4320e570c59a5437cabb292c47bc31d1d92593a028a7b7',
  25821044n,
  '0xCA30304254A2e4A56e67579a81398bd947de737A',
  false,
  1n,
  0n,
  25000000000000n,
];

test('packaged ABI Request tuple is the live 10-field layout with feePaid at index 9', () => {
  for (const name of ['getRequest', 'getRequestV2'] as const) {
    const comps = getRequestComponents(name);
    assert.equal(comps.length, 10, `${name} must decode 10 Request fields`);
    assert.deepEqual(
      comps.map((c) => c.name),
      [...REQUEST_ABI_FIELDS],
    );
    assert.equal(comps[9].name, 'feePaid');
    assert.equal(comps[9].type, 'uint128');
  }
});

test('mapRequestInfo reads feePaid from index 9 of the live 10-field tuple', () => {
  const info = mapRequestInfo(LIVE_TEN_FIELD);
  assert.equal(info.provider, LIVE_TEN_FIELD[0]);
  assert.equal(info.sequenceNumber, 0n);
  assert.equal(info.numHashes, 1);
  assert.equal(info.commitment, LIVE_TEN_FIELD[3]);
  assert.equal(info.blockNumber, 25821044n);
  assert.equal(info.requester, LIVE_TEN_FIELD[5]);
  assert.equal(info.useBlockhash, false);
  assert.equal(info.callbackStatus, 1);
  assert.equal(info.gasLimit10k, 0);
  assert.equal(info.feePaid, 25000000000000n);
});

test('mapRequestInfo prefers named feePaid when present (ethers Result)', () => {
  const named = Object.assign([...LIVE_TEN_FIELD], { feePaid: 25000000000000n });
  const info = mapRequestInfo(named);
  assert.equal(info.feePaid, 25000000000000n);
});

test('9-field tuple is rejected instead of mapping undefined feePaid', () => {
  const nine = LIVE_TEN_FIELD.slice(0, 9);
  assert.equal(nine.length, 9);
  assert.throws(
    () => mapRequestInfo(nine),
    /feePaid|10-field|Request ABI/,
  );
});
