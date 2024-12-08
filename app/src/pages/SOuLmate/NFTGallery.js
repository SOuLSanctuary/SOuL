import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import '../../styles/SOuLmate.css';

const SOuLmateNFTGallery = () => {
  const { connected } = useWallet();

  return (
    <div className="soulmate-page">
      <h1>SOuLmate NFT Gallery</h1>
      {connected ? (
        <div className="nft-gallery-content">
          <div className="gallery-filters">
            <h2>Filter NFTs</h2>
            {/* Filter options will go here */}
          </div>
          <div className="nft-grid">
            {/* NFT cards will go here */}
          </div>
          <div className="gallery-pagination">
            {/* Pagination controls will go here */}
          </div>
        </div>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to view your SOuLmate NFT gallery</p>
        </div>
      )}
    </div>
  );
};

export default SOuLmateNFTGallery;
