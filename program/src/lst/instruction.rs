use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;
use super::state::LSTType;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum LSTInstruction {
    /// Initialize a new LST pool
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority creating the pool
    /// 1. `[writable]` The LST pool account
    /// 2. `[]` The SOuL mint
    /// 3. `[writable]` The LST mint to be created
    /// 4. `[]` The token program
    /// 5. `[]` The system program
    InitializePool {
        pool_type: LSTType,
        fee_rate: u64,
    },

    /// Stake SOuL tokens to receive LST
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The staker
    /// 1. `[writable]` The LST pool account
    /// 2. `[writable]` The staker's SOuL token account
    /// 3. `[writable]` The pool's SOuL token account
    /// 4. `[writable]` The staker's LST token account
    /// 5. `[writable]` The LST mint
    /// 6. `[writable]` The staker info account
    /// 7. `[]` The token program
    Stake {
        amount: u64,
    },

    /// Request to unstake LST tokens
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The staker
    /// 1. `[writable]` The LST pool account
    /// 2. `[writable]` The staker info account
    /// 3. `[writable]` The staker's LST token account
    /// 4. `[]` The clock sysvar
    RequestUnstake {
        amount: u64,
    },

    /// Execute unstaking of LST tokens
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The staker
    /// 1. `[writable]` The LST pool account
    /// 2. `[writable]` The staker info account
    /// 3. `[writable]` The staker's LST token account
    /// 4. `[writable]` The staker's SOuL token account
    /// 5. `[writable]` The pool's SOuL token account
    /// 6. `[writable]` The LST mint
    /// 7. `[]` The token program
    /// 8. `[]` The clock sysvar
    ExecuteUnstake,

    /// Claim staking rewards
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The staker
    /// 1. `[writable]` The LST pool account
    /// 2. `[writable]` The staker info account
    /// 3. `[writable]` The staker's SOuL token account
    /// 4. `[writable]` The pool's reward token account
    /// 5. `[]` The token program
    /// 6. `[]` The clock sysvar
    ClaimRewards,

    /// Update pool parameters
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The pool authority
    /// 1. `[writable]` The LST pool account
    UpdatePool {
        new_fee_rate: Option<u64>,
    },

    /// Emergency withdraw (only for pool authority)
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The pool authority
    /// 1. `[writable]` The LST pool account
    /// 2. `[writable]` The pool's SOuL token account
    /// 3. `[writable]` The authority's SOuL token account
    /// 4. `[]` The token program
    EmergencyWithdraw {
        amount: u64,
    },
}

#[derive(Debug)]
pub enum LSTError {
    InvalidInstruction,
    NotRentExempt,
    AlreadyInitialized,
    InvalidAuthority,
    InvalidPoolType,
    InvalidAmount,
    InsufficientFunds,
    InvalidUnstakeRequest,
    UnstakeRequestNotReady,
    NoRewardsToHarvest,
    PoolPaused,
    InvalidFeeRate,
    ExchangeRateError,
}
