import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useWallet } from './contexts/WalletContext';
import { WalletProvider } from './contexts/WalletContext';
import { XPProvider } from './contexts/XPContext';
import { BadgeProvider } from './contexts/BadgeContext';
import { ProfileProvider } from './contexts/ProfileContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Collector from './pages/Collector';
import Marketplace from './pages/Marketplace/Marketplace';
import EnvironmentalMonitor from './pages/EnvironmentalMonitor';
import Restoration from './pages/Restoration';
import SurveyInventory from './pages/SurveyInventory';
import ImpactMap from './pages/ImpactMap/ImpactMap';
import Game from './pages/Game/Game';
import SOuLmateProfile from './pages/SOuLmate/Profile';
import SOuLmateWallet from './pages/SOuLmate/Wallet';
import SOuLmateAchievements from './pages/SOuLmate/Achievements';
import SOuLmateNFTGallery from './pages/SOuLmate/NFTGallery';
import SOuLmateStaking from './pages/SOuLmate/Staking';
import SOuLmateSocial from './pages/SOuLmate/Social';
import './styles/App.css';

function AppContent() {
  const { connected } = useWallet();

  return (
    <div className={`app ${!connected ? 'wallet-not-connected' : ''}`}>
      <Navigation />
      <main className="main-content">
        <Switch>
          <Route exact path="/" component={SOuLmateProfile} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/collector" component={Collector} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/monitor" component={EnvironmentalMonitor} />
          <Route path="/restoration" component={Restoration} />
          <Route path="/survey" component={SurveyInventory} />
          <Route path="/impact" component={ImpactMap} />
          <Route path="/game" component={Game} />
          <Route path="/game/inventory" component={Game} />
          <Route path="/game/stats" component={Game} />
          <Route path="/soulmate/profile" component={SOuLmateProfile} />
          <Route path="/soulmate/wallet" component={SOuLmateWallet} />
          <Route path="/soulmate/achievements" component={SOuLmateAchievements} />
          <Route path="/soulmate/nft-gallery" component={SOuLmateNFTGallery} />
          <Route path="/soulmate/staking" component={SOuLmateStaking} />
          <Route path="/soulmate/social" component={SOuLmateSocial} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <XPProvider>
        <BadgeProvider>
          <ProfileProvider>
            <Router>
              <AppContent />
            </Router>
          </ProfileProvider>
        </BadgeProvider>
      </XPProvider>
    </WalletProvider>
  );
}

export default App;
