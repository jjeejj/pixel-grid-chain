import { hardhat } from 'wagmi/chains';
// 网络配置
export const MONAD_TESTNET = {
    id: 10143,
    name: 'Monad Test',
    network: 'monad-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Monad',
        symbol: 'MON',
    },
    rpcUrls: {
        default: {
            http: ['https://testnet-rpc.monad.xyz'],
        },
        public: {
            http: ['https://testnet-rpc.monad.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Monad Explorer',
            url: 'https://testnet.monadexplorer.com'
        },
    },
    testnet: true,
};

// 创建Anvil本地链配置
export const ANVIL_CHAIN = {
    ...hardhat,
    name: 'Anvil',
    network: 'anvil',
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545'],
        },
        public: {
            http: ['http://127.0.0.1:8545'],
        },
    },
};

// 合约地址配置
export const CONTRACT_CONFIG = {
    // 本地开发环境
    development: {
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat默认部署地址
        chainId: 31337, // Hardhat本地网络ID
    },
    // 测试网环境
    production: {
        address: "0x8CA12E212F5c6668C0A93914997e9D8F968E67de", // 替换为实际在Monad测试网上的合约地址
        chainId: 10143, // Monad测试网ID
    }
};

// 判断当前环境
export const isProduction = () => {
    return process.env.NODE_ENV === 'production';
};

// 获取当前环境的合约配置
export const getContractConfig = () => {
    return isProduction() ? CONTRACT_CONFIG.production : CONTRACT_CONFIG.development;
}; 