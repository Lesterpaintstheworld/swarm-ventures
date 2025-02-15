import { Connection, PublicKey } from '@solana/web3.js';
import { AirtableClient } from '../../utils/airtable.js';
import getLogger from '../../utils/logger';

const logger = getLogger('/api/verify-payment');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    logger.error('Invalid method', null, { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegram_id, transaction_signature, amount, wallet_address } = req.body;
  
  logger.info('Processing payment verification', { 
    telegram_id,
    transaction_signature,
    amount,
    wallet_address 
  });

  try {
    // Verify the transaction
    const connection = new Connection(
      process.env.SOLANA_RPC_URL,
      'confirmed'
    );

    logger.info('Fetching transaction', { signature: transaction_signature });
    const tx = await connection.getTransaction(transaction_signature);
    
    if (!tx) {
      logger.error('Transaction not found', null, { signature: transaction_signature });
      return res.status(400).json({ error: 'Transaction not found' });
    }

    // Verify amount and recipient
    const transferAmount = tx.meta.postBalances[1] - tx.meta.preBalances[1];
    if (transferAmount !== amount * LAMPORTS_PER_SOL) {
      logger.error('Invalid amount', null, { 
        expected: amount * LAMPORTS_PER_SOL,
        received: transferAmount 
      });
      return res.status(400).json({ error: 'Invalid amount' });
    }

    logger.info('Updating user status in Airtable', { telegram_id });
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

    logger.info('Payment verification completed successfully', { telegram_id });
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Payment verification failed', error, {
      telegram_id,
      transaction_signature
    });
    return res.status(500).json({ error: 'Payment verification failed' });
  }
}
