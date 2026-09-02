/**
 * Deployed DiceEntropy v10 Request tuple.
 *
 * Live getRequest / getRequestV2 return 10 ABI words (320 bytes).
 * Index 9 is feePaid (uint128), the exact msg.value stored for refunds.
 * Mapping only 0..8 leaves feePaid undefined on the public SDK type.
 */
export const REQUEST_ABI_FIELDS = [
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
] as const;

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

function readFeePaid(req: RequestTuple): bigint | undefined {
  const named = req.feePaid;
  if (typeof named === 'bigint') return named;
  if (req.length > 9 && typeof req[9] === 'bigint') return req[9] as bigint;
  return undefined;
}

export function mapRequestInfo(req: RequestTuple): RequestInfo {
  const feePaid = readFeePaid(req);
  if (typeof feePaid !== 'bigint') {
    throw new Error(
      `Request ABI mismatch: expected 10-field Request with feePaid at index 9, got length=${req.length}`,
    );
  }
  return {
    provider: req[0] as string,
    sequenceNumber: req[1] as bigint,
    numHashes: Number(req[2]),
    commitment: req[3] as string,
    blockNumber: req[4] as bigint,
    requester: req[5] as string,
    useBlockhash: req[6] as boolean,
    callbackStatus: Number(req[7]),
    gasLimit10k: Number(req[8]),
    feePaid,
  };
}
