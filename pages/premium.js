import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const Premium = () => {
  const router = useRouter();
  const { ref } = router.query;
  const wallet = useWallet();
  const [status, setStatus] = useState('initial');
  const [error, setError] = useState(null);

  const TREASURY_WALLET = new PublicKey('YOUR_TREASURY_WALLET_ADDRESS');
  const REQUIRED_SOL = 3;

  const handlePayment = async () => {
    if (!wallet.connected || !ref) return;
    
    try {
      setStatus('processing');
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
        'confirmed'
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: REQUIRED_SOL * LAMPORTS_PER_SOL,
        })
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) throw new Error('Transaction failed');

      // Notify backend of successful payment
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: ref,
          transaction_signature: signature,
          amount: REQUIRED_SOL,
          wallet_address: wallet.publicKey.toString()
        })
      });

      if (!response.ok) throw new Error('Verification failed');

      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-silver">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-silver to-light-silver bg-clip-text text-transparent">
          SwarmVentures Premium Access
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-b from-dark-gray to-black p-6 rounded-lg border border-silver/20">
            <h2 className="text-2xl font-semibold mb-4">Premium Features</h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-2xl mr-3">⚡</span>
                <div>
                  <h3 className="font-medium">Unlimited Tracking</h3>
                  <p className="text-silver/70">Track any number of swarms</p>
                </div>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h3 className="font-medium">Real-time Alerts</h3>
                  <p className="text-silver/70">Instant price notifications</p>
                </div>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">💰</span>
                <div>
                  <h3 className="font-medium">Revenue Updates</h3>
                  <p className="text-silver/70">Weekly distribution alerts</p>
                </div>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <h3 className="font-medium">Priority Support</h3>
                  <p className="text-silver/70">Direct access to our team</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-b from-dark-gray to-black p-6 rounded-lg border border-silver/20">
            <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
            <div className="space-y-6">
              <div>
                <p className="text-xl mb-2">Amount: 3 SOL</p>
                <p className="text-silver/70">One-time payment for lifetime access</p>
              </div>

              {!wallet.connected ? (
                <div>
                  <p className="mb-4">Connect your wallet to continue:</p>
                  <WalletMultiButton className="w-full" />
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={status === 'processing'}
                  className="w-full bg-gradient-to-r from-silver to-light-silver text-black font-bold py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {status === 'processing' ? 'Processing...' : 'Complete Payment'}
                </button>
              )}

              {error && (
                <div className="text-red-500 mt-4">
                  Error: {error}
                </div>
              )}

              {status === 'success' && (
                <div className="text-green-500 mt-4">
                  Payment successful! Your account has been upgraded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
