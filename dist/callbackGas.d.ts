/**
 * Explicit callback gas for requestV2.
 *
 * Omitted gas must not silently become 0. Onchain, 0 means
 * "use provider.defaultGasLimit", which is mutable operator state.
 * Ticket #0042: that default was 0 and consumer callbacks failed.
 *
 * Pass 0 only as an explicit opt-in to the live provider default.
 */
export declare const DEFAULT_CALLBACK_GAS_LIMIT = 200000;
export declare function resolveCallbackGasLimit(gasLimit?: number): number;
