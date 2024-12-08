import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

export const checkAdminStatus = async (walletAddress) => {
  try {
    const adminDoc = await getDoc(doc(collection(db, 'admins'), walletAddress));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
