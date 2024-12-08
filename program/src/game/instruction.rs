use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;
use super::state::{Quest, Item, Collectible, GeoLocation, EnvironmentalImpact};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum GameInstruction {
    /// Initialize the game state
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority initializing the game
    /// 1. `[writable]` The game state account
    /// 2. `[]` The system program
    InitializeGame,

    /// Initialize a new player
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    /// 2. `[]` The system program
    InitializePlayer,

    /// Start a new quest
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    /// 2. `[writable]` The game state account
    /// 3. `[]` The clock sysvar
    StartQuest {
        quest_id: u64,
    },

    /// Complete a quest and collect rewards
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    /// 2. `[writable]` The game state account
    /// 3. `[writable]` The player's token account
    /// 4. `[]` The token program
    /// 5. `[]` The clock sysvar
    CompleteQuest {
        quest_id: u64,
        environmental_data: EnvironmentalImpact,
        location: GeoLocation,
    },

    /// Collect environmental data
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    /// 2. `[writable]` The game state account
    /// 3. `[]` The clock sysvar
    CollectData {
        data_type: DataType,
        location: GeoLocation,
        impact: EnvironmentalImpact,
    },

    /// Use an item
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    UseItem {
        item_id: u64,
    },

    /// Craft a new item
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    /// 2. `[writable]` The player's token account
    /// 3. `[]` The token program
    CraftItem {
        recipe_id: u64,
    },

    /// Trade items with another player
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The initiating player
    /// 1. `[writable]` The initiating player's state account
    /// 2. `[writable]` The target player's state account
    /// 3. `[]` The clock sysvar
    TradeItems {
        offered_items: Vec<u64>,
        requested_items: Vec<u64>,
        target_player: Pubkey,
    },

    /// Claim achievement rewards
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    /// 2. `[writable]` The player's token account
    /// 3. `[]` The token program
    ClaimAchievement {
        achievement_id: u64,
    },

    /// Restore player energy
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The player
    /// 1. `[writable]` The player state account
    /// 2. `[writable]` The player's token account
    /// 3. `[]` The token program
    RestoreEnergy {
        amount: u8,
    },

    /// Update player stats
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The authority
    /// 1. `[writable]` The player state account
    UpdatePlayerStats {
        experience_gain: u64,
        level_up: bool,
    },
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum DataType {
    AirQuality,
    WaterQuality,
    SoilComposition,
    Biodiversity,
    ForestDensity,
    EnergyUsage,
    WeatherData,
}

#[derive(Debug)]
pub enum GameError {
    InvalidInstruction,
    NotRentExempt,
    AlreadyInitialized,
    NotInitialized,
    InvalidPlayer,
    InvalidQuest,
    QuestNotStarted,
    QuestAlreadyCompleted,
    InsufficientEnergy,
    InsufficientLevel,
    InvalidItem,
    InvalidTrade,
    InvalidAchievement,
    InvalidLocation,
    InvalidEnvironmentalData,
}
