/**
 * 获取Twitter用户头像的URL
 * @param {string} username - Twitter用户名，不包含@符号
 * @param {string} size - 头像尺寸，默认为'normal'，可选值：'normal', 'bigger', 'mini', 'original'
 * @returns {string} 头像URL
 */
export const getTwitterAvatarUrl = (username, size = 'normal') => {
    // 支持直接传入完整URL
    if (username.startsWith('http')) {
        return username;
    }

    // 支持直接传入profile_images路径
    if (username.includes('profile_images')) {
        if (username.startsWith('/')) {
            username = username.substring(1);
        }
        return `https://pbs.twimg.com/profile_images/${username.replace(/^profile_images\//, '')}`;
    }

    // 标准尝试 - 实际上Twitter头像需要用户ID，此方法通常不可靠
    // 建议使用fetchTwitterAvatarFromProfilePage方法
    return null;
};

/**
 * 尝试访问Twitter用户资料页面并解析头像URL
 * @param {string} username - Twitter用户名，不包含@符号
 * @returns {Promise<string>} 头像URL
 */
export const fetchTwitterAvatarFromProfilePage = async (username) => {
    // 可用的CORS代理服务
    const corsProxyUrl = (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

    try {
        // Twitter照片页面URL
        const targetUrl = `https://x.com/${encodeURIComponent(username)}/photo`;
        console.log("目标Twitter照片页面:", targetUrl);

        // 使用CORS代理
        const proxiedUrl = corsProxyUrl(targetUrl);
        console.log("通过CORS代理访问:", proxiedUrl);

        const response = await fetch(proxiedUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        const html = await response.text();
        console.log("成功获取页面HTML，长度:", html.length);

        // 解析HTML获取头像URL
        const imgRegex = /<img[^>]+src=["'](https:\/\/pbs\.twimg\.com\/profile_images\/[^"']+)["'][^>]*>/i;
        const match = html.match(imgRegex);

        if (match && match[1]) {
            console.log("成功从Twitter页面提取图片URL:", match[1]);
            return match[1];
        } else {
            // 尝试另一种匹配模式 - 查找所有图片，过滤出头像URL
            console.log("未找到精确匹配，尝试查找所有图片...");
            const allImgsRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            let imgMatch;

            while ((imgMatch = allImgsRegex.exec(html)) !== null) {
                if (imgMatch[1].includes('pbs.twimg.com/profile_images')) {
                    console.log("通过第二种方法找到Twitter头像:", imgMatch[1]);
                    return imgMatch[1];
                }
            }

            console.warn('无法在Twitter用户资料页找到头像');
            return null;
        }
    } catch (error) {
        console.error('获取Twitter资料页失败:', error);
        return null;
    }
};

/**
 * 获取社交媒体用户头像的备选方法
 * @param {string} username - 用户名
 * @param {string} platform - 平台名称: 'twitter', 'github' 等
 * @returns {string} 头像URL
 */
export const getAvatarFromUIAvatars = (username, platform = '') => {
    // 使用UIAvatars生成与用户名相关的头像
    // 这是一个备选方案，与用户真实头像无关，但至少能确保显示
    const name = username || 'User';
    const bgColor = platform === 'twitter' ? '1DA1F2' : (platform === 'github' ? '181717' : '4A90E2');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&bold=true&size=200`;
};

/**
 * 备用的字母头像生成器
 * @param {string} username - 用户名
 * @returns {string} 头像数据URL
 */
export const generateLetterAvatar = (username) => {
    // 提取用户名的首字母
    const firstLetter = (username || 'U').charAt(0).toUpperCase();

    // 生成一个随机但稳定的颜色（基于用户名）
    const hash = username.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    const bgColor = `hsl(${hue}, 70%, 60%)`;

    // 创建Canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // 绘制圆形背景
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.fill();

    // 绘制文字
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstLetter, 100, 100);

    // 转换为数据URL
    return canvas.toDataURL('image/png');
};

/**
 * 获取GitHub用户头像的URL
 * @param {string} username - GitHub用户名
 * @param {number} size - 头像像素尺寸，默认为200，GitHub支持的范围是1-2048
 * @returns {string} 头像URL
 */
export const getGithubAvatarUrl = (username, size = 200) => {
    // 确保尺寸在合理范围内
    const validSize = Math.max(1, Math.min(2048, Math.floor(size)));

    // 使用GitHub API获取用户头像
    return `https://github.com/${encodeURIComponent(username)}.png?size=${validSize}`;
};

/**
 * 通用函数：根据平台和用户名获取头像URL
 * @param {string} platform - 平台名称，支持 'twitter' 或 'github'
 * @param {string} username - 用户名
 * @param {number|string} size - 头像尺寸，根据平台有不同的默认值和含义
 * @returns {string} 头像URL，如果平台不支持则返回默认头像
 */
export const getAvatarUrl = (platform, username, size) => {
    if (!username) {
        return getDefaultAvatarUrl();
    }

    // Twitter平台推荐使用异步方法getAvatarUrlAsync
    if (platform.toLowerCase() === 'twitter') {
        const url = getTwitterAvatarUrl(username, size);
        return url || getDefaultAvatarUrl();
    }

    // GitHub API 相对稳定，直接使用
    if (platform.toLowerCase() === 'github') {
        return getGithubAvatarUrl(username, size);
    }

    // 默认使用备选方案
    return getAvatarFromUIAvatars(username, platform);
};

/**
 * 获取默认头像URL
 * @returns {string} 默认头像URL
 */
export const getDefaultAvatarUrl = () => {
    // 使用一个通用的占位头像服务
    return 'https://api.dicebear.com/7.x/identicon/svg';
};

/**
 * 异步获取头像URL (可以处理需要网络请求的情况)
 * @param {string} platform - 平台名称，支持 'twitter' 或 'github'
 * @param {string} username - 用户名
 * @param {number|string} size - 头像尺寸
 * @returns {Promise<string|null>} 头像URL Promise，失败时返回null
 */
export const getAvatarUrlAsync = async (platform, username, size) => {
    if (!username) {
        return getDefaultAvatarUrl();
    }

    // Twitter需要特殊处理
    if (platform.toLowerCase() === 'twitter') {
        try {
            // 直接使用网页抓取方法获取Twitter头像
            console.log("正在尝试从Twitter页面获取头像...");
            const profileUrl = await fetchTwitterAvatarFromProfilePage(username);

            if (profileUrl) {
                console.log("成功获取到Twitter头像:", profileUrl);
                return profileUrl;
            }

            console.warn("从Twitter页面获取头像失败");
            return null;
        } catch (error) {
            console.warn('Twitter头像获取失败:', error);
            return null;
        }
    }

    // GitHub直接使用同步方法，它很可靠
    if (platform.toLowerCase() === 'github') {
        return getGithubAvatarUrl(username, size);
    }

    // 默认使用备选方案
    return getAvatarFromUIAvatars(username, platform);
}; 