use solana_program::{
    program_pack::{IsInitialized, Pack, Sealed},
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(Clone, Debug, Default, PartialEq)]
pub struct SoulToken {
    pub is_initialized: bool,
    pub mint_authority: Pubkey,
    pub supply: u64,
}
