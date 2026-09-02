/**
 * Quick smoke test — verifies the SDK can read from the testnet contract.
 */
const { DiceProtocol, ethers, DEFAULT_CALLBACK_GAS_LIMIT, resolveCallbackGasLimit } = require('./index');

async function main() {
  const dice = new DiceProtocol({
    rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
    contractAddress: '0xd8a0680e7699526b57140ed4eafdcc7219dc0a0c',
  });

  console.log('Contract:', dice.getAddress());

  // Read default provider
  const defaultProvider = await dice.getDefaultProvider();
  console.log('Default Provider:', defaultProvider);

  // Read protocol fee
  const protocolFee = await dice.getProtocolFee();
  console.log('Protocol Fee:', protocolFee.toString(), 'wei');

  // Read provider info
  const info = await dice.getProviderInfo(defaultProvider);
  console.log('Provider Info:');
  console.log('  Fee:', info.feeInWei.toString(), 'wei');
  console.log('  Sequence:', info.sequenceNumber.toString());
  console.log('  End Sequence:', info.endSequenceNumber.toString());
  console.log('  Commitment:', info.currentCommitment);
  console.log('  Chain remaining:', (info.endSequenceNumber - info.sequenceNumber).toString());

  // Read accrued treasury fees
  const accrued = await dice.getAccruedTreasuryFees();
  console.log('Accrued Treasury Fees:', accrued.toString(), 'wei');

  // Test utility functions
  const userRandom = DiceProtocol.generateUserRandom();
  console.log('\nGenerated user random:', userRandom);
  const commitment = DiceProtocol.computeUserCommitment(userRandom);
  console.log('User commitment:', commitment);

  // Test hash chain generation
  const chain = DiceProtocol.generateHashChain('0x' + 'ab'.repeat(32), 10);
  console.log('\nHash chain (10 values):');
  console.log('  Commitment (x_0):', chain.commitment);
  console.log('  First reveal (x_1):', chain.revelations[0]);
  console.log('  Last (x_9 = seed):', chain.revelations[8]);
  if (protocolFee !== 25000000000000n) throw new Error(`Unexpected protocol fee: ${protocolFee}`);
  if (info.endSequenceNumber <= info.sequenceNumber) throw new Error('Provider hash chain exhausted');
  if (info.defaultGasLimit !== 200000) throw new Error(`Unexpected provider default gas limit: ${info.defaultGasLimit}`);
  const { REQUEST_ABI_FIELDS } = require('./requestInfo');
  if (REQUEST_ABI_FIELDS.length !== 10 || REQUEST_ABI_FIELDS[9] !== 'feePaid') {
    throw new Error('Request tuple model must match the deployed 10-field ABI with feePaid at index 9');
  }
  const leftover = await dice.getRequest(defaultProvider, 0n);
  if (leftover.feePaid !== 25000000000000n) {
    throw new Error(`getRequest feePaid must be the stored protocol fee, got ${leftover.feePaid}`);
  }
  if (DEFAULT_CALLBACK_GAS_LIMIT !== 200000) throw new Error(`Unexpected SDK callback gas default: ${DEFAULT_CALLBACK_GAS_LIMIT}`);
  if (resolveCallbackGasLimit() !== 200000) throw new Error('Omitted gasLimit must resolve to 200000, not provider-default 0');
  if (resolveCallbackGasLimit(0) !== 0) throw new Error('Explicit 0 must remain an opt-in to the provider default');
  if (chain.revelations.length !== 9) throw new Error(`Expected 9 reveal values, got ${chain.revelations.length}`);
  if (chain.revelations[8] !== '0x' + 'ab'.repeat(32)) throw new Error('Hash-chain final reveal should equal seed');

  console.log('\n✅ SDK smoke test passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
