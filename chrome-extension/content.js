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
        
        // 发送到API
        const response = await fetch('http://localhost:3000/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tweetData)
        });

        if (response.ok) {
          // 成功反馈
          const originalHTML = collectBtn.innerHTML;
          collectBtn.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0px; border-radius: 9999px; color: rgb(249, 24, 128); width: 34.75px; height: 34.75px; background-color: rgba(249, 24, 128, 0.1);">
              <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
            </div>
          `;
          
          showToast('推文收藏成功！', 'success');
          
          // 2秒后恢复原状
          setTimeout(() => {
            collectBtn.innerHTML = originalHTML;
          }, 2000);
        } else {
          throw new Error('保存失败');
        }
      } catch (error) {
        console.error('收藏失败:', error);
        // 错误反馈
        const originalHTML = collectBtn.innerHTML;
        collectBtn.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0px; border-radius: 9999px; color: rgb(239, 68, 68); width: 34.75px; height: 34.75px; background-color: rgba(239, 68, 68, 0.1);">
            <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        `;
        
        showToast(`收藏失败: ${error.message}`, 'error');
        
        setTimeout(() => {
          collectBtn.innerHTML = originalHTML;
        }, 2000);
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

  // 构建推文URL
  const tweetUrl = window.location.href;

  return {
    content: content.trim(),
    images: images,
    tweet_created_at: tweetCreatedAt,
    tweet_url: tweetUrl
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

  // 构建推文URL
  const tweetUrl = window.location.href;

  // 验证数据完整性
  if (!content || content.length < 5) {
    throw new Error('无法提取推文内容，请确保页面中有推文文本');
  }

  console.log('提取的数据:', {
    content: content.substring(0, 100) + '...',
    images: images.length,
    tweet_created_at: tweetCreatedAt,
    tweet_url: tweetUrl
  });

  return {
    content: content.trim(),
    images: images,
    tweet_created_at: tweetCreatedAt,
    tweet_url: tweetUrl
  };
} 