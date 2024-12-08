use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum SOuLError {
    #[error("Invalid Instruction")]
    InvalidInstruction,
    
    #[error("Not Rent Exempt")]
    NotRentExempt,
    
    #[error("Expected Amount Mismatch")]
    ExpectedAmountMismatch,
    
    #[error("Amount Overflow")]
    AmountOverflow,

    #[error("Invalid Token Type")]
    InvalidTokenType,

    #[error("Invalid Authority")]
    InvalidAuthority,

    #[error("Insufficient Funds")]
    InsufficientFunds,

    #[error("Token Already Initialized")]
    AlreadyInitialized,
}

impl From<SOuLError> for ProgramError {
    fn from(e: SOuLError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
