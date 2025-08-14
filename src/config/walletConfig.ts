import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  http, 
  createConfig
} from 'wagmi';
import { confluxESpace, confluxESpaceTestnet } from 'wagmi/chains';

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [confluxESpace, confluxESpaceTestnet],
  transports: {
    [confluxESpaceTestnet.id]: http(),
    [confluxESpace.id]: http(),
  },
});

// Create rainbowkit config
export const config = getDefaultConfig({
  appName: 'Conflux Phaser RainbowKit Demo',
  projectId: 'YOUR_PROJECT_ID', // Get a project ID at https://cloud.walletconnect.com
  chains: [confluxESpace, confluxESpaceTestnet],
  ssr: true,
});
