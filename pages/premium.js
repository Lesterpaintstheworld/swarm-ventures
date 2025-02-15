'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import getLogger from '../utils/logger';

const logger = getLogger('premium-page');
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import Head from 'next/head';
import Layout from '../components/Layout';

const Premium = () => {
  const router = useRouter();
  const { ref } = router.query;
  const wallet = useWallet();
  const [status, setStatus] = useState('initial');
  const [error, setError] = useState(null);
  const [treasuryWallet, setTreasuryWallet] = useState(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS) {
      setTreasuryWallet(new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS));
    }
  }, []);

  const handlePayment = async () => {
    if (!wallet.connected || !ref || !treasuryWallet) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      logger.info('Initiating payment', { ref, wallet: wallet.publicKey.toString() });
      setStatus('processing');
      setError(null);
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        'confirmed'
      );
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: treasuryWallet,
          lamports: 3 * LAMPORTS_PER_SOL,
        })
      );

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext();

      const signature = await wallet.sendTransaction(transaction, connection);
      
      logger.info('Transaction sent', { signature });
      
      const confirmation = await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      logger.info('Transaction confirmed, verifying payment');

      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: ref,
          transaction_signature: signature,
          amount: 3,
          wallet_address: wallet.publicKey.toString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }

      setStatus('success');
      logger.info('Payment completed successfully');
    } catch (err) {
      logger.error('Payment failed', err, { ref });
      setError(err.message || 'Payment failed. Please try again.');
      setStatus('error');
    }
  };

  return (
    <Layout>
      <Head>
        <title>SwarmVentures Premium Access</title>
        <meta name="description" content="Unlock unlimited swarm tracking and real-time alerts" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-black via-dark-gray to-black px-4">
        <div className="max-w-7xl mx-auto py-16 md:py-24">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Premium Intelligence
            </h1>
            <p className="text-xl md:text-2xl text-silver/70 max-w-3xl mx-auto">
              Get professional-grade market intelligence and join the network of informed traders.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            {/* Features Column */}
            <div className="space-y-8">
              <div className="premium-feature-card">
                <div className="premium-icon">⚡</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Instant Alerts</h3>
                  <ul className="space-y-3 text-silver/70">
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Real-time price notifications
                    </li>
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      New cycle alerts
                    </li>
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Revenue distributions
                    </li>
                  </ul>
                </div>
              </div>

              <div className="premium-feature-card">
                <div className="premium-icon">📊</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Deep Analytics</h3>
                  <ul className="space-y-3 text-silver/70">
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Market analysis
                    </li>
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Performance metrics
                    </li>
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Trend detection
                    </li>
                  </ul>
                </div>
              </div>

              <div className="premium-feature-card">
                <div className="premium-icon">🎯</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Smart Tracking</h3>
                  <ul className="space-y-3 text-silver/70">
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Unlimited swarms
                    </li>
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Custom parameters
                    </li>
                    <li className="flex items-center">
                      <span className="text-silver mr-2">•</span>
                      Priority alerts
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Column */}
            <div className="sticky top-8">
              <div className="premium-payment-card">
                <div className="text-center mb-8">
                  <div className="premium-price">
                    <span className="text-sm text-silver/50 uppercase tracking-wider">One-time Payment</span>
                    <div className="text-5xl font-bold gradient-text mt-2">3 SOL</div>
                  </div>
                  <p className="text-silver/70 mt-4">Lifetime access to premium features</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="premium-benefit">
                    <span className="text-2xl text-green-400">✓</span>
                    <span>Unlimited Swarm Tracking</span>
                  </div>
                  <div className="premium-benefit">
                    <span className="text-2xl text-green-400">✓</span>
                    <span>Real-time Price Alerts</span>
                  </div>
                  <div className="premium-benefit">
                    <span className="text-2xl text-green-400">✓</span>
                    <span>Revenue Notifications</span>
                  </div>
                  <div className="premium-benefit">
                    <span className="text-2xl text-green-400">✓</span>
                    <span>Priority Support</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {!wallet.connected ? (
                    <WalletMultiButton className="w-full premium-button" />
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={status === 'processing'}
                      className="w-full premium-button bg-gradient-to-r from-silver to-light-silver 
                                text-black font-bold py-4 px-6 rounded-lg 
                                transition-all duration-200 hover:opacity-90 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'processing' ? 'Processing...' : 'Complete Payment'}
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                    {error}
                  </div>
                )}

                {status === 'success' && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
                    Payment successful! Your account has been upgraded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Premium;
