#!/bin/bash

# K-Life PM2 管理脚本
# 用法: ./pm2-manage.sh [dev|prod] [start|stop|restart|status|logs|clean]

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENV=$1
COMMAND=$2

# 创建日志目录
mkdir -p logs

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2未安装${NC}"
    echo "请运行: npm install -g pm2"
    exit 1
fi

# 显示帮助
show_help() {
    echo -e "${BLUE}📚 K-Life PM2 管理脚本${NC}"
    echo ""
    echo -e "${YELLOW}用法: $0 [dev|prod] [命令]${NC}"
    echo ""
    echo -e "${GREEN}环境:${NC}"
    echo "  dev   - 开发环境（前端开发服务器 + 后端开发模式）"
    echo "  prod  - 生产环境（前端预览服务器 + 后端集群模式）"
    echo ""
    echo -e "${GREEN}命令:${NC}"
    echo "  start    - 启动服务"
    echo "  stop     - 停止服务"
    echo "  restart  - 重启服务"
    echo "  status   - 查看状态"
    echo "  logs     - 查看日志"
    echo "  clean    - 清理PM2进程"
    echo "  monitor  - 实时监控"
    echo ""
    echo -e "${GREEN}示例:${NC}"
    echo "  $0 dev start        # 启动开发环境"
    echo "  $0 prod start       # 启动生产环境"
    echo "  $0 dev logs        # 查看开发环境日志"
    echo "  $0 dev status      # 查看开发环境状态"
    echo "  $0 prod restart    # 重启生产环境"
    echo "  $0 clean           # 清理所有PM2进程"
    exit 0
}

# 获取应用列表
get_apps() {
    case $ENV in
        dev)
            echo "life-destiny-backend-dev life-destiny-frontend-dev"
            ;;
        prod)
            echo "life-destiny-backend-prod life-destiny-frontend-prod"
            ;;
        *)
            echo "life-destiny-backend-dev life-destiny-frontend-dev life-destiny-backend-prod life-destiny-frontend-prod"
            ;;
    esac
}

# 检查应用是否运行
check_apps_running() {
    local apps=($1)
    local running=0

    for app in "${apps[@]}"; do
        if pm2 describe $app > /dev/null 2>&1; then
            running=$((running + 1))
        fi
    done

    return $running
}

# 启动服务
start_services() {
    local apps=$(get_apps)

    echo -e "${BLUE}🚀 启动 $ENV 环境服务...${NC}"
    pm2 start ecosystem.config.cjs --only $(echo $apps | tr ' ' ',')

    sleep 2

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服务启动成功！${NC}"
        show_status
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        exit 1
    fi
}

# 停止服务
stop_services() {
    local apps=$(get_apps)

    echo -e "${YELLOW}🛑 停止 $ENV 环境服务...${NC}"
    pm2 stop $apps

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服务已停止${NC}"
    else
        echo -e "${RED}❌ 停止服务失败${NC}"
        exit 1
    fi
}

# 重启服务
restart_services() {
    local apps=$(get_apps)

    echo -e "${BLUE}🔄 重启 $ENV 环境服务...${NC}"
    pm2 restart $apps

    sleep 2

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服务重启成功！${NC}"
        show_status
    else
        echo -e "${RED}❌ 重启服务失败${NC}"
        exit 1
    fi
}

# 显示状态
show_status() {
    local apps=$(get_apps)

    echo -e "${BLUE}📊 $ENV 环境服务状态:${NC}"
    echo ""
    pm2 list | grep -E "($(echo $apps | tr ' ' '|'))"
    echo ""

    # 显示访问URL
    if [ "$ENV" == "dev" ]; then
        echo -e "${GREEN}📍 访问地址:${NC}"
        echo -e "  前端: http://localhost:3003"
        echo -e "  后端: http://localhost:3004/api"
        echo -e "  管理面板: http://localhost:3004/admin"
    elif [ "$ENV" == "prod" ]; then
        echo -e "${GREEN}📍 访问地址:${NC}"
        echo -e "  前端: http://localhost:3003"
        echo -e "  后端: http://localhost:3004/api"
        echo -e "  管理面板: http://localhost:3004/admin"
    fi
    echo ""
}

# 查看日志
show_logs() {
    local apps=$(get_apps)
    pm2 logs $apps --lines 50
}

# 清理PM2
clean_pm2() {
    echo -e "${YELLOW}🧹 清理所有PM2进程...${NC}"
    pm2 delete all

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PM2已清理${NC}"
    else
        echo -e "${RED}❌ 清理失败${NC}"
        exit 1
    fi
}

# 实时监控
monitor_services() {
    pm2 monit
}

# 主逻辑
if [ -z "$ENV" ] || [ -z "$COMMAND" ]; then
    show_help
fi

case $COMMAND in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_pm2
        ;;
    monitor)
        monitor_services
        ;;
    *)
        echo -e "${RED}❌ 未知命令: $COMMAND${NC}"
        echo ""
        show_help
        ;;
esac
