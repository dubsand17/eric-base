document.addEventListener('DOMContentLoaded', function() {
  const collectBtn = document.getElementById('collectBtn');
  const statusDiv = document.getElementById('status');

  collectBtn.addEventListener('click', async function() {
    collectBtn.disabled = true;
    statusDiv.textContent = '正在采集推文数据...';
    statusDiv.className = 'status';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('twitter.com') && !tab.url.includes('x.com')) {
        throw new Error('请在Twitter/X页面上使用此扩展');
      }

      const result = await chrome.tabs.sendMessage(tab.id, { action: 'collectTweet' });
      
      if (result.success) {
        statusDiv.textContent = '数据采集完成，正在保存...';
        
        // 显示采集到的数据预览
        const preview = `
          内容: ${result.data.content.substring(0, 50)}...
          图片: ${result.data.images.length} 张
          时间: ${new Date(result.data.tweet_created_at).toLocaleString()}
        `;
        console.log('采集预览:', preview);

        // 发送到你的API
        const response = await fetch('https://eric-base-pi.vercel.app/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result.data)
        });

        if (response.ok) {
          const savedData = await response.json();
          statusDiv.textContent = `采集成功！已保存到数据库 (ID: ${savedData.id})`;
          statusDiv.className = 'status success';
          
          // 3秒后重置状态
          setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
          }, 3000);
        } else {
          const errorData = await response.json();
          throw new Error(`保存失败: ${errorData.error || '未知错误'}`);
        }
      } else {
        throw new Error(result.error || '采集失败，请确保页面中有推文内容');
      }
    } catch (error) {
      statusDiv.textContent = `错误: ${error.message}`;
      statusDiv.className = 'status error';
      
      // 5秒后重置状态
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
      }, 5000);
    } finally {
      collectBtn.disabled = false;
    }
  });
}); 