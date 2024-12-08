use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;
use super::state::{ImpactMetrics, GeoLocation};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum ImpactInstruction {
    /// Initialize a new impact metrics account
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority initializing the metrics
    /// 1. `[writable]` The impact metrics account to initialize
    /// 2. `[]` The system program
    InitializeMetrics,

    /// Submit a new impact report
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority submitting the report
    /// 1. `[writable]` The impact report account
    /// 2. `[writable]` The impact metrics account to update
    /// 3. `[]` The clock sysvar
    SubmitReport {
        location: GeoLocation,
        metrics: ImpactMetrics,
        proof_hash: [u8; 32],
    },

    /// Register as a verifier
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The verifier to register
    /// 1. `[writable]` The verifier state account
    /// 2. `[writable]` The stake token account
    /// 3. `[]` The token program
    RegisterVerifier {
        stake_amount: u64,
    },

    /// Verify an impact report
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The verifier
    /// 1. `[writable]` The impact report account
    /// 2. `[writable]` The verifier state account
    /// 3. `[]` The clock sysvar
    VerifyReport {
        approved: bool,
        verification_notes_hash: [u8; 32],
    },

    /// Submit a dispute for an impact report
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The challenger
    /// 1. `[writable]` The dispute case account
    /// 2. `[writable]` The impact report account
    /// 3. `[writable]` The challenger's stake account
    /// 4. `[]` The token program
    SubmitDispute {
        evidence_hash: [u8; 32],
        stake_amount: u64,
    },

    /// Resolve a dispute case
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority resolving the dispute
    /// 1. `[writable]` The dispute case account
    /// 2. `[writable]` The impact report account
    /// 3. `[writable]` The verifier state account
    /// 4. `[writable]` The challenger's stake account
    /// 5. `[writable]` The verifier's stake account
    /// 6. `[]` The token program
    ResolveDispute {
        in_favor_of_report: bool,
        resolution_notes_hash: [u8; 32],
    },

    /// Update impact metrics
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority updating the metrics
    /// 1. `[writable]` The impact metrics account
    /// 2. `[]` The clock sysvar
    UpdateMetrics {
        new_metrics: ImpactMetrics,
    },
}

#[derive(Debug)]
pub enum ImpactError {
    InvalidInstruction,
    NotRentExempt,
    AlreadyInitialized,
    InvalidAuthority,
    InvalidVerifier,
    InsufficientStake,
    InvalidReport,
    InvalidDispute,
    DisputeAlreadyResolved,
    InvalidMetricsUpdate,
    InvalidProof,
    InvalidStakeAmount,
}
