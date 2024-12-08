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
use spl_token::state::Account as TokenAccount;

use super::{
    instruction::{ImpactInstruction, ImpactError},
    state::{ImpactMetrics, VerifierState, ImpactReport, DisputeCase, VerificationStatus, DisputeStatus},
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = ImpactInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            ImpactInstruction::InitializeMetrics => {
                Self::process_initialize_metrics(accounts, program_id)
            }
            ImpactInstruction::SubmitReport { location, metrics, proof_hash } => {
                Self::process_submit_report(accounts, location, metrics, proof_hash, program_id)
            }
            ImpactInstruction::RegisterVerifier { stake_amount } => {
                Self::process_register_verifier(accounts, stake_amount, program_id)
            }
            ImpactInstruction::VerifyReport { approved, verification_notes_hash } => {
                Self::process_verify_report(accounts, approved, verification_notes_hash, program_id)
            }
            ImpactInstruction::SubmitDispute { evidence_hash, stake_amount } => {
                Self::process_submit_dispute(accounts, evidence_hash, stake_amount, program_id)
            }
            ImpactInstruction::ResolveDispute { in_favor_of_report, resolution_notes_hash } => {
                Self::process_resolve_dispute(accounts, in_favor_of_report, resolution_notes_hash, program_id)
            }
            ImpactInstruction::UpdateMetrics { new_metrics } => {
                Self::process_update_metrics(accounts, new_metrics, program_id)
            }
        }
    }

    fn process_initialize_metrics(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let authority_info = next_account_info(account_info_iter)?;
        let metrics_account_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        if !authority_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let rent = Rent::get()?;
        if !rent.is_exempt(metrics_account_info.lamports(), ImpactMetrics::LEN) {
            return Err(ProgramError::AccountNotRentExempt);
        }

        let metrics = ImpactMetrics {
            is_initialized: true,
            authority: *authority_info.key,
            last_update: Clock::get()?.unix_timestamp,
            forest_area: 0,
            carbon_offset: 0,
            water_saved: 0,
            biodiversity_score: 0,
            energy_saved: 0,
            waste_recycled: 0,
            impact_score: 0,
        };

        metrics.serialize(&mut *metrics_account_info.data.borrow_mut())?;
        Ok(())
    }

    fn process_submit_report(
        accounts: &[AccountInfo],
        location: GeoLocation,
        metrics: ImpactMetrics,
        proof_hash: [u8; 32],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let authority_info = next_account_info(account_info_iter)?;
        let report_account_info = next_account_info(account_info_iter)?;
        let metrics_account_info = next_account_info(account_info_iter)?;
        let clock_info = next_account_info(account_info_iter)?;

        if !authority_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let clock = Clock::from_account_info(clock_info)?;
        let report = ImpactReport {
            timestamp: clock.unix_timestamp,
            location,
            metrics,
            verifier: Pubkey::default(),
            verification_status: VerificationStatus::Pending,
            proof_hash,
        };

        report.serialize(&mut *report_account_info.data.borrow_mut())?;
        Ok(())
    }

    fn process_register_verifier(
        accounts: &[AccountInfo],
        stake_amount: u64,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let verifier_info = next_account_info(account_info_iter)?;
        let verifier_state_info = next_account_info(account_info_iter)?;
        let stake_account_info = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;

        if !verifier_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let rent = Rent::get()?;
        if !rent.is_exempt(verifier_state_info.lamports(), VerifierState::LEN) {
            return Err(ProgramError::AccountNotRentExempt);
        }

        // Verify stake amount
        if stake_amount < 1000 { // Minimum stake requirement
            return Err(ProgramError::from(ImpactError::InsufficientStake));
        }

        let verifier_state = VerifierState {
            is_initialized: true,
            authority: *verifier_info.key,
            verifier_pubkey: *verifier_info.key,
            reputation_score: 500, // Initial middle score
            verified_reports: 0,
            stake_amount,
        };

        verifier_state.serialize(&mut *verifier_state_info.data.borrow_mut())?;

        // Transfer stake tokens
        let transfer_ix = spl_token::instruction::transfer(
            token_program_info.key,
            stake_account_info.key,
            verifier_state_info.key,
            verifier_info.key,
            &[],
            stake_amount,
        )?;

        invoke(
            &transfer_ix,
            &[
                stake_account_info.clone(),
                verifier_state_info.clone(),
                verifier_info.clone(),
                token_program_info.clone(),
            ],
        )?;

        Ok(())
    }

    fn process_verify_report(
        accounts: &[AccountInfo],
        approved: bool,
        verification_notes_hash: [u8; 32],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let verifier_info = next_account_info(account_info_iter)?;
        let report_account_info = next_account_info(account_info_iter)?;
        let verifier_state_info = next_account_info(account_info_iter)?;
        let clock_info = next_account_info(account_info_iter)?;

        if !verifier_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let mut report = ImpactReport::try_from_slice(&report_account_info.data.borrow())?;
        let mut verifier_state = VerifierState::try_from_slice(&verifier_state_info.data.borrow())?;

        if verifier_state.verifier_pubkey != *verifier_info.key {
            return Err(ProgramError::from(ImpactError::InvalidVerifier));
        }

        report.verification_status = if approved {
            VerificationStatus::Verified
        } else {
            VerificationStatus::Rejected
        };
        report.verifier = *verifier_info.key;

        verifier_state.verified_reports += 1;
        
        report.serialize(&mut *report_account_info.data.borrow_mut())?;
        verifier_state.serialize(&mut *verifier_state_info.data.borrow_mut())?;

        Ok(())
    }

    // Additional processing functions for disputes and metrics updates...
}
