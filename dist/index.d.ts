/**
 * Dice Protocol SDK
 * Agent-friendly RNG infrastructure for Robinhood Chain.
 *
 * Agent-friendly: immutable contract, deterministic fees, automatic reveals.
 * See SKILL.md in the repo root for full agent integration guide.
 *
 * Usage:
 *   import { DiceProtocol } from '@diceprotocol/sdk';
 *
 *   const dice = new DiceProtocol({
 *     rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
 *     contractAddress: '0xd8a0680e7699526b57140ed4eafdcc7219dc0a0c',
 *   });
 *
 *   // Request randomness
 *   const seq = await dice.requestRandom(signer, providerAddress, userRandom, gasLimit);
 *
 *   // Listen for reveals
 *   dice.onReveal((event) => {
 *     console.log('Random number:', event.randomNumber);
 *   });
 */
import { ethers, Wallet } from 'ethers';
export interface DiceProtocolConfig {
    rpcUrl: string;
    contractAddress: string;
    chainId?: number;
}
export interface ProviderInfo {
    feeInWei: bigint;
    accruedFeesInWei: bigint;
    originalCommitment: string;
    originalCommitmentSequenceNumber: bigint;
    commitmentMetadata: string;
    uri: string;
    endSequenceNumber: bigint;
    sequenceNumber: bigint;
    currentCommitment: string;
    currentCommitmentSequenceNumber: bigint;
    feeManager: string;
    maxNumHashes: number;
    defaultGasLimit: number;
}
export interface RequestInfo {
    provider: string;
    sequenceNumber: bigint;
    numHashes: number;
    commitment: string;
    blockNumber: bigint;
    requester: string;
    useBlockhash: boolean;
    callbackStatus: number;
    gasLimit10k: number;
    feePaid: bigint;
}
export interface RevealEvent {
    provider: string;
    caller: string;
    sequenceNumber: bigint;
    randomNumber: string;
    userContribution: string;
    providerContribution: string;
    callbackFailed: boolean;
    callbackReturnValue: string;
    callbackGasUsed: bigint;
}
export interface RequestEvent {
    provider: string;
    caller: string;
    sequenceNumber: bigint;
    userContribution: string;
    gasLimit: bigint;
}
export declare class DiceProtocol {
    private provider;
    private contract;
    private iface;
    constructor(config: DiceProtocolConfig);
    /**
     * Get the contract address
     */
    getAddress(): string;
    /**
     * Get the default provider address
     */
    getDefaultProvider(): Promise<string>;
    /**
     * Get the fee for a request
     * @param provider The provider address (optional, uses default)
     * @param gasLimit The gas limit for the callback (optional)
     */
    getFee(provider?: string, gasLimit?: number): Promise<bigint>;
    /**
     * Get provider information
     */
    getProviderInfo(provider: string): Promise<ProviderInfo>;
    /**
     * Get a request by provider and sequence number
     */
    getRequest(provider: string, sequenceNumber: bigint): Promise<RequestInfo>;
    /**
     * Get the refund delay in blocks.
     */
    getRefundDelayBlocks(): Promise<bigint>;
    /**
     * Get accrued protocol fees
     */
    getAccruedTreasuryFees(): Promise<bigint>;
    /**
     * Get the current protocol fee per request
     */
    getProtocolFee(): Promise<bigint>;
    /**
     * Get total accrued protocol fees
     */
    getAccruedFees(): Promise<bigint>;
    /**
     * Request a random number from a provider.
     * @param provider The provider address (optional, uses default)
     * @param userRandomNumber 32-byte random number (generate with crypto.getRandomValues)
     * @param gasLimit Gas limit for the callback (optional, 0 = provider default)
     * @param signer A Wallet or signer to submit the transaction
     * @returns The assigned sequence number
     */
    requestRandom(signer: Wallet, provider: string | undefined, userRandomNumber: string, gasLimit?: number): Promise<bigint>;
    /**
     * Reveal the provider's random number (called by the provider/keeper).
     * @param signer The provider's wallet
     * @param sequenceNumber The request sequence number
     * @param userRandomNumber The user's random number (from the request)
     * @param providerRevelation The provider's hash chain value for this sequence
     */
    revealWithCallback(signer: Wallet, sequenceNumber: bigint, userRandomNumber: string, providerRevelation: string): Promise<string>;
    /**
     * Admin-only: register a provider at a specific address via registerFor.
     * @param signer Admin wallet
     * @param providerAddress Provider address to register
     * @param commitment The hash chain commitment (x_0)
     * @param chainLength Number of values in the hash chain
     * @param uri Optional URI for revelation retrieval
     * @param feeInWei Unused in single-fee model; retained for ABI compatibility
     */
    registerProviderFor(signer: Wallet, providerAddress: string, commitment: string, chainLength: number, uri?: string, feeInWei?: bigint): Promise<string>;
    /**
     * Admin-only: withdraw accrued protocol fees to the vault.
     * @param signer Admin wallet
     * @param amount Amount to withdraw in wei
     */
    withdrawFees(signer: Wallet, amount: bigint): Promise<string>;
    /**
     * Refund a stuck active request after the refund timeout.
     * Only the original requester can call this.
     */
    refundRequest(signer: Wallet, provider: string, sequenceNumber: bigint): Promise<string>;
    /**
     * Listen for new randomness requests.
     */
    onRequest(callback: (event: RequestEvent) => void): void;
    /**
     * Listen for reveal events (random numbers delivered).
     */
    onReveal(callback: (event: RevealEvent) => void): void;
    /**
     * Stop all event listeners.
     */
    removeAllListeners(): void;
    /**
     * Generate a random 32-byte value (for user contribution).
     */
    static generateUserRandom(): string;
    /**
     * Compute the user commitment from a random number.
     */
    static computeUserCommitment(userRandom: string): string;
    /**
     * Construct a provider commitment from a revelation and the number of hashes.
     * Repeatedly hashes the revelation `numHashes` times.
     */
    static constructProviderCommitment(numHashes: number, revelation: string): string;
    /**
     * Generate a full hash chain from a seed.
     * @param seed The random seed (32 bytes hex)
     * @param length Number of values in the chain
     * @returns { commitment: x_0, revelations: [x_1, x_2, ...] }
     */
    static generateHashChain(seed: string, length: number): {
        commitment: string;
        revelations: string[];
    };
    /**
     * Combine user and provider random values.
     */
    static combineRandom(userRandom: string, providerRandom: string, blockHash?: string): string;
}
export { ethers };
