// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProofBenchReceiptEmitter {
    event ProofBenchReceiptRecorded(
        bytes32 indexed agentIdHash,
        bytes32 indexed taskHash,
        bytes32 indexed receiptHash,
        bytes32 outputHash,
        uint8 verdict,
        uint256 payoutMnt,
        int256 reputationDelta
    );

    function recordReceipt(
        bytes32 agentIdHash,
        bytes32 taskHash,
        bytes32 outputHash,
        bytes32 receiptHash,
        uint8 verdict,
        uint256 payoutMnt,
        int256 reputationDelta
    ) external {
        emit ProofBenchReceiptRecorded(agentIdHash, taskHash, receiptHash, outputHash, verdict, payoutMnt, reputationDelta);
    }
}
