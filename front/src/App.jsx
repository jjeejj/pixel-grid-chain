import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useContractRead, useContractWrite, useWaitForTransaction, useNetwork } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import styled from 'styled-components';
import './App.css';
import { getContractConfig } from './config';
import { getAvatarUrl, getAvatarFromUIAvatars, generateLetterAvatar, getAvatarUrlAsync } from './utils/avatarUtils';

// BuyEarth合约ABI
import contractABI from './abi.json'; // 正确导入ABI

// 从配置获取合约地址
const contractConfig = getContractConfig();
const contractAddress = contractConfig.address;

// 颜色映射 - 保留6个常用颜色
const colorMap = {
  1: "#FF0000", // 红色
  2: "#00FF00", // 绿色
  3: "#0000FF", // 蓝色
  4: "#FFFF00", // 黄色
  5: "#00FFFF", // 青色
  6: "#FFA500", // 橙色
  7: "custom"   // 自定义颜色
};

// 手印图标 - SVG路径
const handprintIcon = {
  path: "M12,1C5.925,1,1,5.925,1,12s4.925,11,11,11s11-4.925,11-11S18.075,1,12,1z M18.707,9.293l-7,7 C11.512,16.488,11.256,16.585,11,16.585s-0.512-0.098-0.707-0.293l-3-3c-0.391-0.391-0.391-1.023,0-1.414s1.023-0.391,1.414,0 L11,14.171l6.293-6.293c0.391-0.391,1.023-0.391,1.414,0S19.098,8.902,18.707,9.293z",
  viewBox: "0 0 24 24"
};

// 自定义Toast组件
const Toast = ({ message, isVisible, onClose, type = "info" }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <ToastContainer>
      <ToastContent type={type}>
        <ToastIcon>{type === "error" ? "⚠️" : "ℹ️"}</ToastIcon>
        <ToastMessage>{message}</ToastMessage>
        <ToastCloseButton onClick={onClose}>OK</ToastCloseButton>
      </ToastContent>
    </ToastContainer>
  );
};

