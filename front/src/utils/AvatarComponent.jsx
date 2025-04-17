import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from './avatarUtils';

/**
 * 头像组件，用于显示来自Twitter或GitHub的用户头像
 * @param {Object} props - 组件属性
 * @param {string} props.platform - 平台名称，支持 'twitter' 或 'github'
 * @param {string} props.username - 用户名
 * @param {number|string} props.size - 头像尺寸
 * @param {string} props.className - 额外的CSS类
 * @param {Object} props.style - 额外的内联样式
 * @returns {JSX.Element} 头像组件
 */
const Avatar = ({ platform, username, size, className = '', style = {}, ...props }) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (username) {
      setAvatarUrl(getAvatarUrl(platform, username, size));
      setIsError(false);
    }
  }, [platform, username, size]);

  const handleError = () => {
    // 如果加载失败，使用默认头像
    if (!isError) {
      setIsError(true);
      setAvatarUrl(getAvatarUrl('default', null));
    }
  };

  // 设置默认尺寸
  const pixelSize = typeof size === 'number' ? `${size}px` : size || '40px';
  
  // 合并样式
  const avatarStyle = {
    width: pixelSize,
    height: pixelSize,
    borderRadius: '50%',
    objectFit: 'cover',
    ...style
  };

  return (
    <img 
      src={avatarUrl} 
      alt={`${platform} avatar for ${username || 'unknown user'}`}
      className={`user-avatar ${className}`}
      style={avatarStyle}
      onError={handleError}
      {...props}
    />
  );
};

export default Avatar; 