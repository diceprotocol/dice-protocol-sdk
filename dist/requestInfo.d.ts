/**
 * Deployed DiceEntropy v10 Request tuple.
 *
 * Live getRequest / getRequestV2 return 10 ABI words (320 bytes).
 * Index 9 is feePaid (uint128), the exact msg.value stored for refunds.
 * Mapping only 0..8 leaves feePaid undefined on the public SDK type.
 */
export declare const REQUEST_ABI_FIELDS: readonly ["provider", "sequenceNumber", "numHashes", "commitment", "blockNumber", "requester", "useBlockhash", "callbackStatus", "gasLimit10k", "feePaid"];
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
type RequestTuple = ArrayLike<unknown> & {
    length: number;
    feePaid?: unknown;
};
export declare function mapRequestInfo(req: RequestTuple): RequestInfo;
export {};
