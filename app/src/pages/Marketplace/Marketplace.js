import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useXP } from '../../contexts/XPContext';
import { useBadges } from '../../contexts/BadgeContext';
import { useHistory } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { fetchProfile } from '../../api/profile';
import { 
  FaTree, 
  FaSeedling, 
  FaLeaf, 
  FaCoffee,
  FaShareAlt,
  FaWallet,
  FaUser,
  FaCoins,
  FaMedal,
  FaShieldAlt,
  FaMapMarkedAlt
} from 'react-icons/fa';
import { 
  LAMPORTS_PER_SOL, 
  Transaction, 
  PublicKey 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction
} from '@solana/spl-token';
import { marketplaceItems } from '../../data/marketplaceItems';
import { isAdminWallet } from '../../config/admin';
import './Marketplace.css';

const Marketplace = () => {
  const history = useHistory();
  const { publicKey, wallet, connection, TOKEN_MINTS, connect } = useWallet();
  const { addXP } = useXP();
  const { awardBadge } = useBadges();
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [cart, setCart] = useState({});
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (publicKey) {
        try {
          const userProfile = await fetchProfile(publicKey.toString());
          setProfile(userProfile);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };
    loadProfile();
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      setIsAdmin(isAdminWallet(publicKey.toString()));
    } else {
      setIsAdmin(false);
    }
  }, [publicKey]);

  const handleQuantityChange = (itemName, quantity) => {
    setCart(prev => ({
      ...prev,
      [itemName]: Math.max(0, quantity)
    }));
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemName, quantity]) => {
      const item = Object.values(marketplaceItems)
        .flatMap(cat => cat)
        .find(i => i.name === itemName);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const handlePurchase = async () => {
    if (!publicKey || !wallet) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Create transaction
      const transaction = new Transaction();
      const total = calculateTotal();

      // Add token transfer instruction
      const tokenMint = TOKEN_MINTS[selectedToken];
      const userTokenAccount = await getAssociatedTokenAddress(tokenMint, publicKey);
      const treasuryTokenAccount = await getAssociatedTokenAddress(tokenMint, new PublicKey('YOUR_TREASURY_WALLET'));

      transaction.add(
        createTransferInstruction(
          userTokenAccount,
          treasuryTokenAccount,
          publicKey,
          total * Math.pow(10, 6) // USDC has 6 decimals
        )
      );

      // Send transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Process successful purchase
      const purchaseDate = new Date();
      const newPurchases = Object.entries(cart).map(([itemName, quantity]) => {
        const item = Object.values(marketplaceItems)
          .flatMap(cat => cat)
          .find(i => i.name === itemName);
        
        if (item) {
          // Award XP
          addXP(item.xpReward * quantity);
          
          // Award badges based on purchase
          if (['Calamansi Seedling', 'Mayer Lemon Seedling'].includes(itemName)) {
            awardBadge('CitrusGrower');
          } else if (['Coffea Robusta Seedling', 'Coffea Arabica Seedling', 'Cacao Seedling'].includes(itemName)) {
            awardBadge('CoffeeMaster');
          } else if (item.category === 'Premium Grafted/Marcotted Fruit Seedlings') {
            awardBadge('PremiumGrower');
          }
        }

        return {
          itemName,
          quantity,
          purchaseDate,
          vestingEndDate: new Date(purchaseDate.getTime() + (item?.vestingPeriod || 0))
        };
      });

      setPurchases(prev => [...prev, ...newPurchases]);
      setCart({});
      
      // Share to social media
      const handleShare = (purchasedItems) => {
        const text = `🌱 Just invested in my future forest with SOuL Sanctuary! 
${purchasedItems.map(p => `${p.quantity}x ${p.itemName}`).join('\n')}
Join me in growing a sustainable future! 🌳`;

        if (navigator.share) {
          navigator.share({
            title: 'My Forest Investment',
            text: text,
            url: window.location.href
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          navigator.clipboard.writeText(text);
          alert('Purchase details copied to clipboard! Share with your friends!');
        }
      };

      handleShare(newPurchases);

      alert('Purchase successful! Your seedlings are now vesting.');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSection = () => {
    if (!publicKey || !wallet) {
      return (
        <div className="profile-section">
          <h2 className="panel-title">Profile</h2>
          <p className="connect-prompt">Connect your wallet to view profile</p>
        </div>
      );
    }

    return (
      <div className="profile-section">
        <h2 className="panel-title">Profile</h2>
        <div className="profile-details">
          <div className="wallet-address">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </div>
          <div className="balance">
            <span>Balance:</span>
            <span>{profile?.walletBalance || '0'} SOL</span>
          </div>
          <div className="xp-display">
            <span>XP:</span>
            <span>{profile?.soulXP || '0'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderImpactSection = () => {
    return (
      <div className="impact-section">
        <h2 className="section-title">Your Impact</h2>
        <div className="impact-stats">
          <div className="stat">
            <FaTree className="stat-icon" />
            <div className="stat-value">247</div>
            <div className="stat-label">Trees Planted</div>
          </div>
          <div className="stat">
            <FaSeedling className="stat-icon" />
            <div className="stat-value">12</div>
            <div className="stat-label">Plots Active</div>
          </div>
          <div className="stat">
            <FaLeaf className="stat-icon" />
            <div className="stat-value">5.2</div>
            <div className="stat-label">Tons CO₂ Offset</div>
          </div>
        </div>
        <div className="map-preview">
          <div className="map-thumbnail">
            <img 
              src="/images/impact-map-preview.png" 
              alt="Impact Map Preview"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="map-placeholder">
              <span>Map Preview</span>
            </div>
          </div>
          <button className="view-map-btn">
            <FaMapMarkedAlt /> View Impact Map
          </button>
        </div>
      </div>
    );
  };

  const renderPurchasesList = () => {
    if (!publicKey) return null;

    return (
      <div className="panel-section">
        <h2 className="panel-title">Your Forest</h2>
        <div className="purchases-list">
          {purchases.map((purchase, index) => (
            <div key={index} className="purchase-item">
              <div className="purchase-name">{purchase.itemName}</div>
              <div className="purchase-details">
                <div className="purchase-quantity">x{purchase.quantity}</div>
                <div className="vesting-countdown">
                  Vesting: {formatDistance(
                    new Date(purchase.vestingEndDate),
                    new Date(),
                    { addSuffix: true }
                  )}
                </div>
              </div>
            </div>
          ))}
          {purchases.length === 0 && (
            <p className="no-items">No seedlings purchased yet</p>
          )}
        </div>
      </div>
    );
  };

  const renderMarketplaceItems = () => {
    return Object.entries(marketplaceItems).map(([category, items]) => (
      <div key={category} className="marketplace-category">
        <h3 className="category-title">{category}</h3>
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.name} className="marketplace-item">
              <h4>{item.name}</h4>
              <div className="item-details">
                <div className="price">
                  ${item.price} {item.currency}
                </div>
                <div className="xp-reward">
                  +{item.xpReward.toLocaleString()} XP
                </div>
                <div className="vesting">
                  Vesting: {Math.round(item.vestingPeriod / (365 * 24 * 60 * 60 * 1000))} years
                </div>
              </div>
              <div className="item-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.name, (cart[item.name] || 0) - 1)}
                  disabled={!publicKey || !cart[item.name]}
                >
                  -
                </button>
                <span className="quantity">{cart[item.name] || 0}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.name, (cart[item.name] || 0) + 1)}
                  disabled={!publicKey}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const renderCart = () => {
    return (
      <div className="cart-container">
        <h2 className="panel-title">Shopping Cart</h2>
        {publicKey ? (
          <>
            <div className="wallet-info">
              <div className="wallet-address" title={publicKey.toString()}>
                Wallet: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </div>
              <div className="wallet-balance">
                Balance: {profile?.walletBalance || '0'} SOL
              </div>
            </div>
            {Object.keys(cart).length > 0 ? (
              <div className="cart-summary">
                <div className="cart-items">
                  {Object.entries(cart).map(([itemName, quantity]) => 
                    quantity > 0 && (
                      <div key={itemName} className="cart-item">
                        <span>{itemName}</span>
                        <span>x{quantity}</span>
                      </div>
                    )
                  )}
                </div>
                <div className="cart-total">
                  Total: ${calculateTotal()} {selectedToken}
                </div>
                <button 
                  className="purchase-btn"
                  onClick={handlePurchase}
                  disabled={loading || !publicKey}
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                </button>
              </div>
            ) : (
              <>
                <p className="no-items">Your cart is empty</p>
                {purchases.length > 0 && (
                  <div className="transaction-history">
                    <h3 className="section-title">Transaction History</h3>
                    <div className="transaction-table">
                      <div className="table-header">
                        <div className="header-cell">Date</div>
                        <div className="header-cell">Item</div>
                        <div className="header-cell">Quantity</div>
                        <div className="header-cell">Vesting Until</div>
                      </div>
                      <div className="table-body">
                        {purchases.map((purchase, index) => (
                          <div key={index} className="table-row">
                            <div className="table-cell">
                              {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </div>
                            <div className="table-cell">{purchase.itemName}</div>
                            <div className="table-cell">x{purchase.quantity}</div>
                            <div className="table-cell">
                              {new Date(purchase.vestingEndDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="connect-prompt">
            <p>Connect your wallet to start shopping</p>
            <button className="connect-wallet-button" onClick={wallet.connect}>
              <FaWallet /> Connect Wallet
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderConnectWallet = () => {
    const handleConnect = async () => {
      setIsLoading(true);
      try {
        await connect();
      } catch (error) {
        console.error('Wallet connection failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="connect-wallet-section">
        <FaWallet className="wallet-icon" />
        <h2>Connect Wallet</h2>
        <p>Please connect your wallet to access the marketplace</p>
        <button 
          className="connect-wallet-btn"
          onClick={isLoading ? undefined : handleConnect}
          disabled={isLoading}
        >
          <FaWallet /> {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    );
  };

  const renderMarketplaceContent = () => {
    return (
      <>
        {isAdmin && (
          <div className="admin-badge">
            <FaShieldAlt /> Admin Mode
          </div>
        )}
        
        <h1 className="marketplace-title">forestSOuL Marketplace</h1>
        <p className="marketplace-description">Purchase your seedlings now and retire SOuLfully.</p>

        <div className="benefits-section">
          <div className="benefit-card">
            <h3>🌱 Transparent Impact</h3>
            <p>No more donations without a trace. Every contribution is recorded on the blockchain.</p>
          </div>
          
          <div className="benefit-card">
            <h3>💎 Secured Investment</h3>
            <p>No more wasted investments and efforts. Your forest assets are protected and verifiable.</p>
          </div>
          
          <div className="benefit-card">
            <h3>🌿 Regular Returns</h3>
            <p>Get your dividends every harvest. Watch your investment grow naturally.</p>
          </div>
          
          <div className="benefit-card">
            <h3>💰 Monthly Income</h3>
            <p>Get your share of 75% fee collection every month. Passive income from your green investment.</p>
          </div>
          
          <div className="benefit-card">
            <h3>👨‍🌾 Fair Compensation</h3>
            <p>Tap your back because you give/gave labor with humane income. Fair rewards for forest stewards.</p>
          </div>
          
          <div className="benefit-card">
            <h3>🎖️ Verifiable Achievement</h3>
            <p>Share your verifiable Certificate NFT for employment application and Earth Good Citizenship.</p>
          </div>
        </div>

        <div className="marketplace-layout">
          {/* Left Panel - Account Details & Purchases */}
          <div className="marketplace-panel left-panel">
            {renderProfileSection()}
            {renderPurchasesList()}
            {renderImpactSection()}
          </div>

          {/* Middle Panel - Marketplace Items */}
          <div className="marketplace-panel middle-panel">
            <div className="marketplace-content">
              {renderMarketplaceItems()}
            </div>
          </div>

          {/* Right Panel - Cart */}
          <div className="marketplace-panel right-panel">
            {renderCart()}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="marketplace-container">
      {!publicKey ? renderConnectWallet() : renderMarketplaceContent()}
    </div>
  );
};

export default Marketplace;
