// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'collectTweet') {
    try {
      const tweetData = extractTweetData();
      sendResponse({ success: true, data: tweetData });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

// 页面加载完成后注入收藏按钮
function injectCollectButtons() {
  // 查找所有推文的操作栏
  const tweetActionBars = document.querySelectorAll('[data-testid="tweet"] [role="group"]');

  tweetActionBars.forEach((actionBar, index) => {
    // 检查是否已经添加了收藏按钮
    if (actionBar.querySelector('.twitter-collect-btn')) {
      return;
    }

    // 创建收藏按钮
    const collectBtn = document.createElement('div');
    collectBtn.className = 'twitter-collect-btn';
    collectBtn.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0px; border-radius: 9999px; transition: all 0.2s; color: rgb(83, 100, 113); width: 34.75px; height: 34.75px;" 
           onmouseover="this.style.backgroundColor='rgba(249, 24, 128, 0.1)'; this.style.color='rgb(249, 24, 128)'"
           onmouseout="this.style.backgroundColor='transparent'; this.style.color='rgb(83, 100, 113)'">
        <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
          <path d="M7.501 19.917L7.471 19.99C5.13 19.81 3.29 17.928 3.29 15.66V8.04C3.29 5.77 5.13 3.888 7.47 3.708L7.501 3.781C9.841 3.961 11.681 5.843 11.681 8.111V15.731C11.681 17.999 9.841 19.881 7.501 19.917ZM20.711 8.04V15.66C20.711 17.928 18.871 19.81 16.531 19.99L16.501 19.917C14.161 19.881 12.321 17.999 12.321 15.731V8.111C12.321 5.843 14.161 3.961 16.501 3.781L16.531 3.708C18.871 3.888 20.711 5.77 20.711 8.04Z"/>
        </svg>
      </div>
    `;

    // 添加点击事件
    collectBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // 找到对应的推文元素
        const tweetElement = actionBar.closest('[data-testid="tweet"]');
        if (!tweetElement) return;

        // 提取推文数据
        const tweetData = extractTweetDataFromElement(tweetElement);

        // 弹出分组选择浮层
        showGroupSelector(tweetData, collectBtn);
      } catch (error) {
        console.error('提取推文数据失败:', error);
        showToast('提取推文数据失败', 'error');
      }
    });

    // 将按钮添加到操作栏，确保正确的间距
    actionBar.appendChild(collectBtn);

    // 调整按钮容器的样式以确保与其他按钮对齐
    collectBtn.style.marginLeft = '0px';
    collectBtn.style.display = 'flex';
    collectBtn.style.alignItems = 'center';
  });
}

// 从特定推文元素提取数据
function extractTweetDataFromElement(tweetElement) {
  // 提取推文内容
  const contentSelectors = [
    '[data-testid="tweetText"]',
    'div[lang]'
  ];

  let content = '';
  for (const selector of contentSelectors) {
    const element = tweetElement.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      if (text && text.length > 5) {
        content = text;
        break;
      }
    }
  }

  // 提取图片
  const images = [];
  const imageElements = tweetElement.querySelectorAll('img[src*="pbs.twimg.com"], img[src*="abs.twimg.com"]');
  imageElements.forEach(img => {
    if (img.src &&
      (img.src.includes('pbs.twimg.com') || img.src.includes('abs.twimg.com')) &&
      !img.src.includes('profile') &&
      !img.src.includes('avatar')) {
      let highResUrl = img.src;
      highResUrl = highResUrl.replace('_normal', '');
      highResUrl = highResUrl.replace('_small', '');
      highResUrl = highResUrl.replace('&name=small', '');

      if (!images.includes(highResUrl)) {
        images.push(highResUrl);
      }
    }
  });

  // 提取时间
  const timeElement = tweetElement.querySelector('time[datetime]');
  const tweetCreatedAt = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();

  // 构建推文URL - 从推文内的链接提取，而非 window.location
  let tweetUrl = '';
  const statusLink = tweetElement.querySelector('a[href*="/status/"]');
  if (statusLink) {
    const href = statusLink.getAttribute('href');
    tweetUrl = href.startsWith('http') ? href : `https://x.com${href}`;
  }
  if (!tweetUrl) {
    tweetUrl = window.location.href;
  }

  // 提取互动指标
  const metrics = extractEngagementMetrics(tweetElement);

  return {
    content: content.trim(),
    images: images,
    tweet_created_at: tweetCreatedAt,
    tweet_url: tweetUrl,
    ...metrics
  };
}

// 监听页面变化，动态注入按钮
const observer = new MutationObserver((mutations) => {
  let shouldInject = false;

  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查是否有新的推文添加
          if (node.querySelector && (
            node.querySelector('[data-testid="tweet"]') ||
            node.matches('[data-testid="tweet"]')
          )) {
            shouldInject = true;
          }
        }
      });
    }
  });

  if (shouldInject) {
    setTimeout(injectCollectButtons, 500); // 延迟执行确保DOM完全加载
  }
});

