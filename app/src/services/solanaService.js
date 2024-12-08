import { 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';

// Program ID for our environmental activity program (replace with actual program ID once deployed)
const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

// Helper function to create buffer from activity data
function createActivityDataBuffer(data) {
  // Structure: [type (1), impact (8), timestamp (8), location_len (1), location (?), description_len (1), description (?)]
  const typeBuffer = Buffer.from([data.activityType.length]);
  const typeDataBuffer = Buffer.from(data.activityType);
  const impactBuffer = Buffer.alloc(8);
  impactBuffer.writeDoubleLE(parseFloat(data.impact));
  
  // Use Date.now() instead of BigInt for timestamp
  const timestampBuffer = Buffer.alloc(8);
  // eslint-disable-next-line no-undef
  timestampBuffer.writeBigUInt64LE(BigInt(Date.now()));
  
  const locationBuffer = Buffer.from(data.location);
  const locationLenBuffer = Buffer.from([locationBuffer.length]);
  const descriptionBuffer = Buffer.from(data.description);
  const descriptionLenBuffer = Buffer.from([descriptionBuffer.length]);

  return Buffer.concat([
    typeBuffer,
    typeDataBuffer,
    impactBuffer,
    timestampBuffer,
    locationLenBuffer,
    locationBuffer,
    descriptionLenBuffer,
    descriptionBuffer
  ]);
}

export async function submitEnvironmentalActivity({ wallet, connection }, data) {
  try {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Log the activity data
    console.log('Submitting environmental activity:', {
      type: data.activityType,
      location: data.location,
      impact: data.impact,
      description: data.description,
      date: data.date,
      timestamp: new Date().toISOString()
    });

    // Create data buffer for the activity
    const activityData = createActivityDataBuffer(data);

    // For now, we'll still do a SOL transfer as placeholder
    // Once the program is deployed, we'll replace this with actual program instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: LAMPORTS_PER_SOL * 0.001
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    try {
      // Request signature from wallet
      const signed = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // Store activity data in local storage for dashboard
      const activities = JSON.parse(localStorage.getItem('environmental_activities') || '[]');
      activities.push({
        ...data,
        signature,
        timestamp: new Date().toISOString(),
        wallet: wallet.publicKey.toString()
      });
      localStorage.setItem('environmental_activities', JSON.stringify(activities));

      return {
        success: true,
        signature,
        message: 'Activity recorded successfully!'
      };

    } catch (signError) {
      if (signError.message.includes('User rejected')) {
        throw new Error('Transaction was rejected by user');
      }
      throw signError;
    }

  } catch (error) {
    console.error('Error submitting to Solana:', error);
    return {
      success: false,
      error: error.message || 'Failed to record activity'
    };
  }
}

// Function to get all activities for a wallet
export async function getWalletActivities(walletAddress) {
  try {
    const activities = JSON.parse(localStorage.getItem('environmental_activities') || '[]');
    return activities.filter(activity => activity.wallet === walletAddress);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

// Function to get impact statistics
export function getImpactStats(activities) {
  return activities.reduce((stats, activity) => {
    const type = activity.activityType;
    if (!stats[type]) {
      stats[type] = 0;
    }
    stats[type] += parseFloat(activity.impact);
    return stats;
  }, {});
}
