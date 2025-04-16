import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// RainbowKit和Wagmi配置
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  connectorsForWallets,
  createAuthenticationAdapter,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { MONAD_TESTNET, ANVIL_CHAIN, isProduction } from './config';

// 根据环境选择链
const chains = isProduction() 
  ? [MONAD_TESTNET] // 生产环境使用Monad Testnet
  : [ANVIL_CHAIN];   // 开发环境使用Anvil本地链

// 配置链和提供者 - 增加多个提供者以提高可靠性
const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [
    // 直接连接到本地节点
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
    publicProvider(),
  ]
);

// 使用适合本地开发的钱包配置
const projectId = "DEMO_PROJECT"; // 本地开发用的虚拟ID

// 配置可用的钱包
const availableWallets = [
  injectedWallet({ chains }),
  metaMaskWallet({ chains, projectId }),
  coinbaseWallet({ chains, appName: '像素格子' }),
];

const connectors = connectorsForWallets([
  {
    groupName: '推荐钱包',
    wallets: availableWallets,
  },
]);

// 创建Wagmi配置
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// 添加开发模式提示
console.log('应用正在连接到:', chains[0].name);
console.log('RPC URL:', chains[0].rpcUrls.default.http[0]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains} 
        modalSize="compact"
        theme={lightTheme({
          accentColor: '#3498db',
          borderRadius: 'medium',
        })}
      >
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
);