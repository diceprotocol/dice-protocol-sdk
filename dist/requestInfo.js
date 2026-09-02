"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_ABI_FIELDS = void 0;
exports.mapRequestInfo = mapRequestInfo;
/**
 * Deployed DiceEntropy v10 Request tuple.
 *
 * Live getRequest / getRequestV2 return 10 ABI words (320 bytes).
 * Index 9 is feePaid (uint128), the exact msg.value stored for refunds.
 * Mapping only 0..8 leaves feePaid undefined on the public SDK type.
 */
exports.REQUEST_ABI_FIELDS = [
    'provider',
    'sequenceNumber',
    'numHashes',
    'commitment',
    'blockNumber',
    'requester',
    'useBlockhash',
    'callbackStatus',
    'gasLimit10k',
    'feePaid',
];
function readFeePaid(req) {
    const named = req.feePaid;
    if (typeof named === 'bigint')
        return named;
    if (req.length > 9 && typeof req[9] === 'bigint')
        return req[9];
    return undefined;
}
function mapRequestInfo(req) {
    const feePaid = readFeePaid(req);
    if (typeof feePaid !== 'bigint') {
        throw new Error(`Request ABI mismatch: expected 10-field Request with feePaid at index 9, got length=${req.length}`);
    }
    return {
        provider: req[0],
        sequenceNumber: req[1],
        numHashes: Number(req[2]),
        commitment: req[3],
        blockNumber: req[4],
        requester: req[5],
        useBlockhash: req[6],
        callbackStatus: Number(req[7]),
        gasLimit10k: Number(req[8]),
        feePaid,
    };
}
