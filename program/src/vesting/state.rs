use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    clock::UnixTimestamp,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct VestingSchedule {
    pub is_initialized: bool,
    pub beneficiary: Pubkey,
    pub start_timestamp: UnixTimestamp,
    pub end_timestamp: UnixTimestamp,
    pub total_amount: u64,
    pub released_amount: u64,
    pub vesting_type: VestingType,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum VestingType {
    Team,           // 3-year vesting, 1-year cliff
    Advisor,        // 3-year vesting, 1-year cliff
    PrivateSale,    // 18-month vesting, 6-month cliff
    PublicSale,     // 12-month vesting, 3-month cliff
    Ecosystem,      // Custom vesting for ecosystem development
}

impl VestingSchedule {
    pub const LEN: usize = 1 + 32 + 8 + 8 + 8 + 8 + 1;

    pub fn calculate_releasable_amount(&self, current_timestamp: UnixTimestamp) -> u64 {
        if current_timestamp < self.start_timestamp {
            return 0;
        }

        let (cliff_duration, total_duration) = match self.vesting_type {
            VestingType::Team | VestingType::Advisor => (
                31_536_000, // 1 year in seconds
                94_608_000, // 3 years in seconds
            ),
            VestingType::PrivateSale => (
                15_768_000, // 6 months in seconds
                47_304_000, // 18 months in seconds
            ),
            VestingType::PublicSale => (
                7_884_000,  // 3 months in seconds
                31_536_000, // 12 months in seconds
            ),
            VestingType::Ecosystem => (0, self.end_timestamp - self.start_timestamp),
        };

        if current_timestamp < self.start_timestamp + cliff_duration {
            return 0;
        }

        let elapsed = current_timestamp.min(self.end_timestamp) - self.start_timestamp;
        let vested_amount = (self.total_amount as u128)
            .checked_mul(elapsed as u128)
            .unwrap()
            .checked_div(total_duration as u128)
            .unwrap() as u64;

        vested_amount.checked_sub(self.released_amount).unwrap_or(0)
    }
}
