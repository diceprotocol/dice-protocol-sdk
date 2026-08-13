# Dice Protocol SDK

## Status

- **Stage:** `@diceprotocol/sdk` v1.0.2 is published.
- **Environment:** Public SDK repository and npm package.
- **Goal:** Keep package source, tarball, Solidity interfaces, examples, license, and documentation aligned to DiceEntropy v10.
- **Next step:** Reconcile package description and license artifacts, build, test, and prepare a patch release for human-approved publication.

## Architecture

- Package: `@diceprotocol/sdk`.
- Robinhood Chain mainnet: chain ID `4663`.
- DiceEntropy v10: `0xd8a0680e7699526b57140ed4eafdcc7219dc0a0c`.
- Provider: `0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6`.
- Exact fee: `0.000025 ETH`.
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
