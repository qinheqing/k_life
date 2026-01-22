#!/bin/bash

# K-Life 快速启动脚本（PM2版）
# 一键启动所有服务

echo -e "\033[1;34m🚀 K-Life 一键启动（PM2管理）\033[0m"
echo ""

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "\033[1;31m❌ PM2未安装\033[0m"
    echo "请运行: npm install -g pm2"
    exit 1
fi

# 检查是否已有进程运行
echo -e "\033[1;33m📊 检查现有进程...\033[0m"
if pm2 list | grep -q "online"; then
    echo -e "\033[1;32m✅ 发现运行中的服务\033[0m"
    pm2 list
    echo ""
    echo -e "\033[1;33m💡 提示: 使用 ./pm2-manage.sh dev restart 重启服务\033[0m"
    echo ""
    echo -e "\033[1;34m📍 访问地址:\033[0m"
    echo -e "  前端: \033[1;36mhttp://localhost:3003\033[0m"
    echo -e "  后端: \033[1;36mhttp://localhost:3004/api\033[0m"
    echo -e "  管理: \033[1;36mhttp://localhost:3004/admin\033[0m"
    exit 0
fi

# 启动服务
echo -e "\033[1;33m🔄 正在启动开发环境...\033[0m"
./pm2-manage.sh dev start

# 等待服务启动
sleep 3

# 显示状态
echo ""
./pm2-manage.sh dev status

echo ""
echo -e "\033[1;32m✅ K-Life 服务启动完成！\033[0m"
echo ""
echo -e "\033[1;34m📝 常用命令:\033[0m"
echo "  ./pm2-manage.sh dev status   - 查看状态"
echo "  ./pm2-manage.sh dev logs    - 查看日志"
echo "  ./pm2-manage.sh dev restart - 重启服务"
echo "  ./pm2-manage.sh dev stop    - 停止服务"
echo "  ./pm2-manage.sh clean       - 清理所有"
echo ""
echo -e "\033[1;34m📖 完整文档: PM2_GUIDE.md\033[0m"
