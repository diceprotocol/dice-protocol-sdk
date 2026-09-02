"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CALLBACK_GAS_LIMIT = void 0;
exports.resolveCallbackGasLimit = resolveCallbackGasLimit;
/**
 * Explicit callback gas for requestV2.
 *
 * Omitted gas must not silently become 0. Onchain, 0 means
 * "use provider.defaultGasLimit", which is mutable operator state.
 * Ticket #0042: that default was 0 and consumer callbacks failed.
 *
 * Pass 0 only as an explicit opt-in to the live provider default.
 */
exports.DEFAULT_CALLBACK_GAS_LIMIT = 200_000;
function resolveCallbackGasLimit(gasLimit) {
    return gasLimit === undefined ? exports.DEFAULT_CALLBACK_GAS_LIMIT : gasLimit;
}