const App = () => {
  const [selectedColor, setSelectedColor] = useState(1); // 默认选择红色
  const [selectedTile, setSelectedTile] = useState(null);
  const [earthData, setEarthData] = useState(Array(100).fill({ color: 0, price: 0, image_url: "" }));
  const [imageUrl, setImageUrl] = useState("");
  const [customColor, setCustomColor] = useState("#FF00FF"); // 默认自定义颜色为紫色
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork(); // 获取当前连接的链
  
  // 社交媒体用户名状态
  const [platform, setPlatform] = useState("github"); // 默认为GitHub
  const [username, setUsername] = useState("");
  // 预览状态
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  // Twitter头像获取状态
  const [twitterFetchFailed, setTwitterFetchFailed] = useState(false);
  
  // Toast状态
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info"
  });

  // 显示Toast消息
  const showToast = (message, type = "info") => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // 关闭Toast
  const closeToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  // 读取所有方块数据
  const { data: earthsData, refetch } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getEarths',
    watch: true,
  });

  // 购买方块
  const { write: buyEarthWrite, data: buyEarthData } = useContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'buyEarth',
    value: parseEther('0.01'),
  });

  // 等待交易完成
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: buyEarthData?.hash,
  });

  // 当交易成功时刷新数据
  useEffect(() => {
    if (isSuccess) {
      refetch();
      setSelectedTile(null);
      showToast("方块购买成功！", "info");
    }
  }, [isSuccess, refetch]);

  // 当合约数据更新时更新UI
  useEffect(() => {
    if (earthsData) {
      try {
        // 定义一个安全的方式来处理BigInt值的JSON序列化
        const safeStringify = (obj) => {
          return JSON.stringify(obj, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value
          );
        };
        
        console.log("从合约获取到的数据:", safeStringify(earthsData));
        
        // 检查一下第一个方块的数据
        if (earthsData[0]) {
          console.log("第一个方块数据:", {
            color: Number(earthsData[0].color),
            price: Number(earthsData[0].price),
            image_url: earthsData[0].image_url
          });
        }
        
        const earthDataArray = Array.from(earthsData).map(earth => ({
          color: Number(earth.color),
          price: Number(earth.price),
          image_url: earth.image_url
        }));
        
        console.log("处理后的方块数据:", earthDataArray[0]);
        setEarthData(earthDataArray);
      } catch (error) {
        console.error("处理合约数据时出错:", error);
        // 仍然尝试正常设置数据，即使日志有问题
        const earthDataArray = Array.from(earthsData).map(earth => ({
          color: Number(earth.color),
          price: Number(earth.price),
          image_url: earth.image_url
        }));
        setEarthData(earthDataArray);
      }
    }
  }, [earthsData]);

  // 处理图片URL输入变化
  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  // 处理社交媒体平台选择
  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
    // 当切换平台时重置预览
    setShowPreview(false);
    // 重置Twitter获取失败状态
    setTwitterFetchFailed(false);
  };

  // 处理社交媒体用户名输入
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    // 当用户名更改时重置预览
    setShowPreview(false);
  };

  // 重置预览
  const resetPreview = () => {
    setShowPreview(false);
    setPreviewUrl("");
  };

  // 获取头像URL
  const handleGetAvatarUrl = async () => {
    if (!username) {
      showToast("请输入用户名或URL", "error");
      return;
    }
    
    // 重置Twitter获取状态
    if (platform === 'twitter') {
      setTwitterFetchFailed(false);
    }
    
    try {
      let avatarUrl;
      
      // 处理自定义URL
      if (platform === "custom") {
        // 检查是否是有效的URL或Twitter图片路径
        if (username.includes('pbs.twimg.com/profile_images')) {
          // 这是Twitter头像URL
          avatarUrl = username;
          if (!username.startsWith('http')) {
            avatarUrl = `https://${username.replace(/^\/+/, '')}`;
          }
          showToast("检测到Twitter头像URL", "info");
        } else if (!isValidUrl(username)) {
          showToast("请输入有效的URL", "error");
          return;
        } else {
          avatarUrl = username;
        }
        setShowPreview(true);
      } else {
        // 显示加载中提示
        if (platform === 'twitter') {
          showToast("正在尝试获取Twitter头像，请稍候...", "info");
        } else {
          showToast(`正在获取${platform === 'github' ? 'GitHub' : 'X(Twitter)'} 头像...`, "info");
        }
        
        // 使用社交媒体API获取头像 - 异步方式
        try {
          // 使用异步方法获取头像
          avatarUrl = await getAvatarUrlAsync(platform, username);
          
          // 检查Twitter头像获取是否成功
          if (platform === 'twitter' && !avatarUrl) {
            setTwitterFetchFailed(true);
            showToast("获取Twitter头像失败，请尝试手动获取", "error");
            return;
          }
        } catch (error) {
          console.error("头像获取失败:", error);
          
          if (platform === 'twitter') {
            setTwitterFetchFailed(true);
            showToast("获取Twitter头像失败，请尝试手动获取", "error");
            return;
          }
          
          // 仅为非Twitter平台使用备选方案
          avatarUrl = getAvatarFromUIAvatars(username, platform);
        }
        
        // 如果头像获取失败，直接返回
        if (!avatarUrl) {
          if (platform === 'twitter') {
            setTwitterFetchFailed(true);
            showToast("获取Twitter头像失败，请尝试手动获取", "error");
          } else {
            showToast(`获取${platform === 'github' ? 'GitHub' : ''}头像失败`, "error");
          }
          return;
        }
        
        setShowPreview(true);
      }
      
      setPreviewUrl(avatarUrl);
      setImageUrl(avatarUrl);
      showToast(
        platform === "custom" 
          ? "已成功获取自定义图片" 
          : `已成功获取${platform === 'github' ? 'GitHub' : 'X(Twitter)'} 头像`, 
        "info"
      );
    } catch (error) {
      console.error("获取头像URL失败:", error);
      
      if (platform === 'twitter') {
        setTwitterFetchFailed(true);
        showToast("获取Twitter头像失败，请尝试手动获取", "error");
      } else {
        showToast("获取头像URL失败，请尝试其他平台或自定义URL", "error");
      }
      
      setShowPreview(false);
    }
  };
  
  // 验证URL是否有效
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // 处理方块点击
  const handleTileClick = (index) => {
    if (!isConnected) {
      showToast("请先连接钱包", "error");
      return;
    }

    console.log(`点击方块 #${index}:`, earthData[index]);

    // 检查方块是否已被购买
    if (earthData[index].color !== 0) {
      showToast("这个方块已经被购买了", "error");
      return;
    }

    setSelectedTile(index);
    showToast(`已选择方块 #${index}`, "info");
  };

  // 处理购买方块
  const handleBuyEarth = () => {
    if (selectedTile === null) {
      showToast("请先选择一个方块", "error");
      return;
    }

    // 移除图片URL的必填验证
    // 如果为空，使用空字符串
    const finalImageUrl = imageUrl.trim() || "";

    // 如果是自定义颜色，使用颜色值的哈希作为颜色ID
    const colorId = selectedColor === 7 ? 7 : selectedColor;

    buyEarthWrite({
      args: [selectedTile, colorId, finalImageUrl],
    });
  };

  // 处理自定义颜色变化
  const handleCustomColorChange = (e) => {
    setCustomColor(e.target.value);
    setSelectedColor(7); // 自动选择自定义颜色选项
  };

  // 渲染10x10网格
  const renderGrid = () => {
    return (
      <Grid>
        {Array(100).fill(0).map((_, index) => {
          const earth = earthData[index];
          // 处理自定义颜色的情况
          let color;
          if (earth.color === 7) {
            // 对于自定义颜色，使用紫色作为默认显示
            color = earth.color !== 0 ? "#FF00FF" : '#FFFFFF';
          } else {
            color = earth.color !== 0 ? colorMap[earth.color] : '#FFFFFF';
          }
          const isSelected = selectedTile === index;
          const isPurchased = earth.color !== 0;
          const hasImage = isPurchased && earth.image_url && earth.image_url.trim() !== "";

          return (
            <Tile
              key={index}
              color={color}
              $isSelected={isSelected}
              onClick={() => handleTileClick(index)}
              $purchased={isPurchased}
            >
              {hasImage && <TileImage src={earth.image_url} alt={`Tile ${index}`} />}
            </Tile>
          );
        })}
      </Grid>
    );
  };

  return (
    <Container>
      <Toast 
        message={toast.message} 
        isVisible={toast.visible} 
        onClose={closeToast} 
        type={toast.type} 
      />
      <Card>
        <Header>
          <Logo>
            <LogoIcon>🧩</LogoIcon>
            <LogoTextGroup>
              <LogoText>像素格子</LogoText>
              <LogoSubtitle>基于区块链技术的像素艺术画布</LogoSubtitle>
            </LogoTextGroup>
          </Logo>
          <WalletSection>
            {isConnected ? (
              <WalletConnected>
                <WalletAvatar>
                  <WalletAvatarText>{address?.slice(-2)}</WalletAvatarText>
                </WalletAvatar>
                <WalletInfo>
                  <WalletAddress>{`${address?.slice(0, 6)}...${address?.slice(-2)}`}</WalletAddress>
                  <NetworkInfo>
                    <ConnectionStatus $connected={isConnected}>
                      <StatusDot $connected={isConnected} />
                      已连接
                    </ConnectionStatus>
                    {chain && <NetworkName>{chain.name}</NetworkName>}
                  </NetworkInfo>
                </WalletInfo>
                <LogoutButton onClick={disconnect}>
                  <LogoutIcon>⏏️</LogoutIcon>
                  <span>退出</span>
                </LogoutButton>
              </WalletConnected>
            ) : (
              <WalletConnectContainer>
                <ConnectIcon>🔗</ConnectIcon>
                <ConnectButton />
              </WalletConnectContainer>
            )}
          </WalletSection>
        </Header>
        
        <MainContent>
          {renderGrid()}

          <ControlPanel>
            <ColorSelectionTitle>选择颜色</ColorSelectionTitle>
            <ColorSelection>
              <ColorPicker>
                {Object.entries(colorMap).map(([value, color]) => {
                  const intValue = parseInt(value);
                  // 自定义颜色选项特殊处理
                  if (color === "custom") {
                    return (
                      <CustomColorContainer 
                        key={value} 
                        $selected={selectedColor === intValue} 
                        onClick={() => setSelectedColor(intValue)}
                      >
                        <CustomColorLabel>自定义</CustomColorLabel>
                        <CustomColorInput
                          type="color"
                          value={customColor}
                          onChange={handleCustomColorChange}
                          title="点击选择自定义颜色"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedColor(intValue);
                          }}
                        />
                      </CustomColorContainer>
                    );
                  }
                  // 常规颜色选项
                  return (
                    <ColorOption
                      key={value}
                      color={color}
                      $selected={selectedColor === intValue}
                      onClick={() => setSelectedColor(intValue)}
                    >
                      {selectedColor === intValue && (
                        <HandprintIcon viewBox={handprintIcon.viewBox}>
                          <path d={handprintIcon.path} fill="#fff" />
                        </HandprintIcon>
                      )}
                    </ColorOption>
                  );
                })}
              </ColorPicker>
            </ColorSelection>

            <ConnectButtonWrapper>
              {isConnected ? (
                <PurchaseContainer>
                  <InputContainer>
                    <InputLabel>图片URL</InputLabel>
                    <Input
                      type="text"
                      placeholder="输入图片URL"
                      value={imageUrl}
                      onChange={handleImageUrlChange}
                    />
                  </InputContainer>

                  {/* 社交媒体头像获取部分 */}
                  <SocialAvatarContainer>
                    <SocialAvatarTitle>使用社交媒体头像</SocialAvatarTitle>
                    <SocialInputGroup>
                      <SocialSelect 
                        value={platform} 
                        onChange={handlePlatformChange}
                      >
                        <option value="github">GitHub</option>
                        <option value="twitter">X (Twitter)</option>
                        <option value="custom">自定义URL</option>
                      </SocialSelect>
                      <SocialInput
                        type="text"
                        placeholder={platform === 'custom' ? '输入图片URL' : `输入${platform === 'github' ? 'GitHub' : 'X(Twitter)'} 用户名`}
                        value={username}
                        onChange={handleUsernameChange}
                      />
                      <SocialButton onClick={handleGetAvatarUrl}>
                        获取头像
                      </SocialButton>
                    </SocialInputGroup>
                    
                    {/* 平台提示信息 - 只在获取失败时显示 */}
                    {platform === 'twitter' && twitterFetchFailed && (
                      <PlatformNote>
                        <TwitterTipHeading>🔍 获取失败，请尝试手动方法</TwitterTipHeading>
                        <TwitterTipText>
                          Twitter头像获取失败，请按照以下步骤手动获取:
                        </TwitterTipText>
                        <TwitterStepList>
                          <TwitterStep>
                            <span>1.</span> 
                            <TwitterLinkButton 
                              onClick={() => window.open(`https://x.com/${username}/photo`, '_blank')}
                              disabled={!username}
                            >
                              打开Twitter照片页面
                            </TwitterLinkButton>
                          </TwitterStep>
                          <TwitterStep>
                            <span>2.</span> 在照片页面上右键图片 → 选择"复制图片地址"
                          </TwitterStep>
                          <TwitterStep>
                            <span>3.</span> 
                            <TwitterActionButton
                              onClick={() => {
                                setPlatform('custom');
                                showToast('已切换到自定义URL模式，请粘贴Twitter图片地址', 'info');
                              }}
                            >
                              切换到自定义URL模式
                            </TwitterActionButton>
                          </TwitterStep>
                          <TwitterStep>
                            <span>4.</span> 粘贴刚才复制的图片地址 → 点击"获取头像"
                          </TwitterStep>
                          <TwitterTipHighlight>
                            图片地址应以 "pbs.twimg.com/profile_images" 开头
                          </TwitterTipHighlight>
                        </TwitterStepList>
                      </PlatformNote>
                    )}
                    
                    {/* 预览区域 */}
                    {showPreview && (
                      <PreviewContainer>
                        <PreviewHeader>
                          <PreviewTitle>预览</PreviewTitle>
                          <ClosePreviewButton onClick={resetPreview}>✕</ClosePreviewButton>
                        </PreviewHeader>
                        <ImagePreview>
                          <PreviewImage 
                            src={previewUrl} 
                            alt="头像预览"
                            onError={() => {
                              showToast("图片加载失败", "error");
                              setShowPreview(false);
                            }}
                          />
                        </ImagePreview>
                        <PreviewInfo>
                          <PreviewText>
                            {platform === 'custom' ? '自定义图片' : 
                              `${platform === 'github' ? 'GitHub' : 'X(Twitter)'} 头像: ${username}`}
                          </PreviewText>
                          <ApplyButton 
                            onClick={() => {
                              setImageUrl(previewUrl);
                              showToast("已应用到图片URL", "info");
                            }}
                          >
                            应用
                          </ApplyButton>
                        </PreviewInfo>
                      </PreviewContainer>
                    )}
                  </SocialAvatarContainer>
                  
                  <BuyButton
                    onClick={handleBuyEarth}
                    disabled={selectedTile === null || isLoading}
                  >
                    {isLoading ? '处理中...' : '购买方块'}
                  </BuyButton>
                </PurchaseContainer>
              ) : (
                <NotConnectedContainer>
                  <PlaceholderText>请先连接钱包以购买方块</PlaceholderText>
                  <ConnectButton />
                </NotConnectedContainer>
              )}
            </ConnectButtonWrapper>
          </ControlPanel>
        </MainContent>
      </Card>
    </Container>
  );
};

