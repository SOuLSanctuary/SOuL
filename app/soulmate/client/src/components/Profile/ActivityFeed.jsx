import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  useTheme,
  Divider,
  Tooltip
} from '@mui/material';
import {
  AccountBalanceWallet,
  EmojiEvents,
  Public,
  FilterList,
  MoreVert,
  LocalOffer,
  SwapHoriz,
  AddCircle,
  RemoveCircle
} from '@mui/icons-material';

const ActivityFeed = ({ activities }) => {
  const theme = useTheme();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMenuClick = (event, activity) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedActivity(null);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'stake':
        return <AddCircle color="success" />;
      case 'unstake':
        return <RemoveCircle color="error" />;
      case 'claim':
        return <LocalOffer color="primary" />;
      case 'purchase':
        return <AccountBalanceWallet color="primary" />;
      case 'mint':
        return <AddCircle color="secondary" />;
      case 'transfer':
        return <SwapHoriz color="primary" />;
      case 'social':
        return <Public color="primary" />;
      default:
        return <EmojiEvents color="primary" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'stake':
        return theme.palette.success.main;
      case 'unstake':
        return theme.palette.error.main;
      case 'claim':
        return theme.palette.primary.main;
      case 'purchase':
        return theme.palette.info.main;
      case 'mint':
        return theme.palette.secondary.main;
      case 'transfer':
        return theme.palette.warning.main;
      case 'social':
        return theme.palette.primary.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const filteredActivities = activities?.filter(activity => {
    if (selectedFilter === 'all') return true;
    return activity.type === selectedFilter;
  });

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Activity Feed</Typography>
        <Button
          startIcon={<FilterList />}
          onClick={handleFilterClick}
          variant="outlined"
          size="small"
        >
          {selectedFilter === 'all' ? 'All Activities' : selectedFilter}
        </Button>
      </Box>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem
          onClick={() => {
            setSelectedFilter('all');
            handleFilterClose();
          }}
          selected={selectedFilter === 'all'}
        >
          All Activities
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedFilter('stake');
            handleFilterClose();
          }}
          selected={selectedFilter === 'stake'}
        >
          Staking
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedFilter('purchase');
            handleFilterClose();
          }}
          selected={selectedFilter === 'purchase'}
        >
          Purchases
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedFilter('social');
            handleFilterClose();
          }}
          selected={selectedFilter === 'social'}
        >
          Social
        </MenuItem>
      </Menu>

      <List>
        {filteredActivities?.map((activity, index) => (
          <React.Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" component="span">
                      {activity.description}
                    </Typography>
                    <Chip
                      label={activity.type}
                      size="small"
                      sx={{
                        backgroundColor: getActivityColor(activity.type) + '20',
                        color: getActivityColor(activity.type),
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    {formatTimeAgo(activity.date)}
                  </Typography>
                }
              />
              <IconButton
                edge="end"
                onClick={(e) => handleMenuClick(e, activity)}
                size="small"
              >
                <MoreVert />
              </IconButton>
            </ListItem>
            {index < filteredActivities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Share</MenuItem>
        <MenuItem onClick={handleMenuClose}>Hide</MenuItem>
      </Menu>
    </Paper>
  );
};

export default ActivityFeed;
