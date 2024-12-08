use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,
    msg,
};
use borsh::BorshDeserialize;

mod instruction;
mod error;
mod state;
mod processor;

use instruction::SOuLInstruction;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("SOuL Sanctuary Token Program Entry");
    
    let instruction = SOuLInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
        
    processor::process_instruction(program_id, accounts, instruction)
}