// 预览相关样式组件
const PreviewContainer = styled.div`
  margin-top: 15px;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e6f2ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const PreviewTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #2980b9;
`;

const ClosePreviewButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333;
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e6f2ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PreviewInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`;

const PreviewText = styled.div`
  font-size: 13px;
  color: #666;
  font-style: italic;
`;

const ApplyButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// 样式组件
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  padding-bottom: 30px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px 15px 0 0;
  border-bottom: 1px solid #e1e4e8;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  font-size: 28px;
`;

const LogoTextGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoText = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const LogoSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  font-weight: normal;
  letter-spacing: 0.3px;
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
`;

const WalletConnected = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(52, 152, 219, 0.08);
  border-radius: 12px;
  padding: 6px 10px;
  border: 1px solid rgba(52, 152, 219, 0.2);
  gap: 10px;
`;

const WalletAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #3498db, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const WalletAvatarText = styled.div`
  text-transform: uppercase;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const WalletAddress = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const NetworkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NetworkName = styled.div`
  font-size: 11px;
  color: #3498db;
  background-color: rgba(52, 152, 219, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
`;

const ConnectionStatus = styled.div`
  font-size: 11px;
  color: ${props => props.$connected ? '#27ae60' : '#e74c3c'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.$connected ? '#27ae60' : '#e74c3c'};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.2);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LogoutIcon = styled.span`
  font-size: 14px;
