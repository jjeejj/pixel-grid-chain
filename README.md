# PixelGrid - 区块链像素艺术平台

PixelGrid是一个基于区块链的像素艺术创作平台，让用户可以购买、自定义并拥有网格中的像素方块。每个方块都可以设置颜色和上传图片，所有权记录在区块链上，确保数字资产的真实性和永久性。

## 项目特点

- **区块链所有权**: 每个像素方块的所有权通过智能合约记录在区块链上
- **个性化定制**: 为您的方块设置独特颜色和上传个性化图片
- **社交媒体集成**: 支持Twitter和GitHub头像获取
- **用户友好界面**: 直观的界面设计，轻松浏览和交互
- **响应式设计**: 完美适配桌面和移动设备

## 技术栈

| 类别 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React | UI构建与渲染 |
| 状态管理 | React Hooks | 管理组件状态 |
| 样式处理 | Styled Components | 组件级CSS样式 |
| Web3连接 | wagmi、RainbowKit | 简化钱包连接流程 |
| 合约交互 | viem | 处理智能合约调用 |
| 区块链网络 | Monad | 存储数字资产 |
| 合约开发 | Foundry | 智能合约开发框架 |

## 安装与运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/jjeejj/pixel-grid-chain.git
   cd pixel-grid-chain
   ```

2. **安装依赖**
   ```bash
   # 安装前端依赖
   cd front
   npm install
   
   # 安装Foundry（如果尚未安装）
   cd ../src
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **启动开发服务器**
   ```bash
   # 在front目录下
   npm run dev
   ```

4. **部署智能合约(可选)**
   ```bash
   # src
   forge build
   forge script script/BuyEarth.s.sol --rpc-url <your-network-rpc> --private-key <your-private-key> --broadcast
   ```

## 使用指南

1. **连接钱包**: 点击右上角的"连接钱包"按钮，选择您的Web3钱包
2. **浏览像素网格**: 在主界面查看10x10的像素网格，已购买的方块会显示颜色或图片
3. **购买方块**: 点击未购买的方块，选择颜色或上传图片后完成购买
4. **管理方块**: 已购买的方块可以随时更新颜色和图片

## 贡献指南

欢迎为PixelGrid项目做出贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

## 许可证

本项目采用MIT许可证 - 详情请查看 [LICENSE](LICENSE) 文件 