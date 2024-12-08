use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::{clock::Clock, Sysvar},
};
use spl_token::state::{Account as TokenAccount, Mint};

use super::{
    instruction::{LSTInstruction, LSTError},
    state::{LSTPool, StakerInfo, LSTType},
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = LSTInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            LSTInstruction::InitializePool { pool_type, fee_rate } => {
                Self::process_initialize_pool(accounts, pool_type, fee_rate, program_id)
            }
            LSTInstruction::Stake { amount } => {
                Self::process_stake(accounts, amount, program_id)
            }
            LSTInstruction::RequestUnstake { amount } => {
                Self::process_request_unstake(accounts, amount, program_id)
            }
            LSTInstruction::ExecuteUnstake => {
                Self::process_execute_unstake(accounts, program_id)
            }
            LSTInstruction::ClaimRewards => {
                Self::process_claim_rewards(accounts, program_id)
            }
            LSTInstruction::UpdatePool { new_fee_rate } => {
                Self::process_update_pool(accounts, new_fee_rate, program_id)
            }
            LSTInstruction::EmergencyWithdraw { amount } => {
                Self::process_emergency_withdraw(accounts, amount, program_id)
            }
        }
    }

    fn process_initialize_pool(
        accounts: &[AccountInfo],
        pool_type: LSTType,
        fee_rate: u64,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let authority_info = next_account_info(account_info_iter)?;
        let pool_account_info = next_account_info(account_info_iter)?;
        let soul_mint_info = next_account_info(account_info_iter)?;
        let lst_mint_info = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        if !authority_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let rent = Rent::get()?;
        if !rent.is_exempt(pool_account_info.lamports(), LSTPool::LEN) {
            return Err(ProgramError::AccountNotRentExempt);
        }

        // Validate fee rate (max 10%)
        if fee_rate > 100_000_000 {
            return Err(ProgramError::from(LSTError::InvalidFeeRate));
        }

        let pool = LSTPool {
            is_initialized: true,
            authority: *authority_info.key,
            soul_mint: *soul_mint_info.key,
            lst_mint: *lst_mint_info.key,
            total_staked: 0,
            exchange_rate: 1_000_000_000, // 1:1 initial rate
            rewards_per_token: 0,
            last_update_time: Clock::get()?.unix_timestamp,
            pool_type,
            fee_rate,
        };

        pool.serialize(&mut *pool_account_info.data.borrow_mut())?;
        Ok(())
    }

    fn process_stake(
        accounts: &[AccountInfo],
        amount: u64,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let staker_info = next_account_info(account_info_iter)?;
        let pool_account_info = next_account_info(account_info_iter)?;
        let staker_soul_account = next_account_info(account_info_iter)?;
        let pool_soul_account = next_account_info(account_info_iter)?;
        let staker_lst_account = next_account_info(account_info_iter)?;
        let lst_mint_info = next_account_info(account_info_iter)?;
        let staker_info_account = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;

        if !staker_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let mut pool = LSTPool::try_from_slice(&pool_account_info.data.borrow())?;
        let mut staker_data = StakerInfo::try_from_slice(&staker_info_account.data.borrow())?;

        // Transfer SOuL tokens to pool
        let transfer_ix = spl_token::instruction::transfer(
            token_program_info.key,
            staker_soul_account.key,
            pool_soul_account.key,
            staker_info.key,
            &[],
            amount,
        )?;

        invoke(
            &transfer_ix,
            &[
                staker_soul_account.clone(),
                pool_soul_account.clone(),
                staker_info.clone(),
                token_program_info.clone(),
            ],
        )?;

        // Calculate LST amount to mint
        let lst_amount = (amount as u128)
            .checked_mul(1_000_000_000)
            .unwrap()
            .checked_div(pool.exchange_rate as u128)
            .unwrap() as u64;

        // Mint LST tokens to staker
        let mint_ix = spl_token::instruction::mint_to(
            token_program_info.key,
            lst_mint_info.key,
            staker_lst_account.key,
            pool_account_info.key,
            &[],
            lst_amount,
        )?;

        invoke_signed(
            &mint_ix,
            &[
                lst_mint_info.clone(),
                staker_lst_account.clone(),
                pool_account_info.clone(),
                token_program_info.clone(),
            ],
            &[&[&pool_account_info.key.to_bytes(), &[0]]],
        )?;

        // Update pool and staker data
        pool.total_staked = pool.total_staked.checked_add(amount).unwrap();
        staker_data.staked_amount = staker_data.staked_amount.checked_add(amount).unwrap();
        staker_data.last_stake_time = Clock::get()?.unix_timestamp;

        pool.serialize(&mut *pool_account_info.data.borrow_mut())?;
        staker_data.serialize(&mut *staker_info_account.data.borrow_mut())?;

        Ok(())
    }

    // Additional processing functions...
}
