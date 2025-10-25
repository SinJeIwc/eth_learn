import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';

export const xsollazkSepolia: Chain = {
  id: 37111,
  name: 'Xsolla ZK Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc-sepolia.xsollazk.com'] },
    public: { http: ['https://rpc-sepolia.xsollazk.com'] },
  },
  blockExplorers: {
    default: { 
      name: 'Explorer', 
      url: 'https://explorer-sepolia.xsollazk.com' 
    },
  },
  testnet: true,
};

export const statusSepolia: Chain = {
  id: 11155111,
  name: 'Status Network Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.status.network'] },
    public: { http: ['https://sepolia.status.network'] },
  },
  blockExplorers: {
    default: { 
      name: 'Explorer', 
      url: 'https://sepolia.status.network' 
    },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'ETH Farm Game',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from walletconnect.com
  chains: [xsollazkSepolia, statusSepolia],
  ssr: true,
});
