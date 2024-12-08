import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './Inventory.css';

const ITEM_CATEGORIES = {
    TOOLS: '🛠️',
    SEEDS: '🌱',
    SENSORS: '📡',
    COLLECTIBLES: '✨',
    BOOSTERS: '🚀',
    SPECIAL: '🎁'
};

const RARITY_COLORS = {
    COMMON: '#95a5a6',
    UNCOMMON: '#2ecc71',
    RARE: '#3498db',
    EPIC: '#9b59b6',
    LEGENDARY: '#f1c40f'
};

const Inventory = ({ gameStateManager }) => {
    const { publicKey } = useWallet();
    const [inventory, setInventory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('rarity');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (publicKey) {
            loadInventory();
        }
    }, [publicKey]);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const playerInventory = await gameStateManager.getPlayerInventory(publicKey.toString());
            setInventory(playerInventory);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            setError('Failed to load inventory. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortItems = () => {
        let filteredItems = [...inventory];

        // Apply category filter
        if (selectedCategory !== 'ALL') {
            filteredItems = filteredItems.filter(item => item.category === selectedCategory);
        }

        // Apply search filter
        if (searchQuery) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'rarity':
                filteredItems.sort((a, b) => getRarityValue(b.rarity) - getRarityValue(a.rarity));
                break;
            case 'power':
                filteredItems.sort((a, b) => b.power - a.power);
                break;
            case 'name':
                filteredItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return filteredItems;
    };

    const getRarityValue = (rarity) => {
        const values = {
            COMMON: 1,
            UNCOMMON: 2,
            RARE: 3,
            EPIC: 4,
            LEGENDARY: 5
        };
        return values[rarity] || 0;
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const handleItemUse = async (item) => {
        try {
            await gameStateManager.useItem(item.id);
            loadInventory(); // Refresh inventory after using item
            setSelectedItem(null);
        } catch (error) {
            console.error('Failed to use item:', error);
            // Show error message to user
        }
    };

    const handleItemCombine = async (item1, item2) => {
        try {
            await gameStateManager.combineItems(item1.id, item2.id);
            loadInventory();
            setSelectedItem(null);
        } catch (error) {
            console.error('Failed to combine items:', error);
            // Show error message to user
        }
    };

    if (loading) {
        return (
            <div className="inventory-loading">
                <div className="loading-spinner"></div>
                <p>Loading inventory...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inventory-error">
                <p>{error}</p>
                <button onClick={loadInventory}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Inventory</h2>
                <div className="inventory-controls">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="rarity">Sort by Rarity</option>
                        <option value="power">Sort by Power</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
                <div className="category-filters">
                    <button 
                        className={selectedCategory === 'ALL' ? 'active' : ''}
                        onClick={() => setSelectedCategory('ALL')}
                    >
                        All
                    </button>
                    {Object.entries(ITEM_CATEGORIES).map(([category, emoji]) => (
                        <button
                            key={category}
                            className={selectedCategory === category ? 'active' : ''}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {emoji} {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="inventory-grid">
                {filterAndSortItems().map(item => (
                    <div 
                        key={item.id}
                        className={`inventory-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                        onClick={() => handleItemClick(item)}
                        style={{
                            borderColor: RARITY_COLORS[item.rarity]
                        }}
                    >
                        <div className="item-icon">
                            {ITEM_CATEGORIES[item.category]}
                        </div>
                        <div className="item-content">
                            <h3>{item.name}</h3>
                            <p className="item-description">{item.description}</p>
                            <div className="item-stats">
                                <span className="item-rarity" style={{ color: RARITY_COLORS[item.rarity] }}>
                                    {item.rarity}
                                </span>
                                <span className="item-power">⚡ {item.power}</span>
                            </div>
                            {item.attributes && (
                                <div className="item-attributes">
                                    {Object.entries(item.attributes).map(([key, value]) => (
                                        <span key={key} className="attribute">
                                            {key}: {value}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <div className="item-details-modal">
                    <div className="modal-content">
                        <h2>{selectedItem.name}</h2>
                        <p>{selectedItem.description}</p>
                        <div className="item-actions">
                            {selectedItem.usable && (
                                <button 
                                    className="use-button"
                                    onClick={() => handleItemUse(selectedItem)}
                                >
                                    Use Item
                                </button>
                            )}
                            {selectedItem.combinable && (
                                <button 
                                    className="combine-button"
                                    onClick={() => handleItemCombine(selectedItem)}
                                >
                                    Combine
                                </button>
                            )}
                            <button 
                                className="close-button"
                                onClick={() => setSelectedItem(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="inventory-summary">
                <div className="summary-stat">
                    <h4>Total Items</h4>
                    <p>{inventory.length}</p>
                </div>
                <div className="summary-stat">
                    <h4>Rarest Item</h4>
                    <p>{inventory.reduce((rarest, item) => 
                        getRarityValue(item.rarity) > getRarityValue(rarest.rarity) ? item : rarest
                    , { rarity: 'COMMON' }).rarity}</p>
                </div>
                <div className="summary-stat">
                    <h4>Total Power</h4>
                    <p>{inventory.reduce((sum, item) => sum + item.power, 0)}</p>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
