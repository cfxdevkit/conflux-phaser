import { createContext } from 'react';

// Define the wallet context type
export interface WalletContextType {
  isConnected: boolean;
  walletClient: unknown | undefined;
  publicClient: unknown | undefined;
  emitWalletState: () => void;
  disconnectWallet: () => void;
}

// Create the context
export const WalletContext = createContext<WalletContextType | undefined>(undefined);
