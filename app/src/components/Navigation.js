import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';
import { WalletButton } from './WalletButton';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';

const Navigation = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleDropdownClick = (dropdownName, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.nav-item')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  const isLinkActive = (path) => location.pathname === path;

  const navigationItems = {
    soulmate: {
      label: 'SOuLmate',
      items: [
        { path: '/', label: 'Profile' },
        { path: '/soulmate/achievements', label: 'Achievements' },
        { path: '/soulmate/wallet', label: 'Wallet' },
        { path: '/soulmate/nft-gallery', label: 'NFT Gallery' },
        { path: '/soulmate/staking', label: 'Staking' },
        { path: '/soulmate/social', label: 'Social' }
      ]
    },
    dashboard: {
      label: 'Dashboard',
      items: [
        { path: '/dashboard', label: 'Overview' },
        { path: '/monitor', label: 'Monitor' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/restoration', label: 'Restoration' },
        { path: '/survey', label: 'Survey' }
      ]
    },
    collectors: {
      label: 'Collectors',
      items: [
        { path: '/collector', label: 'Collector Dashboard' },
        { path: '/collector/inventory', label: 'Inventory' },
        { path: '/collector/rewards', label: 'Rewards' },
        { path: '/collector/leaderboard', label: 'Leaderboard' },
        { path: '/collector/achievements', label: 'Achievements' }
      ]
    },
    community: {
      label: 'Community',
      items: [
        { path: '/community/events', label: 'Events' },
        { path: '/community/groups', label: 'Groups' }
      ]
    },
    marketplace: {
      label: 'Marketplace',
      items: [
        { path: '/marketplace', label: 'Browse' },
        { path: '/marketplace/featured', label: 'Featured Items' },
        { path: '/marketplace/my-items', label: 'My Items' }
      ]
    },
    game: {
      label: 'Game',
      items: [
        { path: '/game', label: 'Play Game' },
        { path: '/game/inventory', label: 'Game Inventory' },
        { path: '/game/stats', label: 'Game Stats' }
      ]
    },
    geomedia: {
      label: 'GeoMedia',
      items: [
        { path: '/impact', label: 'Impact Map' },
        { path: '/impact-feed', label: 'Impact Feed' },
        { path: '/upload', label: 'Upload' }
      ]
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src="/SOuL.png" alt="SOuL Logo" className="soul-logo" />
          <span className="brand-name">SOuL Sanctuary</span>
        </Link>
      </div>

      <div className="nav-center">
        {Object.entries(navigationItems).map(([key, section]) => (
          <div className="nav-item" key={key}>
            <button
              className="dropdown-button"
              onClick={(e) => handleDropdownClick(key, e)}
            >
              {section.label}
            </button>
            <div 
              className={`dropdown-menu ${activeDropdown === key ? 'active' : ''}`}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dropdown
            >
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`dropdown-item ${isLinkActive(item.path) ? 'active' : ''}`}
                  onClick={() => setActiveDropdown(null)} // Close after selection
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="nav-right">
        <span className="copyright-text">Copyright 2024 | SOuLSanctuary</span>
        <div className="social-links">
          <a
            href="https://x.com/S0uLSanctuary"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <FaXTwitter size={24} />
          </a>
          <a
            href="https://t.me/+F_J4pkQ_JL4xYWI1"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <FaTelegram size={24} />
          </a>
        </div>
        <WalletButton />
      </div>
    </nav>
  );
};

export default Navigation;
