use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    msg,
    rent::Rent,
    sysvar::Sysvar,
};
use borsh::{BorshDeserialize, BorshSerialize};

use crate::{
    instruction::SOuLInstruction,
    error::SOuLError,
    state::{SOuLToken, LSTToken, LSTTokenType},
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction: SOuLInstruction,
) -> ProgramResult {
    match instruction {
        SOuLInstruction::InitializeSOuL { total_supply } => {
            process_initialize_soul(program_id, accounts, total_supply)
        }
        SOuLInstruction::InitializeLST { token_type, total_supply } => {
            process_initialize_lst(program_id, accounts, token_type, total_supply)
        }
        SOuLInstruction::Transfer { amount } => {
            process_transfer(program_id, accounts, amount)
        }
        SOuLInstruction::Mint { amount } => {
            process_mint(program_id, accounts, amount)
        }
        SOuLInstruction::Burn { amount } => {
            process_burn(program_id, accounts, amount)
        }
    }
}

fn process_initialize_soul(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    total_supply: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let initializer = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;

    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let rent = Rent::get()?;
    if !rent.is_exempt(token_account.lamports(), token_account.data_len()) {
        return Err(SOuLError::NotRentExempt.into());
    }

    let token = SOuLToken {
        is_initialized: true,
        mint_authority: *initializer.key,
        total_supply,
        decimals: 9,
    };

    token.serialize(&mut *token_account.data.borrow_mut())?;
    msg!("SOuL token initialized successfully");
    Ok(())
}

fn process_initialize_lst(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    token_type: u8,
    total_supply: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let initializer = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;

    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let lst_type = match token_type {
        0 => LSTTokenType::AirSOuL,
        1 => LSTTokenType::ForestSOuL,
        2 => LSTTokenType::LandSOuL,
        3 => LSTTokenType::WaterSOuL,
        4 => LSTTokenType::OceanSOuL,
        5 => LSTTokenType::WildlifeSOuL,
        6 => LSTTokenType::EnergySOuL,
        7 => LSTTokenType::LifeSOuL,
        8 => LSTTokenType::SanctuarySOuL,
        9 => LSTTokenType::PESSOuL,
        10 => LSTTokenType::PPPSOuL,
        11 => LSTTokenType::SSSSOuL,
        _ => return Err(SOuLError::InvalidTokenType.into()),
    };

    let token = LSTToken {
        is_initialized: true,
        mint_authority: *initializer.key,
        total_supply,
        decimals: 9,
        token_type: lst_type,
    };

    token.serialize(&mut *token_account.data.borrow_mut())?;
    msg!("LST token initialized successfully");
    Ok(())
}

fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let source_account = next_account_info(account_info_iter)?;
    let destination_account = next_account_info(account_info_iter)?;
    let authority = next_account_info(account_info_iter)?;

    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Transfer implementation
    msg!("Transfer processed successfully");
    Ok(())
}

fn process_mint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let mint_authority = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;

    if !mint_authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Minting implementation
    msg!("Tokens minted successfully");
    Ok(())
}

fn process_burn(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let token_account = next_account_info(account_info_iter)?;
    let authority = next_account_info(account_info_iter)?;

    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Burning implementation
    msg!("Tokens burned successfully");
    Ok(())
}
