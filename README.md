# Pixel Grid Chain

一个基于区块链的像素地球购买和定制平台。

体验地址：https://pixel-grid-chain.vercel.app/

## 项目概述

Pixel Grid Chain 是一个去中心化应用程序(dApp)，允许用户购买虚拟地球上的像素格子，并通过选择颜色和添加图片链接来自定义它们。这个项目结合了区块链技术与互动式网页界面，创建了一个独特的数字资产所有权体验。

## 技术栈

### 后端/智能合约
- **Solidity**: 用于编写智能合约
- **Foundry**: 智能合约开发框架
- **Monad 测试网**: 部署目标环境

### 前端
- **React**: 用户界面框架
- **Vite**: 构建工具
- **RainbowKit**: 钱包连接组件
- **Wagmi**: 以太坊 React Hooks
- **Viem**: 与以太坊交互的库
- **Styled Components**: CSS-in-JS 样式解决方案

## 功能特点

- 购买 10x10 网格中的像素格子
- 为每个格子选择自定义颜色
- 为格子添加自定义图片链接
- 支持钱包连接与区块链交互
- 实时显示所有已购买格子的状态

## 支持的钱包

- MetaMask
- Coinbase Wallet
- Rabby Wallet

## 安装与运行

### 智能合约部分

1. 克隆仓库
```bash
git clone https://github.com/yourusername/pixel-grid-chain.git
cd pixel-grid-chain
```

2. 安装依赖
```bash
forge install
```

3. 编译智能合约
```bash
forge build
```

4. 部署智能合约
```bash
forge script script/DeployBuyEarth.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

### 前端部分

1. 进入前端目录
```bash
cd front
```

2. 安装依赖
```bash
npm install
```

3. 开发模式运行
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 使用方法

1. 连接您的加密钱包 (MetaMask、Coinbase Wallet 或 Rabby Wallet)
2. 在网格上选择一个空闲的像素格子
3. 在弹出的表单中选择颜色并输入图片 URL
4. 确认支付 0.01 MON (Monad 测试网代币)
5. 交易确认后，您的像素格子将显示您选择的颜色和图片

## 项目结构

```
pixel-grid-chain/
├── src/                  # 智能合约源代码
│   └── BuyEarth.sol      # 主要合约文件
├── front/                # 前端应用
│   ├── src/              # React 源代码
│   ├── public/           # 静态资源
│   └── index.html        # HTML 入口
├── script/               # 部署脚本
├── test/                 # 合约测试
└── foundry.toml          # Foundry 配置
```

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

该项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 联系方式

项目维护者: [您的名字] - [您的邮箱]

项目链接: [https://github.com/yourusername/pixel-grid-chain](https://github.com/yourusername/pixel-grid-chain) 