use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    clock::UnixTimestamp,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct GameState {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub total_players: u64,
    pub total_quests_completed: u64,
    pub total_rewards_distributed: u64,
    pub last_update: UnixTimestamp,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct PlayerState {
    pub owner: Pubkey,
    pub experience: u64,
    pub level: u16,
    pub quests_completed: u64,
    pub rewards_earned: u64,
    pub inventory: PlayerInventory,
    pub achievements: Vec<Achievement>,
    pub last_quest_time: UnixTimestamp,
    pub energy: u8,  // 0-100
    pub collection_power: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct PlayerInventory {
    pub items: Vec<Item>,
    pub collectibles: Vec<Collectible>,
    pub resources: Resources,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Item {
    pub id: u64,
    pub item_type: ItemType,
    pub rarity: Rarity,
    pub power: u16,
    pub attributes: Vec<Attribute>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum ItemType {
    Sensor,         // For environmental data collection
    Drone,          // For aerial surveillance
    WaterTester,    // For water quality testing
    SoilAnalyzer,   // For soil composition analysis
    BiodiversityScanner, // For species identification
    EnergyMeter,    // For energy consumption monitoring
    WeatherStation, // For climate data collection
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Collectible {
    pub id: u64,
    pub collectible_type: CollectibleType,
    pub rarity: Rarity,
    pub power: u16,
    pub location: GeoLocation,
    pub timestamp: UnixTimestamp,
    pub environmental_impact: EnvironmentalImpact,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum CollectibleType {
    Tree,
    WaterSource,
    Wildlife,
    CleanEnergy,
    Ecosystem,
    Conservation,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Resources {
    pub energy_crystals: u64,
    pub eco_tokens: u64,
    pub research_points: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Achievement {
    pub id: u64,
    pub achievement_type: AchievementType,
    pub timestamp: UnixTimestamp,
    pub reward: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum AchievementType {
    DataCollector,      // Collect X environmental data points
    Conservationist,    // Protect X amount of forest area
    WaterGuardian,      // Monitor X water sources
    EnergyInnovator,    // Implement X clean energy solutions
    BiodiversityHero,   // Document X different species
    CommunityLeader,    // Complete X community challenges
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Quest {
    pub id: u64,
    pub quest_type: QuestType,
    pub difficulty: u8,
    pub rewards: QuestRewards,
    pub requirements: QuestRequirements,
    pub location: Option<GeoLocation>,
    pub time_limit: Option<u64>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum QuestType {
    DataCollection,
    Conservation,
    Research,
    Community,
    Special,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct QuestRewards {
    pub experience: u64,
    pub eco_tokens: u64,
    pub items: Vec<Item>,
    pub achievement: Option<Achievement>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct QuestRequirements {
    pub min_level: u16,
    pub required_items: Vec<ItemType>,
    pub required_collectibles: Vec<CollectibleType>,
    pub energy_cost: u8,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct GeoLocation {
    pub latitude: i64,  // multiplied by 1e6 for precision
    pub longitude: i64, // multiplied by 1e6 for precision
    pub altitude: i32,  // in meters
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct EnvironmentalImpact {
    pub carbon_offset: u64,
    pub water_saved: u64,
    pub energy_saved: u64,
    pub biodiversity_impact: u16,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Attribute {
    pub attribute_type: AttributeType,
    pub value: u16,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum AttributeType {
    Accuracy,
    Range,
    Efficiency,
    Durability,
    Speed,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

impl PlayerState {
    pub fn can_start_quest(&self, quest: &Quest) -> bool {
        self.level >= quest.requirements.min_level &&
        self.energy >= quest.requirements.energy_cost &&
        self.has_required_items(&quest.requirements.required_items) &&
        self.has_required_collectibles(&quest.requirements.required_collectibles)
    }

    pub fn has_required_items(&self, required_items: &[ItemType]) -> bool {
        required_items.iter().all(|required_item| {
            self.inventory.items.iter().any(|item| item.item_type == *required_item)
        })
    }

    pub fn has_required_collectibles(&self, required_collectibles: &[CollectibleType]) -> bool {
        required_collectibles.iter().all(|required_collectible| {
            self.inventory.collectibles.iter().any(|collectible| 
                collectible.collectible_type == *required_collectible
            )
        })
    }

    pub fn calculate_collection_power(&self) -> u64 {
        let item_power: u64 = self.inventory.items.iter()
            .map(|item| item.power as u64)
            .sum();

        let collectible_power: u64 = self.inventory.collectibles.iter()
            .map(|collectible| collectible.power as u64)
            .sum();

        item_power + collectible_power + (self.level as u64 * 100)
    }
}