`;

const WalletConnectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(52, 152, 219, 0.08);
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid rgba(52, 152, 219, 0.2);
`;

const ConnectIcon = styled.span`
  font-size: 16px;
`;

const MainContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 15px;
  margin-top: 10px;
`;

const PlaceholderText = styled.div`
  color: #95a5a6;
  font-size: 14px;
  text-align: center;
  margin: 15px 0;
  font-style: italic;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 2px;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #e5e8ec;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 4px;
  background-color: #f9f9fb;
`;

const Tile = styled.div`
  background-color: ${props => props.color};
  border: ${props => props.$isSelected ? '2px solid #000' : '1px solid #ccc'};
  cursor: ${props => props.$purchased ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  position: relative;
  border-radius: 3px;
  box-shadow: ${props => props.$isSelected ? '0 0 8px rgba(0, 0, 0, 0.3)' : 'none'};

  &:hover {
    transform: ${props => props.$purchased ? 'none' : 'scale(1.05)'};
    box-shadow: ${props => props.$purchased ? 'none' : '0 0 5px rgba(0,0,0,0.2)'};
    z-index: 1;
  }
`;

const TileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.7;
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f9f9fb;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  margin-top: 5px;
`;

const ColorSelectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #333;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background-color: #3498db;
    border-radius: 2px;
  }
