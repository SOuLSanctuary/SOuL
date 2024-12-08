use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct SOuLToken {
    pub is_initialized: bool,
    pub mint_authority: Pubkey,
    pub total_supply: u64,
    pub decimals: u8,
}

impl SOuLToken {
    pub const LEN: usize = 1 + 32 + 8 + 1;
}

impl Sealed for SOuLToken {}

impl IsInitialized for SOuLToken {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct LSTToken {
    pub is_initialized: bool,
    pub mint_authority: Pubkey,
    pub total_supply: u64,
    pub decimals: u8,
    pub token_type: LSTTokenType,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum LSTTokenType {
    AirSOuL,
    ForestSOuL,
    LandSOuL,
    WaterSOuL,
    OceanSOuL,
    WildlifeSOuL,
    EnergySOuL,
    LifeSOuL,
    SanctuarySOuL,
    PESSOuL,
    PPPSOuL,
    SSSSOuL,
}