// 开始观察
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Toast 提示功能
function showToast(message, type = 'info') {
  // 移除已存在的toast
  const existingToast = document.querySelector('.twitter-collect-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'twitter-collect-toast';

  const bgColor = type === 'success' ? 'rgb(0, 186, 124)' :
    type === 'error' ? 'rgb(244, 33, 46)' :
      'rgb(29, 161, 242)';

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${bgColor};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    max-width: 300px;
    word-wrap: break-word;
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  // 动画显示
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);

  // 3秒后自动消失
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// 页面加载完成后立即注入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(injectCollectButtons, 1000);
  });
} else {
  setTimeout(injectCollectButtons, 1000);
}

function extractTweetData() {
  // 查找推文容器 - 更精确的选择器
  const tweetSelectors = [
    'article[data-testid="tweet"]',
    '[data-testid="tweet"]',
    'article[role="article"]',
    '.css-1dbjc4n.r-1loqt21.r-18u37iz.r-1ny4l3l'
  ];

  let tweetElement = null;
  for (const selector of tweetSelectors) {
    const elements = document.querySelectorAll(selector);
    // 选择最接近当前视口的推文
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        tweetElement = element;
        break;
      }
    }
    if (tweetElement) break;
  }

  if (!tweetElement) {
    throw new Error('未找到推文内容，请确保页面中有推文');
  }



  // 提取推文内容 - 更精确的选择器
  const contentSelectors = [
    '[data-testid="tweetText"]',
    '[data-testid="tweet"] span',
    'div[lang]'
  ];

  let content = '';
  for (const selector of contentSelectors) {
    const element = tweetElement.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      if (text && text.length > 10 && text.length < 1000) {
        content = text;
        break;
      }
    }
  }

  // 提取图片 - 更精确的选择器
  const images = [];
  const imageSelectors = [
    'img[src*="pbs.twimg.com"]',
    'img[src*="abs.twimg.com"]',
    'img[alt*="Image"]'
  ];

  for (const selector of imageSelectors) {
    const imageElements = tweetElement.querySelectorAll(selector);
    imageElements.forEach(img => {
      if (img.src &&
        (img.src.includes('pbs.twimg.com') || img.src.includes('abs.twimg.com')) &&
        !img.src.includes('profile') &&
        !img.src.includes('avatar')) {
        // 转换为高质量图片URL
        let highResUrl = img.src;
        highResUrl = highResUrl.replace('_normal', '');
        highResUrl = highResUrl.replace('_small', '');
        highResUrl = highResUrl.replace('_mini', '');
        highResUrl = highResUrl.replace('&name=small', '');
        highResUrl = highResUrl.replace('&name=normal', '');

        if (!images.includes(highResUrl)) {
          images.push(highResUrl);
        }
      }
    });
  }



  // 提取推文发布时间 - 更精确的选择器
  const timeSelectors = [
    'time[datetime]',
    '[data-testid="tweet"] time',
    'a[href*="/status/"] time'
  ];

  let tweetCreatedAt = new Date().toISOString();
  for (const selector of timeSelectors) {
    const element = tweetElement.querySelector(selector);
    if (element && element.getAttribute('datetime')) {
      tweetCreatedAt = element.getAttribute('datetime');
      break;
    }
  }

  // 构建推文URL - 从推文内的链接提取
  let tweetUrl = '';
  const statusLink2 = tweetElement.querySelector('a[href*="/status/"]');
  if (statusLink2) {
    const href = statusLink2.getAttribute('href');
    tweetUrl = href.startsWith('http') ? href : `https://x.com${href}`;
  }
  if (!tweetUrl) {
    tweetUrl = window.location.href;
  }
  if (!content || content.length < 5) {
    throw new Error('无法提取推文内容，请确保页面中有推文文本');
  }

  // 提取互动指标
  const metrics = extractEngagementMetrics(tweetElement);

  console.log('提取的数据:', {
    content: content.substring(0, 100) + '...',
    images: images.length,
    tweet_created_at: tweetCreatedAt,
    tweet_url: tweetUrl,
    ...metrics
  });

  return {
    content: content.trim(),
    images: images,
    tweet_created_at: tweetCreatedAt,
    tweet_url: tweetUrl,
    ...metrics
  };
}

