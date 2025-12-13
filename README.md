# Twitter Content Showcase

私人知识收藏系统 - 使用Chrome扩展从Twitter采集内容，在个人网站展示。

---

## 🚀 快速开始

### 1. 环境配置

#### 1.1 安装依赖
```bash
yarn install
```

#### 1.2 配置环境变量
复制 `.env.local` 模板：
```bash
cp env.example .env.local
```

编辑 `.env.local` 填入你的Supabase凭证：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

> 💡 **获取Supabase凭证**: 在Supabase项目设置 → API → Project URL 和 anon public key

#### 1.3 启动开发服务器
```bash
yarn dev
```

访问 http://localhost:3000 查看网站

---

## 📦 Chrome扩展配置

### 2.1 加载扩展到Chrome

1. 打开Chrome扩展管理页面：
   ```
   chrome://extensions/
   ```

2. 开启**开发者模式**（右上角开关）

3. 点击**加载已解压的扩展程序**

4. 选择项目中的 `chrome-extension` 文件夹

5. 扩展加载成功后会显示在工具栏

### 2.2 配置API地址

**开发环境** (localhost)  
扩展默认配置为 `http://localhost:3000/api/posts`，无需修改即可使用。

**生产环境** (部署后)  
编辑 `chrome-extension/popup.js`，修改第31行：
```javascript
const response = await fetch('https://your-domain.vercel.app/api/posts', {
  // ...
});
```

同时更新 `chrome-extension/manifest.json` 的 `host_permissions`:
```json
"host_permissions": [
  "https://twitter.com/*",
  "https://x.com/*",
  "https://your-domain.vercel.app/*"  // 改为你的域名
]
```

修改后需要在 `chrome://extensions/` 点击**重新加载**扩展。

---

## 📝 使用方法

### 采集Twitter内容

1. **打开Twitter/X网站**  
   访问 https://twitter.com 或 https://x.com

2. **浏览到想保存的推文**  
   滚动到任意推文（支持文字、图片、多图）

3. **点击扩展图标**  
   点击浏览器工具栏的扩展图标

4. **点击"采集当前推文"按钮**  
   扩展会自动：
   - 提取推文内容、图片、时间
   - 发送到你的API
   - 保存到Supabase数据库

5. **查看采集结果**  
   - 成功：显示 "采集成功！已保存到数据库"
   - 失败：显示错误信息

### 查看已采集内容

刷新网站主页即可看到所有采集的推文以瀑布流形式展示。

---

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| UI库 | React 18 |
| 样式 | Tailwind CSS |
| 数据库 | Supabase (PostgreSQL) |
| 采集工具 | Chrome Extension (Manifest V3) |
| 语言 | TypeScript |
| 部署 | Vercel |

---

## 📂 项目结构

```
eric-base/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── crypto/              # 加密货币价格API
│   │   └── posts/               # 推文数据API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # React组件 (分类结构)
│   ├── ui/                      # 基础UI组件
│   ├── layout/                  # 布局组件
│   ├── features/                # 功能组件
│   │   ├── crypto/
│   │   ├── trading/
│   │   └── image/
│   ├── posts/                   # 推文相关
│   └── shared/                  # 共享组件
│
├── chrome-extension/             # Chrome扩展
│   ├── manifest.json            # 扩展配置
│   ├── popup.html               # 弹窗UI
│   ├── popup.js                 # 弹窗逻辑
│   └── content.js               # 页面内容脚本
│
├── lib/                         # 工具库
│   └── supabase.ts              # Supabase客户端
│
├── database/                     # 数据库脚本
│   └── init.sql                 # 建表SQL
│
└── scripts/                      # 辅助脚本
```

---

## 🔧 常见问题

### Q: 扩展提示"请在Twitter/X页面上使用"
**A:** 确保你在 `twitter.com` 或 `x.com` 域名下使用扩展。

### Q: 采集失败，显示"保存失败"
**A:** 检查：
1. 开发服务器是否运行 (`yarn dev`)
2. `.env.local` 配置是否正确
3. Supabase数据库表是否已创建

### Q: 图片无法显示
**A:** 确认 `next.config.js` 中已添加Twitter图片域名：
```javascript
images: {
  domains: ['pbs.twimg.com'],
}
```

### Q: 扩展修改后不生效
**A:** 在 `chrome://extensions/` 点击扩展的**重新加载**按钮。

---

## 📊 功能特性

✅ Chrome扩展一键采集Twitter内容  
✅ 瀑布流网格布局展示  
✅ 多图预览与大图查看  
✅ 明暗主题切换  
✅ 显示模式切换（仅图片/全内容）  
✅ 时间格式切换（相对时间/绝对时间）  
✅ 加密货币价格悬浮ticker  
✅ 建仓计算器工具  
✅ TradingView图表集成  
✅ 响应式设计（移动端适配）

---

## 🔒 隐私说明

这是一个**完全私有**的项目：
- 数据存储在你的个人Supabase实例
- Chrome扩展仅在本地浏览器运行
- 不会向第三方发送任何数据
- 所有采集的内容仅你自己可见

---

## 📝 开发命令

```bash
# 开发
yarn dev          # 启动开发服务器 (http://localhost:3000)

# 构建
yarn build        # 生产构建

# 类型检查
yarn type-check   # TypeScript类型检查
```

---

**私有项目** | 个人知识管理系统