`;

const ColorSelection = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 450px;
  padding: 10px;
`;

const ColorOption = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s;
  border: 3px solid ${props => props.$selected ? '#333' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: scale(1.12);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

const HandprintIcon = styled.svg`
  width: 24px;
  height: 24px;
  position: absolute;
  opacity: 0.9;
`;

const ConnectButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const PurchaseContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
  align-items: center;
`;

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #3498db;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(52, 152, 219, 0.1);
    outline: none;
  }
`;

const CustomColorContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  width: 85px;
  height: 85px;
  border-radius: 10px;
  background-color: ${props => props.$selected ? '#f8f0ff' : '#ffffff'};
  border: ${props => props.$selected ? '2px solid #FF00FF' : '1px solid #ddd'};
  box-shadow: ${props => props.$selected ? '0 0 12px rgba(255, 0, 255, 0.5)' : '0 2px 5px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
  padding: 8px;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    background-color: #f8f8ff;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const CustomColorLabel = styled.div`
  font-size: 15px;
  color: #333;
  font-weight: bold;
  margin-top: 5px;
  text-align: center;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: "🎨";
    margin-right: 4px;
    font-size: 15px;
  }
`;

const CustomColorInput = styled.input`
  width: 65px;
  height: 40px;
  border: 2px solid #ccc;
  padding: 0;
  background: none;
  cursor: pointer;
  opacity: 1;
  transition: all 0.3s;
  z-index: 10;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  margin-top: 5px;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    border: 2px solid #FF00FF;
  }

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }
`;

const BuyButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 200px;
  box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
  margin-top: 5px;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(52, 152, 219, 0.25);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const NotConnectedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 10px 0;
`;

