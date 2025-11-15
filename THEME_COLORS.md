# 赛博朋克交易终端配色 Cyberpunk Trading Terminal

本项目采用**赛博朋克风格**交易终端配色，融合金属质感、霓虹光效和未来科技美学。

## 配色理念

- **日间模式**：金属灰蓝 + 电子蓝，工业科技感，银色金属质感
- **夜间模式**：深空黑 + 霓虹青，赛博朋克氛围，强烈霓虹发光

## 核心配色

### 背景色
- **主背景（body）**
  - 日间：`#e4e8ed` - 金属灰蓝，铝合金质感
  - 夜间：`#0a0d12` - 深空黑，碳纤维质感
  
- **次级背景（卡片/面板）**
  - 日间：`#f8f9fb` - 银白金属，钢板质感
  - 夜间：`#12161d` - 碳纤维黑，高科技面板

### 强调色 - 黄金色
- **主强调色（按钮、链接、焦点）**
  - 日间：`#d4af37` - 经典金色（优雅沉稳）
  - 夜间：`#ffd700` - 标准金色（明亮闪耀）

### 交易涨跌色 - 霓虹光效
- **涨（买入/UP）- 霓虹绿**
  - 主色：`#00ff9f` - 霓虹绿（荧光绿）
  - 亮色：`#5affcd` - 高亮霓虹绿
  - 暗色：`#00d981` - 深霓虹绿
  - 发光：`rgba(0, 255, 159, 0.6)` - 强霓虹发光

- **跌（卖出/DOWN）- 霓虹红**
  - 主色：`#ff0055` - 霓虹红/粉（电子红）
  - 亮色：`#ff5588` - 高亮霓虹红
  - 暗色：`#d9003d` - 深霓虹红
  - 发光：`rgba(255, 0, 85, 0.6)` - 强霓虹发光

### 边框色 - 金属质感
- 日间：`#b8c5d6` - 银色金属边框，不锈钢质感
- 夜间：`#1e2732` - 钛合金灰，暗色金属边框

### 文本色
- **主要文本**
  - 日间：`#1a2332`
  - 夜间：`#e6edf3`

- **次要文本**
  - 日间：`#4b5d75`
  - 夜间：`#8b949e`

- **静音文本**
  - 日间：`#6b7b8f`
  - 夜间：`#6e7681`

## 视觉效果 - 赛博朋克霓虹风格

### 滚动条 - 金属高光
- 渐变 + 金属高光效果
- 日间：电子蓝渐变 (`#38bdf8` → `#0ea5e9`) + 内部白色高光
- 夜间：霓虹青渐变 (`#22d3ee` → `#00d9ff`) + 白色金属光
- hover时：增强发光 + 高光更明显

### 卡片悬停 - 霓虹边框
- 发光阴影：`0 8px 24px rgba(0,217,255,0.25)`
- 边框高亮：霓虹青发光边框
- 无模糊效果：实心硬边

### 涨跌脉冲动画 - 三层霓虹发光
- **外层扩散光环**：0-12px扩散
- **内部发光**：inset 0-25px
- **整体发光**：0-15px霓虹光晕
- 边框颜色：霓虹色动画
- 背景色：霓虹色淡入淡出
- 持续时间：1.1秒

### 实心终端风格（无玻璃态）
- ❌ 无 `backdrop-blur`
- ✅ 实心背景
- ✅ 粗边框 `border-2`
- ✅ 锐利圆角 `rounded-lg`
- ✅ 强霓虹发光效果

## 使用方式

在Tailwind中直接使用预定义的颜色变量：

```tsx
// 背景
className="bg-terminal-surface-light dark:bg-terminal-surface-dark"

// 文本
className="text-terminal-text-primary-light dark:text-terminal-text-primary-dark"

// 边框
className="border-terminal-border-light dark:border-terminal-border-dark"

// 强调色
className="text-terminal-accent-light dark:text-terminal-accent-dark"

// 涨跌色
className="text-terminal-up"  // 绿色
className="text-terminal-down"  // 红色
```

## 主题切换

项目支持日间/夜间主题切换，通过 `dark:` 前缀自动应用相应配色。

## 文件位置

- 主配色定义：`tailwind.config.js`
- CSS变量和动画：`app/globals.css`
- 应用示例：
  - `components/TwitterCard.tsx`
  - `components/Navbar.tsx`
  - 其他组件...
