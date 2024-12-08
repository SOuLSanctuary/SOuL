use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    clock::UnixTimestamp,
    pubkey::Pubkey,
};
use super::state::VestingType;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VestingInstruction {
    /// Initialize a new vesting schedule
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority creating the vesting schedule
    /// 1. `[writable]` The vesting account to initialize
    /// 2. `[]` The beneficiary who will receive the tokens
    /// 3. `[]` The system program
    Initialize {
        start_timestamp: UnixTimestamp,
        end_timestamp: UnixTimestamp,
        total_amount: u64,
        vesting_type: VestingType,
    },

    /// Release vested tokens to the beneficiary
    /// 
    /// Accounts expected:
    /// 0. `[writable]` The vesting account
    /// 1. `[writable]` The token account holding vested tokens
    /// 2. `[writable]` The beneficiary's token account
    /// 3. `[]` The token program
    /// 4. `[signer]` The beneficiary
    Release,

    /// Revoke a vesting schedule (only for team and advisor tokens)
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority who can revoke
    /// 1. `[writable]` The vesting account
    /// 2. `[writable]` The token account holding vested tokens
    /// 3. `[writable]` The recovery token account
    /// 4. `[]` The token program
    Revoke,

    /// Update the beneficiary of a vesting schedule
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Current beneficiary
    /// 1. `[writable]` The vesting account
    /// 2. `[]` The new beneficiary
    UpdateBeneficiary {
        new_beneficiary: Pubkey,
    },
}

#[derive(Debug)]
pub enum VestingError {
    InvalidInstruction,
    NotRentExempt,
    AlreadyInitialized,
    NotInitialized,
    InvalidBeneficiary,
    InvalidAuthority,
    InvalidVestingSchedule,
    NoTokensToRelease,
    InvalidTokenAccount,
    InvalidRevocation,
}