// Toast样式组件
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 320px;
  display: flex;
  justify-content: center;
`;

const ToastContent = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background-color: ${props => props.type === "error" ? "rgba(231, 76, 60, 0.9)" : "rgba(52, 152, 219, 0.9)"};
  color: white;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out forwards;
  width: 100%;
  backdrop-filter: blur(5px);
  border: 1px solid ${props => props.type === "error" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"};

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ToastIcon = styled.div`
  margin-right: 10px;
  font-size: 20px;
`;

const ToastMessage = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
`;

const ToastCloseButton = styled.button`
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.35);
  }
`;

// 社交媒体头像样式组件
const SocialAvatarContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  padding: 15px;
  background-color: #f7fbff;
  border-radius: 8px;
  border: 1px dashed #b8daff;
`;

const SocialAvatarTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #2980b9;
  margin-bottom: 12px;
  position: relative;
  padding-left: 22px;
  
  &:before {
    content: "👤";
    position: absolute;
    left: 0;
    top: -1px;
  }
`;

const SocialInputGroup = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const SocialSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  width: 120px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const SocialInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const SocialButton = styled.button`
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(46, 204, 113, 0.2);

  &:hover {
    background-color: #27ae60;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(46, 204, 113, 0.25);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(46, 204, 113, 0.2);
  }
`;

const PlatformNote = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  line-height: 1.5;
  background-color: #f8f9fa;
  border: 1px dashed #bbb;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
`;

const TwitterTipHeading = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2980b9;
  margin-bottom: 10px;
  width: 100%;
`;

const TwitterTipText = styled.div`
  font-size: 13px;
  color: #555;
  margin-bottom: 10px;
  line-height: 1.4;
  width: 100%;
  text-align: left;
`;

const TwitterStepList = styled.div`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TwitterStep = styled.div`
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  text-align: left;
  
  span {
    font-weight: bold;
    color: #2980b9;
    width: 18px;
    height: 18px;
    background-color: #e1f0fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }
`;

const TwitterLinkButton = styled.button`
  background: #1DA1F2;
  border: none;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background-color: #0c85d0;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }
  
  &::before {
    content: "🔗";
    margin-right: 4px;
    font-size: 12px;
  }
`;

const TwitterActionButton = styled.button`
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(46, 204, 113, 0.2);

  &:hover {
    background-color: #27ae60;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(46, 204, 113, 0.25);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(46, 204, 113, 0.2);
  }
`;

const TwitterTipHighlight = styled.div`
  background-color: #f0f7fb;
  border-left: 4px solid #3498db;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #2980b9;
  width: 100%;
  text-align: left;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  &:before {
    content: "💡";
    margin-right: 5px;
  }
`;

export default App;