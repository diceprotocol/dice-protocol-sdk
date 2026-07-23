# @diceprotocol/sdk

TypeScript SDK for [Dice Protocol](https://diceprotocol.world) — trustless commit-reveal randomness oracle on Robinhood Chain.

## Install

```bash
npm install @diceprotocol/sdk
```

## Quick Start

```typescript
import { DiceProtocol } from '@diceprotocol/sdk';
import { Wallet } from 'ethers';

const dice = new DiceProtocol({
  rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
  contractAddress: '0x2Ad7fC99E3d8A8dA72802936Dd5145bF672206b0',
});

const signer = new Wallet(privateKey);

// Request randomness
const userRandom = DiceProtocol.generateUserRandom();
const seq = await dice.requestRandom(signer, undefined, userRandom, 200000);

// Listen for reveal
dice.onReveal((event) => {
  console.log('Random number:', event.randomNumber);
});
```

## Solidity Interfaces

Copy the interface files from [`solidity/`](./solidity) into your project.

## License

MIT
