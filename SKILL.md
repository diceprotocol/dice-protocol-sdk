# Dice Protocol Skill

## Agent-Friendly Onchain Randomness

Dice Protocol is a commit-reveal randomness oracle for Robinhood Chain (chain ID 4663). Any AI agent — BankrBot, AI wallet agents, DeFi automation agents, game-playing agents — can request verifiable onchain randomness with 3 lines of code.

This SKILL.md is written for **agents**, not just humans. An agent reading this file should be able to integrate Dice Protocol without any human help.

---

## Quick Reference

| Property | Value |
|----------|-------|
| Chain ID | 4663 (Robinhood Chain mainnet) |
| Contract | `0x2Ad7fC99E3d8A8dA72802936Dd5145bF672206b0` |
| Keeper (Provider) | `0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6` |
| Fee | 0.000025 ETH (25000000000000 wei) per request |
| Latency | ~3.5 seconds (request → callback) |
| Keepers | Primary + backup replica with 10s failover |
| Verification | Sourcify `exact_match` at `repo.sourcify.dev/4663/0x2ad7fc99e3d8a8da72802936dd514bf672206b0` |

---

## Integration Patterns

### Pattern 1: Solidity Smart Contract (Consumer)

Best for: onchain games, lotteries, DeFi protocols, NFT mints.

```solidity
import { IEntropyConsumer } from "@diceprotocol/sdk/IEntropyConsumer.sol";
import { IEntropy } from "@diceprotocol/sdk/IEntropy.sol";

contract MyGame is IEntropyConsumer {
    IEntropy public immutable dice;
    address public provider = 0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6;

    constructor(address _dice) {
        dice = IEntropy(_dice);
    }

    function playGame(bytes32 userRandom) external payable {
        uint128 fee = dice.getFee(provider);
        require(msg.value >= fee, "Insufficient fee");

        uint64 seq = dice.requestV2{value: fee}(
            provider,
            userRandom,
            200000  // gasLimit for callback
        );

        // Store mapping from seq → requester
    }

    // Called automatically by the keeper when randomness is revealed
    function entropyCallback(
        uint64 sequence,
        bytes32 randomNumber
    ) internal override {
        // Use randomNumber — it's unbiased and verifiable
    }

    // Required: return your own randomness provider address
    function getEntropyProvider() external view returns (address) {
        return provider;
    }
}
```

### Pattern 2: TypeScript SDK (Offchain Agent)

Best for: AI agents, automation scripts, backend services.

```bash
npm install @diceprotocol/sdk ethers
```

```typescript
import { DiceProtocol } from '@diceprotocol/sdk';
import { Wallet, randomBytes } from 'ethers';

const dice = new DiceProtocol({
  rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
  contractAddress: '0x2Ad7fC99E3d8A8dA72802936Dd5145bF672206b0',
});

const signer = new Wallet(process.env.PRIVATE_KEY!);

// 1. Get the fee
const fee = await dice.getFee('0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6');

// 2. Request randomness (user generates their own random contribution)
const userRandom = randomBytes(32);
const seqNum = await dice.requestRandom(
  signer,
  '0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6',
  userRandom,
  200000  // gasLimit
);

// 3. Listen for the reveal callback (~3.5 seconds)
dice.onReveal((event) => {
  if (event.sequence === seqNum) {
    console.log('Random number:', event.randomNumber);
  }
});
```

### Pattern 3: Raw Cast Commands (Quick Testing)

```bash
# Get fee
cast call 0x2Ad7fC99E3d8A8dA72802936Dd5145bF672206b0 \
  "getFee(address)(uint128)" \
  0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6 \
  --rpc-url https://rpc.mainnet.chain.robinhood.com

# Request randomness (MUST include --value to pay the fee)
cast send 0x2Ad7fC99E3d8A8dA72802936Dd5145bF672206b0 \
  "requestV2(address,bytes32,uint32)" \
  0x8741b8a825644D9Ef18Faf2DAB5e9b47B900F2b6 \
  $(cast keccak 0xdeadbeef) \
  200000 \
  --value 25000000000000 \
  --rpc-url https://rpc.mainnet.chain.robinhood.com \
  --private-key $PK
```

---

## Agent-Specific Notes

