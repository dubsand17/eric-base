# 部署指南

## 1. 数据库设置 (Supabase)

### 创建Supabase项目
1. 访问 [Supabase](https://supabase.com) 并注册账户
2. 点击 "New Project"
3. 选择组织，输入项目名称
4. 设置数据库密码
5. 选择地区（建议选择离你最近的）
6. 等待项目创建完成

### 创建数据库表
1. 在Supabase控制台中，进入 "SQL Editor"
2. 复制 `database/init.sql` 的内容
3. 粘贴到编辑器中并执行

### 获取API密钥
1. 在项目设置中找到 "API" 部分
2. 复制 "Project URL" 和 "anon public" 密钥

## 2. 本地开发

### 设置环境变量
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 启动开发服务器
```bash
yarn dev
```

访问 http://localhost:3000

## 3. 部署到Vercel

### 准备GitHub仓库
1. 在GitHub创建新仓库
2. 推送代码到仓库：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 部署到Vercel
1. 访问 [Vercel](https://vercel.com) 并注册
2. 点击 "New Project"
3. 导入你的GitHub仓库
4. 在环境变量中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 点击 "Deploy"

## 4. Chrome扩展设置

### 安装扩展
1. 打开Chrome扩展管理页面 (`chrome://extensions/`)
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目中的 `chrome-extension` 文件夹

### 配置API地址
1. 编辑 `chrome-extension/popup.js`
2. 将 `YOUR_VERCEL_URL` 替换为你的实际Vercel部署URL
3. 重新加载扩展

## 5. 使用说明

### 采集Twitter内容
1. 在Twitter上浏览想要采集的推文
2. 点击Chrome扩展图标
3. 点击"采集当前推文"
4. 内容会自动保存到数据库

### 查看网站
访问你的Vercel部署URL查看采集的内容

## 6. 故障排除

### 常见问题
1. **Supabase连接失败**
   - 检查环境变量是否正确
   - 确认Supabase项目是否正常运行

2. **Chrome扩展无法采集**
   - 确认在Twitter页面上使用
   - 检查网络连接
   - 查看浏览器控制台错误信息

3. **图片无法显示**
   - 确认Twitter图片域名已在 `next.config.js` 中配置
   - 检查图片URL是否有效

### 调试技巧
- 使用浏览器开发者工具查看网络请求
- 检查Supabase控制台中的日志
- 查看Vercel部署日志 