# Dice Protocol SDK

## Status

- **Stage:** `@diceprotocol/sdk@1.0.3` published 2026-09-02 (callback default 200000, 10-field Request/`feePaid`, Solidity imports under `solidity/`). Registry version endpoint confirmed `1.0.3`.
- **Environment:** Public SDK repository and npm package.
- **Goal:** Keep package source, tarball, Solidity interfaces, examples, license, and documentation aligned to DiceEntropy v10.
- **Next step:** Keep source, tarball, Solidity interfaces, examples, license, and documentation aligned to DiceEntropy v10. Do not republish without explicit approval.

## Architecture

- Package: `@diceprotocol/sdk`.
- Robinhood Chain mainnet: chain ID `4663`.
- DiceEntropy v10: `0xd8a0680e7699526b57140ed4eafdcc7219dc0a0c`.
- Provider: `0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6`.
- Exact fee: `0.000025 ETH`.
- SDK callback gas default: `DEFAULT_CALLBACK_GAS_LIMIT = 200000`. Omitted `requestRandom` gas does not send `0`.
- Request ABI: 10 fields. `getRequest()` maps `feePaid` from index 9 (`src/requestInfo.ts`).
- License: Apache-2.0 with Pyth Entropy attribution in `NOTICE`.

## Build & Deploy

```bash
cd /root/dice-protocol-sdk
npm ci
npm run build
npm test
npm pack --dry-run
```

Publishing to npm or GitHub requires explicit human approval.

## Code Conventions

- TypeScript, ethers v6, strict types.
- Conventional commits.
- Keep `src/abi.json` and `dist/abi.json` aligned.
- Public examples use exact fee helpers and v10 addresses.
- Never include credentials or operational configuration.

## Testing

- Run build and tests.
- Inspect `npm pack --dry-run` contents.
- Scan packed files for stale addresses, fees, package names, licenses, and unsupported claims.

## Key Paths

- `src/index.ts`
- `src/callbackGas.ts`
- `src/requestInfo.ts`
- `src/abi.json`
- `dist/`
- `solidity/`
- `README.md`
- `SKILL.md`
- `package.json`
- `LICENSE`
- `NOTICE`

## Kanban Board

- Hermes board: `dice-protocol`.
