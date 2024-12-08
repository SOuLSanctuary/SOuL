// List of admin wallet addresses
const adminWallets = [
  // Add admin wallet addresses here
  "admin_wallet_1",
  "admin_wallet_2"
];

export const isAdminWallet = (walletAddress) => {
  return adminWallets.includes(walletAddress);
};
