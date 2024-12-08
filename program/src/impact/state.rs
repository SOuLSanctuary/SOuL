use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    clock::UnixTimestamp,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ImpactMetrics {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub last_update: UnixTimestamp,
    pub forest_area: u64,        // in square meters
    pub carbon_offset: u64,      // in kg
    pub water_saved: u64,        // in liters
    pub biodiversity_score: u16, // 0-1000
    pub energy_saved: u64,       // in kWh
    pub waste_recycled: u64,     // in kg
    pub impact_score: u64,       // calculated score
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct VerifierState {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub verifier_pubkey: Pubkey,
    pub reputation_score: u16,   // 0-1000
    pub verified_reports: u64,
    pub stake_amount: u64,       // staked SOuL tokens
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ImpactReport {
    pub timestamp: UnixTimestamp,
    pub location: GeoLocation,
    pub metrics: ImpactMetrics,
    pub verifier: Pubkey,
    pub verification_status: VerificationStatus,
    pub proof_hash: [u8; 32],   // IPFS hash of supporting documents
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct GeoLocation {
    pub latitude: i64,  // multiplied by 1e6 for precision
    pub longitude: i64, // multiplied by 1e6 for precision
    pub altitude: i32,  // in meters
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
    Disputed,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct DisputeCase {
    pub report_id: Pubkey,
    pub challenger: Pubkey,
    pub stake_amount: u64,
    pub evidence_hash: [u8; 32], // IPFS hash of dispute evidence
    pub status: DisputeStatus,
    pub resolution_timestamp: Option<UnixTimestamp>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum DisputeStatus {
    Active,
    ResolvedInFavorOfReport,
    ResolvedInFavorOfChallenger,
    Dismissed,
}

impl ImpactMetrics {
    pub const LEN: usize = 1 + 32 + 8 + 8 + 8 + 8 + 2 + 8 + 8 + 8;

    pub fn calculate_impact_score(&self) -> u64 {
        // Base weights for different metrics
        const FOREST_WEIGHT: u64 = 30;
        const CARBON_WEIGHT: u64 = 25;
        const WATER_WEIGHT: u64 = 20;
        const BIODIVERSITY_WEIGHT: u64 = 15;
        const ENERGY_WEIGHT: u64 = 5;
        const WASTE_WEIGHT: u64 = 5;

        // Normalize each metric to a 0-100 scale and apply weights
        let forest_score = (self.forest_area.min(1_000_000) * FOREST_WEIGHT) / 10_000;
        let carbon_score = (self.carbon_offset.min(1_000_000) * CARBON_WEIGHT) / 10_000;
        let water_score = (self.water_saved.min(1_000_000) * WATER_WEIGHT) / 10_000;
        let biodiversity_score = (self.biodiversity_score as u64 * BIODIVERSITY_WEIGHT) / 10;
        let energy_score = (self.energy_saved.min(1_000_000) * ENERGY_WEIGHT) / 10_000;
        let waste_score = (self.waste_recycled.min(1_000_000) * WASTE_WEIGHT) / 10_000;

        // Sum all weighted scores
        forest_score + carbon_score + water_score + biodiversity_score + energy_score + waste_score
    }
}

impl VerifierState {
    pub const LEN: usize = 1 + 32 + 32 + 2 + 8 + 8;

    pub fn update_reputation(&mut self, successful_verifications: u64, disputes_won: u64, disputes_lost: u64) {
        const BASE_SCORE: u16 = 500;
        const VERIFICATION_WEIGHT: u16 = 10;
        const DISPUTE_WIN_WEIGHT: u16 = 20;
        const DISPUTE_LOSS_WEIGHT: u16 = 30;

        let positive_score = (successful_verifications as u16 * VERIFICATION_WEIGHT) +
                           (disputes_won as u16 * DISPUTE_WIN_WEIGHT);
        let negative_score = disputes_lost as u16 * DISPUTE_LOSS_WEIGHT;

        self.reputation_score = BASE_SCORE
            .saturating_add(positive_score)
            .saturating_sub(negative_score)
            .min(1000);
    }
}
