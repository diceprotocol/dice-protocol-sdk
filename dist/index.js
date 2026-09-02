"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethers = exports.DiceProtocol = exports.REQUEST_ABI_FIELDS = exports.mapRequestInfo = exports.resolveCallbackGasLimit = exports.DEFAULT_CALLBACK_GAS_LIMIT = void 0;
const ethers_1 = require("ethers");
Object.defineProperty(exports, "ethers", { enumerable: true, get: function () { return ethers_1.ethers; } });
const callbackGas_1 = require("./callbackGas");
const requestInfo_1 = require("./requestInfo");
var callbackGas_2 = require("./callbackGas");
Object.defineProperty(exports, "DEFAULT_CALLBACK_GAS_LIMIT", { enumerable: true, get: function () { return callbackGas_2.DEFAULT_CALLBACK_GAS_LIMIT; } });
Object.defineProperty(exports, "resolveCallbackGasLimit", { enumerable: true, get: function () { return callbackGas_2.resolveCallbackGasLimit; } });
var requestInfo_2 = require("./requestInfo");
Object.defineProperty(exports, "mapRequestInfo", { enumerable: true, get: function () { return requestInfo_2.mapRequestInfo; } });
Object.defineProperty(exports, "REQUEST_ABI_FIELDS", { enumerable: true, get: function () { return requestInfo_2.REQUEST_ABI_FIELDS; } });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const abi = require('./abi.json');
class DiceProtocol {
    provider;
    contract;
    iface;
    constructor(config) {
        this.provider = new ethers_1.JsonRpcProvider(config.rpcUrl);
        this.contract = new ethers_1.Contract(config.contractAddress, abi, this.provider);
        this.iface = new ethers_1.Interface(abi);
    }
    /**
     * Get the contract address
     */
    getAddress() {
        return this.contract.target;
    }
    /**
     * Get the default provider address
     */
    async getDefaultProvider() {
        return await this.contract.getDefaultProvider();
    }
    /**
     * Get the fee for a request
     * @param provider The provider address (optional, uses default)
     * @param gasLimit The gas limit for the callback (optional)
     */
    async getFee(provider, gasLimit) {
        const p = provider || (await this.getDefaultProvider());
        if (gasLimit !== undefined) {
            return await this.contract.getFeeV2(p, gasLimit);
        }
        return await this.contract.getFee(p);
    }
    /**
     * Get provider information
     */
    async getProviderInfo(provider) {
        const info = await this.contract.getProviderInfoV2(provider);
        return {
            feeInWei: info[0],
            accruedFeesInWei: info[1],
            originalCommitment: info[2],
            originalCommitmentSequenceNumber: info[3],
            commitmentMetadata: info[4],
            uri: info[5],
            endSequenceNumber: info[6],
            sequenceNumber: info[7],
            currentCommitment: info[8],
            currentCommitmentSequenceNumber: info[9],
            feeManager: info[10],
            maxNumHashes: Number(info[11]),
            defaultGasLimit: Number(info[12]),
        };
    }
    /**
     * Get a request by provider and sequence number
     */
    async getRequest(provider, sequenceNumber) {
        const req = await this.contract.getRequestV2(provider, sequenceNumber);
        return (0, requestInfo_1.mapRequestInfo)(req);
    }
    /**
     * Get the refund delay in blocks.
     */
    async getRefundDelayBlocks() {
        return await this.contract.getRefundDelayBlocks();
    }
    /**
     * Get accrued protocol fees
     */
    async getAccruedTreasuryFees() {
        return await this.contract.getAccruedFees();
    }
    /**
     * Get the current protocol fee per request
     */
    async getProtocolFee() {
        return await this.contract.getProtocolFee();
    }
    /**
     * Get total accrued protocol fees
     */
    async getAccruedFees() {
        return await this.contract.getAccruedFees();
    }
    // ============================================================
    //                    WRITE OPERATIONS
    // ============================================================
    /**
     * Request a random number from a provider.
     * @param provider The provider address (optional, uses default)
     * @param userRandomNumber 32-byte random number (generate with crypto.getRandomValues)
     * @param gasLimit Callback gas. Omitted uses {@link DEFAULT_CALLBACK_GAS_LIMIT} (200000).
     *   Pass 0 only to opt in to the live provider defaultGasLimit (mutable operator state).
     * @param signer A Wallet or signer to submit the transaction
     * @returns The assigned sequence number
     */
    async requestRandom(signer, provider, userRandomNumber, gasLimit) {
        const connectedContract = new ethers_1.Contract(this.contract.target, abi, signer);
        const p = provider || (await this.getDefaultProvider());
        const callbackGas = (0, callbackGas_1.resolveCallbackGasLimit)(gasLimit);
        const fee = await this.getFee(p, callbackGas);
        const tx = await connectedContract.requestV2(p, userRandomNumber, callbackGas, { value: fee });
        const receipt = await tx.wait();
        // Parse the Requested event to get the sequence number
        const logs = receipt.logs.map((log) => {
            try {
                return this.iface.parseLog(log);
            }
            catch {
                return null;
            }
        }).filter((e) => e && e.name === 'Requested');
        if (logs.length === 0)
            throw new Error('No Requested event in receipt');
        return logs[0].args.sequenceNumber;
    }
    /**
     * Reveal the provider's random number (called by the provider/keeper).
     * @param signer The provider's wallet
     * @param sequenceNumber The request sequence number
     * @param userRandomNumber The user's random number (from the request)
     * @param providerRevelation The provider's hash chain value for this sequence
     */
    async revealWithCallback(signer, sequenceNumber, userRandomNumber, providerRevelation) {
        const connectedContract = new ethers_1.Contract(this.contract.target, abi, signer);
        const provider = await signer.getAddress();
        const tx = await connectedContract.revealWithCallback(provider, sequenceNumber, userRandomNumber, providerRevelation);
        const receipt = await tx.wait();
        return receipt.hash;
    }
    /**
     * Admin-only: register a provider at a specific address via registerFor.
     * @param signer Admin wallet
     * @param providerAddress Provider address to register
     * @param commitment The hash chain commitment (x_0)
     * @param chainLength Number of values in the hash chain
     * @param uri Optional URI for revelation retrieval
     * @param feeInWei Unused in single-fee model; retained for ABI compatibility
     */
    async registerProviderFor(signer, providerAddress, commitment, chainLength, uri = '', feeInWei = 0n) {
        const connectedContract = new ethers_1.Contract(this.contract.target, abi, signer);
        const tx = await connectedContract.registerFor(providerAddress, feeInWei, commitment, '0x', chainLength, uri);
        const receipt = await tx.wait();
        return receipt.hash;
    }
    /**
     * Admin-only: withdraw accrued protocol fees to the vault.
     * @param signer Admin wallet
     * @param amount Amount to withdraw in wei
     */
    async withdrawFees(signer, amount) {
        const connectedContract = new ethers_1.Contract(this.contract.target, abi, signer);
        const tx = await connectedContract.withdrawFees(amount);
        const receipt = await tx.wait();
        return receipt.hash;
    }
    /**
     * Refund a stuck active request after the refund timeout.
     * Only the original requester can call this.
     */
    async refundRequest(signer, provider, sequenceNumber) {
        const connectedContract = new ethers_1.Contract(this.contract.target, abi, signer);
        const tx = await connectedContract.refundRequest(provider, sequenceNumber);
        const receipt = await tx.wait();
        return receipt.hash;
    }
    // ============================================================
    //                    EVENT LISTENERS
    // ============================================================
    /**
     * Listen for new randomness requests.
     */
    onRequest(callback) {
        this.contract.on('Requested', (provider, caller, sequenceNumber, userContribution, gasLimit) => {
            callback({
                provider,
                caller,
                sequenceNumber,
                userContribution,
                gasLimit,
            });
        });
    }
    /**
     * Listen for reveal events (random numbers delivered).
     */
    onReveal(callback) {
        this.contract.on('Revealed', (provider, caller, sequenceNumber, randomNumber, userContribution, providerContribution, callbackFailed, callbackReturnValue, callbackGasUsed) => {
            callback({
                provider,
                caller,
                sequenceNumber,
                randomNumber,
                userContribution,
                providerContribution,
                callbackFailed,
                callbackReturnValue,
                callbackGasUsed,
            });
        });
    }
    /**
     * Stop all event listeners.
     */
    removeAllListeners() {
        this.contract.removeAllListeners();
    }
    // ============================================================
    //                    UTILITY FUNCTIONS
    // ============================================================
    /**
     * Generate a random 32-byte value (for user contribution).
     */
    static generateUserRandom() {
        const crypto = require('crypto');
        return '0x' + crypto.randomBytes(32).toString('hex');
    }
    /**
     * Compute the user commitment from a random number.
     */
    static computeUserCommitment(userRandom) {
        return ethers_1.ethers.keccak256(ethers_1.ethers.hexlify(userRandom));
    }
    /**
     * Construct a provider commitment from a revelation and the number of hashes.
     * Repeatedly hashes the revelation `numHashes` times.
     */
    static constructProviderCommitment(numHashes, revelation) {
        let current = revelation;
        for (let i = 0; i < numHashes; i++) {
            current = ethers_1.ethers.keccak256(ethers_1.ethers.toBeHex(current));
        }
        return current;
    }
    /**
     * Generate a full hash chain from a seed.
     * @param seed The random seed (32 bytes hex)
     * @param length Number of values in the chain
     * @returns { commitment: x_0, revelations: [x_1, x_2, ...] }
     */
    static generateHashChain(seed, length) {
        const revelations = [];
        let current = seed;
        // x_{length-1} = seed, x_i = hash(x_{i+1}), ..., x_0 = hash(x_1)
        for (let i = 0; i < length - 1; i++) {
            current = ethers_1.ethers.keccak256(ethers_1.ethers.hexlify(current));
            revelations.push(current);
        }
        // Reverse into commitment-first order: [x_0, x_1, ..., x_{n-2}].
        // The original seed is x_{n-1}, so append it as the final reveal value.
        revelations.reverse();
        return {
            commitment: revelations[0],
            revelations: revelations.slice(1).concat([seed]),
        };
    }
    /**
     * Combine user and provider random values.
     */
    static combineRandom(userRandom, providerRandom, blockHash = ethers_1.ethers.ZeroHash) {
        return ethers_1.ethers.solidityPackedKeccak256(['bytes32', 'bytes32', 'bytes32'], [userRandom, providerRandom, blockHash]);
    }
}
exports.DiceProtocol = DiceProtocol;