### For BankrBot / Agent Orchestration

Agents autonomously calling Dice Protocol should:

1. **Always pass `msg.value` = exact fee.** Use `getFee(provider)` before every call — the fee can change.
2. **Generate `userRandomNumber` locally.** Use a CSPRNG. This is the agent's contribution to randomness — the provider cannot manipulate it.
3. **Wait for ~3.5 seconds.** The keeper reveals within this window. Poll for the `Revealed` event or use the SDK's `onReveal()` listener.
4. **Verify the random number.** The final value is `keccak256(userRandomness || providerContribution)`. Both contributions are emitted in the `Revealed` event. You can verify onchain that neither party biased the result.

### Why It's Agent-Safe

- **Immutability:** Contract is deployed with no proxy, no upgrade path. An agent's integration won't break.
- **No offchain dependency for verification:** Everything needed to verify randomness is onchain (hash chain commitment + reveal values + Keccak256 combine).
- **Deterministic fee:** `getFee()` always returns the current fee. No surprise costs.
- **Atomic:** Request + payment happen in a single transaction. No partial states.
- **Keeper auto-reveal:** The agent doesn't need to reveal anything — the keeper handles it automatically within ~3.5s.

### Gas Estimation

- Request tx: ~50,000 gas (~0.000005 ETH at 0.1 gwei)
- Reveal tx (paid by keeper, not you): ~53,506 gas
- Callback gas: from your `gasLimit` param (default 200,000)
- Total cost per request: 0.000025 ETH (fee) + ~0.000005 ETH (gas) ≈ $0.00003

---

## Reference Links

- **npm:** `@diceprotocol/sdk`
- **GitHub SDK:** https://github.com/diceprotocol/dice-protocol-sdk
- **GitHub Docs:** https://github.com/diceprotocol/dice-protocol-docs
- **Website:** https://diceprotocol.world
- **Contract on Blockscout:** https://robinhoodchain.blockscout.com/address/0x2Ad7fC99E3d8A8dA72802936Dd5145bF672206b0
- **Sourcify verification:** https://repo.sourcify.dev/4663/0x2ad7fc99e3d8a8da72802936dd514bf672206b0
- **Whitepaper PDF:** https://diceprotocol.world/dice-protocol-whitepaper.pdf

---

## ABI Summary

Key functions an agent needs:

| Function | Who Calls | Purpose |
|----------|-----------|---------|
| `getFee(address provider)` | Anyone | Get current request fee in wei |
| `requestV2(address, bytes32, uint32)` | Consumer payable | Request randomness (pay fee via msg.value) |
| `revealWithCallback(...)` | Keeper only | Reveal hash chain value + trigger callback |
| `getProviderInfo(address)` | Anyone | Query provider state (sequence, commitment) |
| `withdrawFees(uint128)` | Admin | Withdraw accrued fees to vault |
| `setFee(uint128)` | Admin | Change request fee |

Events:

| Event | When | Topics |
|-------|------|--------|
| `Requested(address, address, uint64, bytes32, uint32)` | User requests randomness | provider, seq, userRandom, gasLimit |
| `Revealed(address, address, uint64, bytes32, bytes32, bytes32, bool, bytes, uint32, bytes)` | Keeper reveals | provider, seq, userRandom, providerContribution, randomNumber, callbackSuccess |

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `InsufficientFee()` | msg.value < getFee() | Pass exact fee as `--value` or `msg.value` |
| `NoSuchRequest()` | Request already revealed or doesn't exist | Check sequence number, don't double-request |
| `NoSuchProvider()` | Provider not registered or exhausted all 500K hashes | Use the correct keeper address |

---

## File Structure

```
dice-protocol-sdk/
├── SKILL.md              ← This file (agent integration guide)
├── sdk/
│   ├── src/
│   │   ├── index.ts      ← TypeScript SDK entry point
│   │   └── abi.json      ← Contract ABI
│   ├── solidity/
│   │   ├── IEntropy.sol          ← Consumer interface
│   │   ├── IEntropyConsumer.sol  ← Callback interface
│   │   └── DiceStructsV2.sol     ← Shared structs
│   └── package.json
└── README.md
```

---

## License

MIT. Use freely in any project, agent, or protocol.