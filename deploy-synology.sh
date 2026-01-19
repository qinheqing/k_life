#!/bin/bash
# 快速部署脚本 - 群晖 NAS 专用
# Quick Deploy Script for Synology NAS

set -e

IMAGE="qinheqing/k-life:latest"
CONTAINER_NAME="k-life"
HOST_PORT="3003"
CONTAINER_PORT="3003"

echo "========================================="
echo "🚀 K-Life 群晖快速部署脚本"
echo "========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

echo "✅ Docker 已安装"
echo ""

# 检查是否已存在同名容器
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  发现已存在的容器: ${CONTAINER_NAME}"
    read -p "是否删除并重新创建？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  删除旧容器..."
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME}
        echo "✅ 旧容器已删除"
    else
        echo "❌ 取消部署"
        exit 1
    fi
fi

# 拉取最新镜像
echo "📥 拉取最新镜像: ${IMAGE}"
docker pull ${IMAGE}

# 创建并启动容器
echo ""
echo "🚀 启动容器..."
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${HOST_PORT}:${CONTAINER_PORT} \
  -e TZ=Asia/Shanghai \
  ${IMAGE}

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 3

# 检查容器状态
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo ""
    echo "========================================="
    echo "✅ 部署成功！"
    echo "========================================="
    echo ""
    echo "📱 访问地址:"
    echo "   http://localhost:${HOST_PORT}"
    echo ""
    echo "🌐 局域网访问:"
    echo "   http://$(hostname -I | awk '{print $1}'):${HOST_PORT}"
    echo ""
    echo "📊 查看日志:"
    echo "   docker logs -f ${CONTAINER_NAME}"
    echo ""
    echo "🛑 停止服务:"
    echo "   docker stop ${CONTAINER_NAME}"
    echo ""
    echo "🔄 重启服务:"
    echo "   docker restart ${CONTAINER_NAME}"
    echo ""
else
    echo ""
    echo "❌ 部署失败，请检查日志："
    echo "   docker logs ${CONTAINER_NAME}"
    exit 1
fi
