// SPDX-License-Identifier: Apache-2.0
// Derived from Pyth Entropy (https://github.com/pyth-network/pyth-crosschain), Apache-2.0
// Copyright 2024 Pyth Network — original architecture and interfaces
// Copyright 2026 Babylon Agent — modifications for Robinhood Chain deployment

pragma solidity ^0.8.0;

/// @notice Events for Dice Protocol V2.
/// Dice Protocol component.
interface DiceEventsV2 {
    /// @notice Emitted when a new provider registers with the Dice Protocol system
    /// @param provider The address of the registered provider
    /// @param extraArgs A field for extra data for forward compatibility
    event Registered(address indexed provider, bytes extraArgs);

    /// @notice Emitted when a user requests a random number from a provider
    /// @param provider The address of the provider handling the request
    /// @param caller The address of the user requesting the random number
    /// @param sequenceNumber A unique identifier for this request
    /// @param userContribution The user's contribution to the random number
    /// @param gasLimit The gas limit for the callback
    /// @param extraArgs A field for extra data for forward compatibility
    event Requested(
        address indexed provider,
        address indexed caller,
        uint64 indexed sequenceNumber,
        bytes32 userContribution,
        uint32 gasLimit,
        bytes extraArgs
    );

    /// @notice Emitted when a provider reveals the generated random number
    /// @param provider The address of the provider that generated the random number
    /// @param caller The address of the user who requested the random number
    /// @param sequenceNumber The unique identifier of the request
    /// @param randomNumber The generated random number
    /// @param userContribution The user's contribution to the random number
    /// @param providerContribution The provider's contribution to the random number
    /// @param callbackFailed Whether the callback to the caller failed
    /// @param callbackReturnValue Return value from the callback
    /// @param callbackGasUsed How much gas the callback used
    /// @param extraArgs A field for extra data for forward compatibility
    event Revealed(
        address indexed provider,
        address indexed caller,
        uint64 indexed sequenceNumber,
        bytes32 randomNumber,
        bytes32 userContribution,
        bytes32 providerContribution,
        bool callbackFailed,
        bytes callbackReturnValue,
        uint32 callbackGasUsed,
        bytes extraArgs
    );

    /// @notice Emitted when a provider updates their fee
    event ProviderFeeUpdated(
        address indexed provider,
        uint128 oldFee,
        uint128 newFee,
        bytes extraArgs
    );

    /// @notice Emitted when a provider updates their default gas limit
    event ProviderDefaultGasLimitUpdated(
        address indexed provider,
        uint32 oldDefaultGasLimit,
        uint32 newDefaultGasLimit,
        bytes extraArgs
    );

    /// @notice Emitted when a provider updates their URI
    event ProviderUriUpdated(
        address indexed provider,
        bytes oldUri,
        bytes newUri,
        bytes extraArgs
    );

    /// @notice Emitted when a provider updates their fee manager address
    event ProviderFeeManagerUpdated(
        address indexed provider,
        address oldFeeManager,
        address newFeeManager,
        bytes extraArgs
    );

    /// @notice Emitted when a provider updates their maximum number of hashes
    event ProviderMaxNumHashesAdvanced(
        address indexed provider,
        uint32 oldMaxNumHashes,
        uint32 newMaxNumHashes,
        bytes extraArgs
    );

    /// @notice Emitted when a provider withdraws their accumulated fees
    event Withdrawal(
        address indexed provider,
        address indexed recipient,
        uint128 withdrawnAmount,
        bytes extraArgs
    );
}
