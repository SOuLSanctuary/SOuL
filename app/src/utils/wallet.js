import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const getTokenAccounts = async (connection, wallet) => {
    try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            wallet.publicKey,
            {
                programId: TOKEN_PROGRAM_ID,
            }
        );

        return tokenAccounts.value.map(accountInfo => ({
            mint: accountInfo.account.data.parsed.info.mint,
            tokenAmount: accountInfo.account.data.parsed.info.tokenAmount,
            tokenAccount: accountInfo.pubkey.toString(),
        }));
    } catch (error) {
        console.error('Error fetching token accounts:', error);
        return [];
    }
};

export const getSOuLBalance = async (connection, wallet, soulMint) => {
    try {
        const tokenAccounts = await getTokenAccounts(connection, wallet);
        const soulAccount = tokenAccounts.find(
            account => account.mint === soulMint
        );
        return soulAccount ? soulAccount.tokenAmount.uiAmount : 0;
    } catch (error) {
        console.error('Error fetching SOuL balance:', error);
        return 0;
    }
};
