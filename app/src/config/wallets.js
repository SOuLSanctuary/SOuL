import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export const getWallets = () => {
    return [new PhantomWalletAdapter()];
};
