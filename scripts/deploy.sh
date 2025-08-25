#!/bin/bash

echo "🚀 Twitter Content Showcase 部署脚本"
echo "===================================="

# 检查Git状态
echo "📋 检查Git状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  有未提交的更改，正在提交..."
    git add .
    git commit -m "Auto commit before deployment"
else
    echo "✅ 工作目录干净"
fi

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main

echo ""
echo "🎉 代码已推送到GitHub！"
echo ""
echo "📝 下一步操作："
echo "1. 访问 https://vercel.com"
echo "2. 导入你的GitHub仓库"
echo "3. 配置环境变量："
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "4. 点击部署"
echo ""
echo "🔗 相关链接："
echo "- Supabase: https://supabase.com"
echo "- Vercel: https://vercel.com"
echo "- 项目文档: ./DEPLOYMENT.md" 