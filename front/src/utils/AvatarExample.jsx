import React, { useState } from 'react';
import Avatar from './AvatarComponent';
import styled from 'styled-components';

const AvatarExample = () => {
  const [platform, setPlatform] = useState('github');
  const [username, setUsername] = useState('');
  const [size, setSize] = useState(80);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 表单提交时刷新组件状态，触发头像更新
    setPlatform(platform);
    setUsername(username);
    setSize(parseInt(size) || 80);
  };

  return (
    <ExampleContainer>
      <h2>头像获取示例</h2>
      
      <AvatarForm onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="platform">平台：</label>
          <select 
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="github">GitHub</option>
            <option value="twitter">Twitter</option>
          </select>
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="username">用户名：</label>
          <input 
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={`输入${platform === 'github' ? 'GitHub' : 'Twitter'}用户名`}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="size">尺寸：</label>
          <input 
            type="number"
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            min="20"
            max="200"
          />
        </FormGroup>
        
        <Button type="submit">获取头像</Button>
      </AvatarForm>
      
      <AvatarDisplay>
        {username && (
          <>
            <AvatarWrapper>
              <Avatar 
                platform={platform} 
                username={username} 
                size={size} 
              />
              <p>{platform === 'github' ? 'GitHub' : 'Twitter'} 头像</p>
            </AvatarWrapper>
            
            <AvatarDetails>
              <p>平台: <strong>{platform}</strong></p>
              <p>用户名: <strong>{username}</strong></p>
              <p>尺寸: <strong>{size}px</strong></p>
            </AvatarDetails>
          </>
        )}
        
        {!username && (
          <EmptyState>
            请输入用户名查看头像
          </EmptyState>
        )}
      </AvatarDisplay>
    </ExampleContainer>
  );
};

// 样式组件
const ExampleContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const AvatarForm = styled.form`
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  
  label {
    width: 80px;
    font-weight: bold;
    margin-right: 10px;
  }
  
  input, select {
    flex-grow: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const AvatarDisplay = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  p {
    margin-top: 10px;
    color: #666;
  }
`;

const AvatarDetails = styled.div`
  margin-left: 20px;
  
  p {
    margin: 5px 0;
  }
`;

const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: #999;
  font-style: italic;
  width: 100%;
`;

export default AvatarExample; 