import { Connection, PublicKey } from '@solana/web3.js';
import { AirtableClient } from '../../utils/airtable.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegram_id, transaction_signature, amount, wallet_address } = req.body;

  try {
    // Verify the transaction
    const connection = new Connection(
      process.env.SOLANA_RPC_URL,
      'confirmed'
    );

    const tx = await connection.getTransaction(transaction_signature);
    
    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    // Verify amount and recipient
    const transferAmount = tx.meta.postBalances[1] - tx.meta.preBalances[1];
    if (transferAmount !== amount * LAMPORTS_PER_SOL) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Update user status in Airtable
    const airtable = new AirtableClient();
    await airtable.update_user_status(telegram_id, 'premium');
    
    // Update payment details
    await airtable.update_payment_details(telegram_id, {
      payment_date: new Date().toISOString(),
      amount_paid: amount,
      transaction_signature,
      payment_status: 'completed'
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
}
