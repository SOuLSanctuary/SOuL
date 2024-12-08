use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
    clock::Clock,
};
use spl_token::state::Account as TokenAccount;

use super::{
    instruction::{VestingInstruction, VestingError},
    state::{VestingSchedule, VestingType},
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = VestingInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            VestingInstruction::Initialize {
                start_timestamp,
                end_timestamp,
                total_amount,
                vesting_type,
            } => {
                Self::process_initialize(
                    accounts,
                    start_timestamp,
                    end_timestamp,
                    total_amount,
                    vesting_type,
                    program_id,
                )
            }
            VestingInstruction::Release => Self::process_release(accounts, program_id),
            VestingInstruction::Revoke => Self::process_revoke(accounts, program_id),
            VestingInstruction::UpdateBeneficiary { new_beneficiary } => {
                Self::process_update_beneficiary(accounts, new_beneficiary, program_id)
            }
        }
    }

    fn process_initialize(
        accounts: &[AccountInfo],
        start_timestamp: i64,
        end_timestamp: i64,
        total_amount: u64,
        vesting_type: VestingType,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let authority_info = next_account_info(account_info_iter)?;
        let vesting_account_info = next_account_info(account_info_iter)?;
        let beneficiary_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        if !authority_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let rent = Rent::get()?;
        if !rent.is_exempt(vesting_account_info.lamports(), VestingSchedule::LEN) {
            return Err(ProgramError::AccountNotRentExempt);
        }

        let mut vesting_schedule = VestingSchedule {
            is_initialized: true,
            beneficiary: *beneficiary_info.key,
            start_timestamp,
            end_timestamp,
            total_amount,
            released_amount: 0,
            vesting_type,
        };

        vesting_schedule.serialize(&mut *vesting_account_info.data.borrow_mut())?;
        Ok(())
    }

    fn process_release(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let vesting_account_info = next_account_info(account_info_iter)?;
        let vesting_token_info = next_account_info(account_info_iter)?;
        let beneficiary_token_info = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;
        let beneficiary_info = next_account_info(account_info_iter)?;

        if !beneficiary_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let mut vesting_schedule = VestingSchedule::try_from_slice(&vesting_account_info.data.borrow())?;
        
        if vesting_schedule.beneficiary != *beneficiary_info.key {
            return Err(ProgramError::InvalidAccountData);
        }

        let clock = Clock::get()?;
        let releasable_amount = vesting_schedule.calculate_releasable_amount(clock.unix_timestamp);

        if releasable_amount == 0 {
            return Err(ProgramError::from(VestingError::NoTokensToRelease));
        }

        // Transfer tokens
        let transfer_ix = spl_token::instruction::transfer(
            token_program_info.key,
            vesting_token_info.key,
            beneficiary_token_info.key,
            vesting_account_info.key,
            &[],
            releasable_amount,
        )?;

        invoke_signed(
            &transfer_ix,
            &[
                vesting_token_info.clone(),
                beneficiary_token_info.clone(),
                vesting_account_info.clone(),
                token_program_info.clone(),
            ],
            &[&[&vesting_account_info.key.to_bytes(), &[0]]],
        )?;

        vesting_schedule.released_amount += releasable_amount;
        vesting_schedule.serialize(&mut *vesting_account_info.data.borrow_mut())?;

        Ok(())
    }

    fn process_revoke(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let authority_info = next_account_info(account_info_iter)?;
        let vesting_account_info = next_account_info(account_info_iter)?;
        let vesting_token_info = next_account_info(account_info_iter)?;
        let recovery_token_info = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;

        if !authority_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let vesting_schedule = VestingSchedule::try_from_slice(&vesting_account_info.data.borrow())?;
        
        match vesting_schedule.vesting_type {
            VestingType::Team | VestingType::Advisor => {
                let vesting_token = TokenAccount::unpack(&vesting_token_info.data.borrow())?;
                let remaining_amount = vesting_token.amount;

                if remaining_amount > 0 {
                    let transfer_ix = spl_token::instruction::transfer(
                        token_program_info.key,
                        vesting_token_info.key,
                        recovery_token_info.key,
                        vesting_account_info.key,
                        &[],
                        remaining_amount,
                    )?;

                    invoke_signed(
                        &transfer_ix,
                        &[
                            vesting_token_info.clone(),
                            recovery_token_info.clone(),
                            vesting_account_info.clone(),
                            token_program_info.clone(),
                        ],
                        &[&[&vesting_account_info.key.to_bytes(), &[0]]],
                    )?;
                }
                Ok(())
            }
            _ => Err(ProgramError::from(VestingError::InvalidRevocation)),
        }
    }

    fn process_update_beneficiary(
        accounts: &[AccountInfo],
        new_beneficiary: Pubkey,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let current_beneficiary_info = next_account_info(account_info_iter)?;
        let vesting_account_info = next_account_info(account_info_iter)?;
        let new_beneficiary_info = next_account_info(account_info_iter)?;

        if !current_beneficiary_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let mut vesting_schedule = VestingSchedule::try_from_slice(&vesting_account_info.data.borrow())?;
        
        if vesting_schedule.beneficiary != *current_beneficiary_info.key {
            return Err(ProgramError::InvalidAccountData);
        }

        if new_beneficiary != *new_beneficiary_info.key {
            return Err(ProgramError::InvalidAccountData);
        }

        vesting_schedule.beneficiary = new_beneficiary;
        vesting_schedule.serialize(&mut *vesting_account_info.data.borrow_mut())?;

        Ok(())
    }
}