// 提取互动指标（评论、转发、点赞、观看量）
function extractEngagementMetrics(tweetElement) {
  const metrics = {
    comment_count: 0,
    retweet_count: 0,
    like_count: 0,
    view_count: 0
  };

  try {
    // 提取评论数
    const replyButton = tweetElement.querySelector('[data-testid="reply"]');
    if (replyButton) {
      const replyText = replyButton.getAttribute('aria-label') || '';
      const replyMatch = replyText.match(/(\d+)/);
      if (replyMatch) {
        metrics.comment_count = parseInt(replyMatch[1].replace(/,/g, ''), 10) || 0;
      }
    }

    // 提取转发数
    const retweetButton = tweetElement.querySelector('[data-testid="retweet"]');
    if (retweetButton) {
      const retweetText = retweetButton.getAttribute('aria-label') || '';
      const retweetMatch = retweetText.match(/(\d+)/);
      if (retweetMatch) {
        metrics.retweet_count = parseInt(retweetMatch[1].replace(/,/g, ''), 10) || 0;
      }
    }

    // 提取点赞数
    const likeButton = tweetElement.querySelector('[data-testid="like"]');
    if (likeButton) {
      const likeText = likeButton.getAttribute('aria-label') || '';
      const likeMatch = likeText.match(/(\d+)/);
      if (likeMatch) {
        metrics.like_count = parseInt(likeMatch[1].replace(/,/g, ''), 10) || 0;
      }
    }

    // 提取观看量 - 使用多种方法
    // Method 1: 在整个推文文本中搜索 "XXK Views" 模式
    let viewFound = false;
    const allText = tweetElement.innerText || tweetElement.textContent || '';
    const viewPatterns = [
      /(\d+\.?\d*)\s*([KMB])\s*Views?/i,  // "40K Views"
      /(\d+\.?\d*)\s*([KMB])\s*次查看/i,   // Chinese
      /(\d+,?\d*)\s*Views?/i,              // "40,000 Views"
    ];

    for (const pattern of viewPatterns) {
      const match = allText.match(pattern);
      if (match) {
        let count = parseFloat(match[1].replace(/,/g, ''));
        const suffix = match[2] ? match[2].toUpperCase() : '';
        if (suffix === 'K') count *= 1000;
        else if (suffix === 'M') count *= 1000000;
        else if (suffix === 'B') count *= 1000000000;
        metrics.view_count = Math.floor(count);
        viewFound = true;
        break;
      }
    }

    // Method 2: 查找 analytics 链接（备用方法）
    if (!viewFound) {
      const viewElements = tweetElement.querySelectorAll('a[href*="/analytics"]');
      if (viewElements.length > 0) {
        const viewText = viewElements[0].textContent || '';
        const viewMatch = viewText.match(/([\d.,]+)\s*([KMB]?)/i);
        if (viewMatch) {
          let count = parseFloat(viewMatch[1].replace(/,/g, ''));
          const suffix = viewMatch[2] ? viewMatch[2].toUpperCase() : '';
          if (suffix === 'K') count *= 1000;
          else if (suffix === 'M') count *= 1000000;
          else if (suffix === 'B') count *= 1000000000;
          metrics.view_count = Math.floor(count);
        }
      }
    }
  } catch (error) {
    console.warn('提取互动指标时出错:', error);
  }

  return metrics;
}

const API_BASE = 'https://eric-base-pi.vercel.app';

