#!/bin/bash

echo "🚀 Twitter Content Showcase 项目设置脚本"
echo "=========================================="

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装项目依赖..."
yarn install

# 创建环境变量文件
echo "🔧 创建环境变量文件..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ 已创建 .env.local 文件"
    echo "⚠️  请编辑 .env.local 文件，添加你的Supabase配置"
else
    echo "✅ .env.local 文件已存在"
fi

# 检查端口是否被占用
echo "🔍 检查端口3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口3000已被占用，请关闭其他服务"
else
    echo "✅ 端口3000可用"
fi

echo ""
echo "🎉 设置完成！"
echo ""
echo "📝 下一步操作："
echo "1. 编辑 .env.local 文件，添加Supabase配置"
echo "2. 运行 'yarn dev' 启动开发服务器"
echo "3. 访问 http://localhost:3000 查看效果"
echo ""
echo "📚 更多信息请查看："
echo "- README.md - 项目说明"
echo "- DEPLOYMENT.md - 部署指南"
echo "- PROJECT_SUMMARY.md - 项目总结" 