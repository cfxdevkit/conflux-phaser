import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAccount, useWalletClient, usePublicClient, useDisconnect } from 'wagmi';
import { EventBus } from '../components/game/EventBus';
import { WalletContext } from './walletContextTypes';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { disconnect } = useDisconnect();
  const [initialized, setInitialized] = useState(false);

  // Function to handle wallet disconnect from the game
  const disconnectWallet = useCallback(() => {
    disconnect();
    EventBus.emit('wallet-disconnected');
    console.log('Wallet disconnected from game');
  }, [disconnect]);

  // Initialize the connection state
  useEffect(() => {
    if (!initialized && typeof window !== 'undefined') {
      setInitialized(true);
    }
  }, [initialized]);

  // Handle wallet state changes and emit events
  useEffect(() => {
    if (initialized) {
      if (isConnected && walletClient && publicClient) {
        // Small delay to ensure game is ready to receive events
        setTimeout(() => {
          EventBus.emit('wallet-connected', { walletClient, publicClient });
        }, 100);
      } else if (!isConnected) {
        EventBus.emit('wallet-disconnected');
      }
    }
  }, [initialized, isConnected, walletClient, publicClient]);

  // Handler for scene-ready events
  useEffect(() => {
    const handleSceneReady = () => {
      if (isConnected && walletClient && publicClient) {
        EventBus.emit('wallet-connected', { walletClient, publicClient });
      } else {
        EventBus.emit('wallet-disconnected');
      }
    };
    
    // Handler for disconnect request from the game
    const handleGameDisconnectRequest = () => {
      disconnectWallet();
    };
    
    // Listen for both scene-ready and game-disconnect-request events
    EventBus.on('scene-ready', handleSceneReady);
    EventBus.on('game-disconnect-request', handleGameDisconnectRequest);
    
    return () => {
      EventBus.removeListener('scene-ready', handleSceneReady);
      EventBus.removeListener('game-disconnect-request', handleGameDisconnectRequest);
    };
  }, [isConnected, walletClient, publicClient, disconnectWallet]);

  const emitWalletState = () => {
    if (isConnected && walletClient && publicClient) {
      EventBus.emit('wallet-connected', { walletClient, publicClient });
    } else {
      EventBus.emit('wallet-disconnected');
    }
  };

  const value = {
    isConnected,
    walletClient,
    publicClient,
    emitWalletState,
    disconnectWallet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
