import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  useTheme,
  Paper,
  Button,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  FilterList,
  Close,
  OpenInNew,
  Share,
  ContentCopy,
  Visibility
} from '@mui/icons-material';
import { SUPPORTED_NETWORKS } from '../../config/networks';

const NFTGallery = ({ nfts }) => {
  const theme = useTheme();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    chain: 'all',
    sort: 'newest'
  });

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    handleFilterClose();
  };

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
  };

  const handleClose = () => {
    setSelectedNFT(null);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getExplorerLink = (chainId, contractAddress, tokenId) => {
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) return '#';
    return `${network.blockExplorerUrl}/token/${contractAddress}?a=${tokenId}`;
  };

  const filteredNFTs = nfts?.filter(nft => {
    if (filters.chain === 'all') return true;
    return nft.chainId.toString() === filters.chain;
  }).sort((a, b) => {
    if (filters.sort === 'newest') {
      return new Date(b.mintDate || 0) - new Date(a.mintDate || 0);
    }
    // Add more sorting options here
    return 0;
  });

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            NFT Collection ({filteredNFTs?.length || 0})
          </Typography>
          <Box>
            <Button
              startIcon={<FilterList />}
              onClick={handleFilterClick}
              variant="outlined"
              size="small"
            >
              Filter & Sort
            </Button>
          </Box>
        </Box>
      </Paper>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Chain</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange('chain', 'all')}
          selected={filters.chain === 'all'}
        >
          All Chains
        </MenuItem>
        {Object.entries(SUPPORTED_NETWORKS).map(([chainId, network]) => (
          <MenuItem
            key={chainId}
            onClick={() => handleFilterChange('chain', chainId)}
            selected={filters.chain === chainId}
          >
            {network.name}
          </MenuItem>
        ))}
        <MenuItem disabled>
          <Typography variant="subtitle2">Sort By</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange('sort', 'newest')}
          selected={filters.sort === 'newest'}
        >
          Newest First
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange('sort', 'oldest')}
          selected={filters.sort === 'oldest'}
        >
          Oldest First
        </MenuItem>
      </Menu>

      <Grid container spacing={3}>
        {filteredNFTs?.map((nft, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
              onClick={() => handleNFTClick(nft)}
            >
              <CardMedia
                component="img"
                height="200"
                image={nft.imageUrl}
                alt={nft.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" noWrap>
                  {nft.name}
                </Typography>
                <Chip
                  label={SUPPORTED_NETWORKS[nft.chainId]?.name || 'Unknown Chain'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={Boolean(selectedNFT)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        {selectedNFT && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedNFT.name}</Typography>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedNFT.imageUrl}
                    alt={selectedNFT.name}
                    style={{
                      width: '100%',
                      borderRadius: theme.shape.borderRadius,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Token ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {selectedNFT.tokenId}
                      </Typography>
                      <Tooltip title="Copy Token ID">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(selectedNFT.tokenId)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Contract Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {`${selectedNFT.contractAddress.slice(0, 6)}...${selectedNFT.contractAddress.slice(-4)}`}
                      </Typography>
                      <Tooltip title="Copy Contract Address">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(selectedNFT.contractAddress)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View on Explorer">
                        <IconButton
                          size="small"
                          onClick={() => window.open(
                            getExplorerLink(
                              selectedNFT.chainId,
                              selectedNFT.contractAddress,
                              selectedNFT.tokenId
                            ),
                            '_blank'
                          )}
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Network
                    </Typography>
                    <Chip
                      label={SUPPORTED_NETWORKS[selectedNFT.chainId]?.name || 'Unknown Chain'}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<Share />}
                      fullWidth
                      onClick={() => {
                        const url = window.location.href;
                        copyToClipboard(url);
                      }}
                    >
                      Share NFT
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={() => window.open(selectedNFT.imageUrl, '_blank')}
                    >
                      View Original
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default NFTGallery;