// 分组选择浮层
async function showGroupSelector(tweetData, collectBtn) {
  // 移除已有浮层
  const existing = document.querySelector('.tweet-group-selector');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'tweet-group-selector';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6); z-index: 10001;
    display: flex; align-items: center; justify-content: center;
  `;

  const panel = document.createElement('div');
  panel.style.cssText = `
    background: #1a1a2e; color: #e0e0e0; border-radius: 16px;
    width: 380px; max-height: 500px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    display: flex; flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  // 头部
  const header = document.createElement('div');
  header.style.cssText = 'padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px; font-weight: 600;';
  header.textContent = '选择主题分组';
  panel.appendChild(header);

  // 加载中
  const body = document.createElement('div');
  body.style.cssText = 'flex: 1; overflow-y: auto; padding: 8px 12px;';
  body.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">加载中...</div>';
  panel.appendChild(body);

  // 底部按钮
  const footer = document.createElement('div');
  footer.style.cssText = 'padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 8px;';

  const newGroupBtn = document.createElement('button');
  newGroupBtn.textContent = '＋ 新建主题';
  newGroupBtn.style.cssText = `
    flex: 1; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
    background: transparent; color: #e0e0e0; cursor: pointer; font-size: 13px;
    transition: background 0.2s;
  `;
  newGroupBtn.onmouseover = () => newGroupBtn.style.background = 'rgba(255,255,255,0.05)';
  newGroupBtn.onmouseout = () => newGroupBtn.style.background = 'transparent';

  const skipBtn = document.createElement('button');
  skipBtn.textContent = '不分组，直接收藏';
  skipBtn.style.cssText = `
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    background: rgb(249, 24, 128); color: white; cursor: pointer; font-size: 13px;
    font-weight: 500; transition: opacity 0.2s;
  `;
  skipBtn.onmouseover = () => skipBtn.style.opacity = '0.85';
  skipBtn.onmouseout = () => skipBtn.style.opacity = '1';

  footer.appendChild(newGroupBtn);
  footer.appendChild(skipBtn);
  panel.appendChild(footer);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // 点击遮罩关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Esc 关闭
  const escHandler = (e) => {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  // 不分组直接收藏
  skipBtn.addEventListener('click', async () => {
    overlay.remove();
    await submitTweet(tweetData, null, collectBtn);
  });

  // 新建主题
  newGroupBtn.addEventListener('click', async () => {
    overlay.remove();
    await submitTweet(tweetData, '__new__', collectBtn);
  });

  // 加载分组列表
  try {
    const res = await fetch(`${API_BASE}/api/groups`);
    if (!res.ok) throw new Error('加载分组失败');
    const result = await res.json();
    const groups = result.data || [];

    if (groups.length === 0) {
      body.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">暂无分组，点击下方新建</div>';
      return;
    }

    body.innerHTML = '';
    for (const group of groups) {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex; align-items: center; gap: 12px; padding: 10px 8px;
        border-radius: 10px; cursor: pointer; transition: background 0.15s;
      `;
      item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.06)';
      item.onmouseout = () => item.style.background = 'transparent';

      const thumb = document.createElement('img');
      thumb.src = group.cover_image;
      thumb.style.cssText = 'width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0;';

      const info = document.createElement('div');
      info.style.cssText = 'flex: 1; min-width: 0;';
      info.innerHTML = `
        <div style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${group.title || '未命名主题'}
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 2px;">${group.post_count || 0} 条推文</div>
      `;

      item.appendChild(thumb);
      item.appendChild(info);
      body.appendChild(item);

      item.addEventListener('click', async () => {
        overlay.remove();
        await submitTweet(tweetData, group.id, collectBtn);
      });
    }
  } catch (err) {
    body.innerHTML = `<div style="text-align:center;padding:20px;color:#f44;">加载分组失败: ${err.message}</div>`;
  }
}

// 提交推文
async function submitTweet(tweetData, groupChoice, collectBtn) {
  try {
    const payload = { ...tweetData };

    if (groupChoice === '__new__') {
      payload.new_group = true;
    } else if (groupChoice) {
      payload.group_id = groupChoice;
    }

    console.log('发送推文数据:', payload);
    const response = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const originalHTML = collectBtn.innerHTML;
      collectBtn.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0px; border-radius: 9999px; color: rgb(249, 24, 128); width: 34.75px; height: 34.75px; background-color: rgba(249, 24, 128, 0.1);">
          <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
          </svg>
        </div>
      `;

      const msg = groupChoice === '__new__' ? '已收藏并新建主题！' :
                  groupChoice ? '已收藏到主题！' : '推文收藏成功！';
      showToast(msg, 'success');

      setTimeout(() => { collectBtn.innerHTML = originalHTML; }, 2000);
    } else {
      throw new Error('保存失败');
    }
  } catch (error) {
    console.error('收藏失败:', error);
    let errorMessage = '收藏失败';
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = '网络连接失败，请检查网络或稍后重试';
    } else if (error.message) {
      errorMessage = `收藏失败: ${error.message}`;
    }
    showToast(errorMessage, 'error');
  }
} 