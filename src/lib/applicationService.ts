import { db } from './firebase';
import { collection, doc, runTransaction, getDocs, query, where, Timestamp } from 'firebase/firestore';

export async function generateApplicationReference(): Promise<string> {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const counterRef = doc(db, 'counters', 'applications');

  try {
    const newCount = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let count = 1;
      let dbDateStr = dateStr;

      if (counterDoc.exists()) {
        const data = counterDoc.data();
        if (data.currentDate === dateStr) {
          count = (data.count || 0) + 1;
        }
      }

      transaction.set(counterRef, {
        currentDate: dateStr,
        count: count
      }, { merge: true });

      return count;
    });

    const sequenceStr = newCount.toString().padStart(4, '0');
    return `AK-${dateStr}-${sequenceStr}`;
  } catch (error) {
    console.error("Transaction failed: ", error);
    // Fallback if transaction fails
    return `AK-${dateStr}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
}
