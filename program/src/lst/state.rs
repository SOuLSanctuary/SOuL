use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    program_pack::Pack,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct LSTPool {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub soul_mint: Pubkey,
    pub lst_mint: Pubkey,
    pub total_staked: u64,
    pub exchange_rate: u64,  // Scaled by 1e9
    pub rewards_per_token: u64,
    pub last_update_time: i64,
    pub pool_type: LSTType,
    pub fee_rate: u64,  // Scaled by 1e9
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum LSTType {
    Air,        // airSOuL
    Forest,     // forestSOuL
    Land,       // landSOuL
    Water,      // waterSOuL
    Ocean,      // oceanSOuL
    Wildlife,   // wildlifeSOuL
    Energy,     // energySOuL
    Life,       // lifeSOuL
    Sanctuary,  // sanctuarySOuL
    PES,        // pesSOuL
    PPP,        // pppSOuL
    SSS,        // sssSOuL
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct StakerInfo {
    pub owner: Pubkey,
    pub staked_amount: u64,
    pub rewards_debt: u64,
    pub last_stake_time: i64,
    pub unstake_request: Option<UnstakeRequest>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct UnstakeRequest {
    pub amount: u64,
    pub request_time: i64,
    pub unlock_time: i64,
}

impl LSTPool {
    pub const LEN: usize = 1 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 8;

    pub fn calculate_rewards(&self, staker: &StakerInfo, current_time: i64) -> u64 {
        if staker.staked_amount == 0 {
            return 0;
        }

        let time_delta = current_time - self.last_update_time;
        if time_delta <= 0 {
            return 0;
        }

        let rewards_rate = match self.pool_type {
            LSTType::Forest => 15,  // 15% APY
            LSTType::Water => 12,   // 12% APY
            LSTType::Energy => 10,  // 10% APY
            _ => 8,                 // 8% APY base rate
        };

        let rewards = (staker.staked_amount as u128)
            .checked_mul(rewards_rate as u128)
            .unwrap()
            .checked_mul(time_delta as u128)
            .unwrap()
            .checked_div(365 * 24 * 60 * 60 * 100)
            .unwrap() as u64;

        rewards.saturating_sub(staker.rewards_debt)
    }

    pub fn update_exchange_rate(&mut self, total_rewards: u64) {
        if self.total_staked == 0 {
            return;
        }

        let new_total = (self.total_staked as u128)
            .checked_add(total_rewards as u128)
            .unwrap();

        self.exchange_rate = (new_total * 1_000_000_000)
            .checked_div(self.total_staked as u128)
            .unwrap() as u64;
    }

    pub fn calculate_fee(&self, amount: u64) -> u64 {
        (amount as u128)
            .checked_mul(self.fee_rate as u128)
            .unwrap()
            .checked_div(1_000_000_000)
            .unwrap() as u64
    }
}

impl StakerInfo {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1 + 24;  // 24 bytes for optional UnstakeRequest

    pub fn can_unstake(&self, current_time: i64) -> bool {
        match &self.unstake_request {
            Some(request) => current_time >= request.unlock_time,
            None => false,
        }
    }
}
