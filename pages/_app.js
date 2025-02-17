import '../styles/globals.css';
import { useEffect } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import getLogger from '../utils/logger';
require('@solana/wallet-adapter-react-ui/styles.css');

const logger = getLogger('_app');

function MyApp({ Component, pageProps }) {
  const wallets = [new PhantomWalletAdapter()];

  useEffect(() => {
    const handleError = (error) => {
      logger.error('Global error caught', error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <Component {...pageProps} />
      </WalletModalProvider>
    </WalletProvider>
  );
}

export default MyApp;
