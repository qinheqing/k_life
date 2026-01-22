#!/bin/bash

# K-Life Backend Server Management Script
# 用法: ./start-backend.sh [start|stop|restart|status|logs]

PORT=3004
SERVER_DIR="server"
LOG_DIR="logs"
LOG_FILE="logs/server.log"
PID_FILE="logs/server.pid"

cd "$(dirname "$0")"

# 创建日志目录
mkdir -p "$LOG_DIR"
touch "$LOG_FILE"
touch "$PID_FILE"

case "$1" in
  start)
    echo "🚀 Starting backend server..."
    cd "$SERVER_DIR" && nohup npm start > "../$LOG_FILE" 2>&1 &
    echo $! > "../$PID_FILE"
    sleep 2
    if lsof -ti:$PORT > /dev/null 2>&1; then
      echo "✅ Backend server started successfully!"
      echo "📊 Admin panel: http://localhost:$PORT/admin"
      echo "📝 Logs: tail -f $LOG_FILE"
    else
      echo "❌ Failed to start backend server"
      echo "📝 Check logs: $LOG_FILE"
    fi
    ;;

  stop)
    echo "🛑 Stopping backend server..."
    if [ -f "../$PID_FILE" ]; then
      PID=$(cat "../$PID_FILE")
      kill $PID 2>/dev/null
      rm "../$PID_FILE"
      echo "✅ Backend server stopped"
    else
      kill $(lsof -ti:$PORT) 2>/dev/null
      echo "✅ Backend server stopped (forced)"
    fi
    ;;

  restart)
    echo "🔄 Restarting backend server..."
    "$0" stop
    sleep 1
    "$0" start
    ;;

  status)
    echo "📊 Checking backend status..."
    if lsof -ti:$PORT > /dev/null 2>&1; then
      echo "✅ Backend server is RUNNING"
      echo "📍 Port: $PORT"
      echo "🔗 Admin: http://localhost:$PORT/admin"
      if [ -f "../$PID_FILE" ]; then
        echo "🆔 PID: $(cat "../$PID_FILE")"
      fi
    else
      echo "❌ Backend server is NOT running"
    fi
    ;;

  logs)
    echo "📝 Showing backend logs..."
    if [ -f "../$LOG_FILE" ]; then
      tail -f "../$LOG_FILE"
    else
      echo "❌ Log file not found: $LOG_FILE"
    fi
    ;;

  *)
    echo "📚 K-Life Backend Server Management"
    echo ""
    echo "用法: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "命令:"
    echo "  start    - 启动后端服务器"
    echo "  stop     - 停止后端服务器"
    echo "  restart  - 重启后端服务器"
    echo "  status   - 查看服务器状态"
    echo "  logs     - 查看实时日志"
    echo ""
    echo "示例:"
    echo "  $0 start     # 启动"
    echo "  $0 status    # 检查状态"
    echo "  $0 logs      # 查看日志"
    echo "  $0 restart   # 重启"
    exit 1
    ;;
esac
