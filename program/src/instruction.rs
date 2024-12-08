use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    instruction::{AccountMeta, Instruction},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_program,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum SOuLInstruction {
    /// Initialize a new SOuL token
    /// Accounts expected:
    /// 1. [signer] The account of the person initializing the token
    /// 2. [writable] The token account to initialize
    /// 3. [] The rent sysvar
    /// 4. [] The token program
    InitializeSOuL {
        total_supply: u64,
    },

    /// Initialize a new LST token
    /// Accounts expected:
    /// 1. [signer] The account of the person initializing the token
    /// 2. [writable] The token account to initialize
    /// 3. [] The rent sysvar
    /// 4. [] The token program
    InitializeLST {
        token_type: u8,
        total_supply: u64,
    },

    /// Transfer tokens
    /// Accounts expected:
    /// 1. [signer] The account of the person transferring tokens
    /// 2. [writable] The source token account
    /// 3. [writable] The destination token account
    Transfer {
        amount: u64,
    },

    /// Mint new tokens
    /// Accounts expected:
    /// 1. [signer] The mint authority
    /// 2. [writable] The mint account
    /// 3. [writable] The destination account
    Mint {
        amount: u64,
    },

    /// Burn tokens
    /// Accounts expected:
    /// 1. [signer] The token owner
    /// 2. [writable] The token account
    Burn {
        amount: u64,
    },
}

impl SOuLInstruction {
    pub fn initialize_soul(
        program_id: &Pubkey,
        initializer: &Pubkey,
        token_account: &Pubkey,
        total_supply: u64,
    ) -> Result<Instruction, ProgramError> {
        let data = SOuLInstruction::InitializeSOuL {
            total_supply,
        }
        .try_to_vec()?;

        let accounts = vec![
            AccountMeta::new(*initializer, true),
            AccountMeta::new(*token_account, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ];

        Ok(Instruction {
            program_id: *program_id,
            accounts,
            data,
        })
    }
}
